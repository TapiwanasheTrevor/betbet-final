"""
BetBet Betting Market Service
Handles market creation, trading, order book, and pool betting
"""

import os
import uuid
import json
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from decimal import Decimal

from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func, desc
from sqlalchemy.orm import selectinload

import sys
sys.path.append('../..')
from shared.database import (
    init_all_databases, close_all_databases, get_db,
    get_redis_client
)
from shared.clerk_auth import (
    ClerkUser, get_current_user, get_current_user_optional,
    require_market_creation_permission, require_kyc_level,
    verify_websocket_token
)
from shared.models import (
    Market, MarketOutcome, MarketPosition, UserProfile,
    MarketCreate, MarketResponse
)


# WebSocket manager for market updates
class MarketWebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, market_id: str):
        await websocket.accept()
        if market_id not in self.active_connections:
            self.active_connections[market_id] = []
        self.active_connections[market_id].append(websocket)

    def disconnect(self, websocket: WebSocket, market_id: str):
        if market_id in self.active_connections:
            if websocket in self.active_connections[market_id]:
                self.active_connections[market_id].remove(websocket)

    async def broadcast_to_market(self, market_id: str, message: dict):
        if market_id not in self.active_connections:
            return

        disconnected = []
        for connection in self.active_connections[market_id]:
            try:
                await connection.send_json(message)
            except:
                disconnected.append(connection)

        # Clean up disconnected clients
        for conn in disconnected:
            if conn in self.active_connections[market_id]:
                self.active_connections[market_id].remove(conn)


market_manager = MarketWebSocketManager()


# Lifespan manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting Betting Market Service...")
    await init_all_databases()
    yield
    print("Shutting down Betting Market Service...")
    await close_all_databases()


# Create FastAPI app
app = FastAPI(
    title="BetBet Betting Market Service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Market Discovery Endpoints
# =============================================================================

@app.get("/api/v1/markets")
async def list_markets(
    category: Optional[str] = None,
    status: str = 'open',
    sort_by: str = 'volume',
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """List markets - maps to Main Marketplace View"""
    try:
        offset = (page - 1) * limit

        query = (
            select(Market)
            .options(selectinload(Market.creator))
            .where(Market.status == status)
        )

        if category:
            query = query.where(Market.category == category)

        # Sort options
        if sort_by == 'volume':
            query = query.order_by(desc(Market.total_volume))
        elif sort_by == 'created':
            query = query.order_by(desc(Market.created_at))
        elif sort_by == 'closing':
            query = query.order_by(Market.closes_at)
        else:
            query = query.order_by(desc(Market.total_volume))

        query = query.offset(offset).limit(limit)

        result = await db.execute(query)
        markets = result.scalars().all()

        return {
            "markets": [
                {
                    "id": str(market.id),
                    "title": market.title,
                    "description": market.description,
                    "category": market.category,
                    "market_type": market.market_type,
                    "status": market.status,
                    "total_volume": float(market.total_volume),
                    "participant_count": market.participant_count,
                    "creator": {
                        "username": market.creator.username,
                        "display_name": market.creator.display_name
                    },
                    "closes_at": market.closes_at,
                    "created_at": market.created_at
                }
                for market in markets
            ],
            "page": page,
            "limit": limit
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list markets: {str(e)}")


@app.get("/api/v1/markets/trending")
async def get_trending_markets(limit: int = 10, db: AsyncSession = Depends(get_db)):
    """Get trending markets - maps to Trending Markets section"""
    try:
        # Markets with highest volume in last 24 hours
        result = await db.execute(
            select(Market)
            .options(selectinload(Market.creator))
            .where(
                and_(
                    Market.status == 'open',
                    Market.created_at >= datetime.utcnow() - timedelta(hours=24)
                )
            )
            .order_by(desc(Market.total_volume))
            .limit(limit)
        )

        markets = result.scalars().all()

        return {
            "trending_markets": [
                {
                    "id": str(market.id),
                    "title": market.title,
                    "category": market.category,
                    "total_volume": float(market.total_volume),
                    "participant_count": market.participant_count,
                    "creator_username": market.creator.username,
                    "volume_change_24h": 0,  # TODO: Calculate actual change
                    "closes_at": market.closes_at
                }
                for market in markets
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get trending markets: {str(e)}")


@app.get("/api/v1/markets/{market_id}")
async def get_market_details(market_id: str, db: AsyncSession = Depends(get_db)):
    """Get market details - maps to Market Cards"""
    try:
        market_uuid = uuid.UUID(market_id)

        result = await db.execute(
            select(Market)
            .options(selectinload(Market.creator))
            .where(Market.id == market_uuid)
        )
        market = result.scalar_one_or_none()

        if not market:
            raise HTTPException(status_code=404, detail="Market not found")

        # Get outcomes
        outcomes_result = await db.execute(
            select(MarketOutcome).where(MarketOutcome.market_id == market_uuid)
        )
        outcomes = outcomes_result.scalars().all()

        return {
            "id": str(market.id),
            "title": market.title,
            "description": market.description,
            "category": market.category,
            "market_type": market.market_type,
            "status": market.status,
            "total_volume": float(market.total_volume),
            "participant_count": market.participant_count,
            "creator": {
                "username": market.creator.username,
                "display_name": market.creator.display_name
            },
            "creator_fee_percent": float(market.creator_fee_percent),
            "resolution_source": market.resolution_source,
            "oracle_type": market.oracle_type,
            "opens_at": market.opens_at,
            "closes_at": market.closes_at,
            "resolved_at": market.resolved_at,
            "resolution_value": market.resolution_value,
            "outcomes": [
                {
                    "id": str(outcome.id),
                    "outcome_text": outcome.outcome_text,
                    "outcome_value": outcome.outcome_value,
                    "current_odds": float(outcome.current_odds) if outcome.current_odds else None,
                    "total_backed": float(outcome.total_backed),
                    "is_winner": outcome.is_winner
                }
                for outcome in outcomes
            ],
            "created_at": market.created_at
        }

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid market ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get market details: {str(e)}")


@app.get("/api/v1/markets/categories")
async def get_market_categories(db: AsyncSession = Depends(get_db)):
    """Get categories - maps to Category Grid"""
    try:
        result = await db.execute(
            select(Market.category, func.count(Market.id).label('count'))
            .where(Market.status == 'open')
            .group_by(Market.category)
            .order_by(Market.category)
        )

        categories = [
            {
                "name": row.category,
                "count": row.count
            }
            for row in result
        ]

        return {"categories": categories}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get categories: {str(e)}")


# =============================================================================
# Market Creation Endpoints
# =============================================================================

@app.post("/api/v1/markets/create", response_model=MarketResponse)
async def create_market(
    market_data: MarketCreate,
    current_user: ClerkUser = Depends(require_market_creation_permission),
    db: AsyncSession = Depends(get_db)
):
    """Create market - maps to Market Builder Wizard"""
    try:
        # Get user profile
        profile_result = await db.execute(
            select(UserProfile).where(UserProfile.clerk_user_id == current_user.id)
        )
        profile = profile_result.scalar_one_or_none()

        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Create market
        market = Market(
            title=market_data.title,
            description=market_data.description,
            category=market_data.category,
            market_type=market_data.market_type,
            creator_clerk_id=current_user.id,
            creator_profile_id=profile.id,
            resolution_source=market_data.resolution_source,
            oracle_type='manual',  # Default to manual resolution
            opens_at=datetime.utcnow(),
            closes_at=market_data.closes_at
        )

        db.add(market)
        await db.flush()  # Get the ID

        # Create outcomes
        for i, outcome_text in enumerate(market_data.outcomes):
            outcome = MarketOutcome(
                market_id=market.id,
                outcome_text=outcome_text,
                outcome_value=str(i),
                current_odds=Decimal('2.0'),  # Default odds
                total_backed=Decimal('0')
            )
            db.add(outcome)

        await db.commit()
        await db.refresh(market)

        # Cache market data in Redis
        redis_client = get_redis_client()
        await redis_client.setex(
            f"market:{market.id}",
            3600,  # 1 hour cache
            json.dumps({
                "id": str(market.id),
                "title": market.title,
                "status": market.status,
                "total_volume": float(market.total_volume)
            })
        )

        return market

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create market: {str(e)}")


@app.post("/api/v1/markets/{market_id}/resolve")
async def resolve_market(
    market_id: str,
    resolution_data: dict,
    current_user: ClerkUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Resolve market - maps to Resolution Criteria"""
    try:
        market_uuid = uuid.UUID(market_id)

        # Get market
        result = await db.execute(
            select(Market).where(Market.id == market_uuid)
        )
        market = result.scalar_one_or_none()

        if not market:
            raise HTTPException(status_code=404, detail="Market not found")

        # Check permissions (only creator or admin can resolve)
        if market.creator_clerk_id != current_user.id:
            # TODO: Check if user is admin
            raise HTTPException(status_code=403, detail="Only market creator can resolve")

        if market.status != 'closed':
            raise HTTPException(status_code=400, detail="Market must be closed to resolve")

        # Update market
        winning_outcome_id = resolution_data.get("winning_outcome_id")
        resolution_value = resolution_data.get("resolution_value")

        market.status = 'resolved'
        market.resolved_at = datetime.utcnow()
        market.resolution_value = resolution_value

        # Mark winning outcome
        if winning_outcome_id:
            await db.execute(
                update(MarketOutcome)
                .where(MarketOutcome.market_id == market_uuid)
                .values(is_winner=False)
            )

            await db.execute(
                update(MarketOutcome)
                .where(MarketOutcome.id == uuid.UUID(winning_outcome_id))
                .values(is_winner=True)
            )

        await db.commit()

        # Process payouts (simplified)
        await process_market_payouts(market_uuid, db)

        # Broadcast resolution
        await market_manager.broadcast_to_market(
            market_id,
            {
                "type": "market_resolved",
                "market_id": market_id,
                "winning_outcome": winning_outcome_id,
                "resolution_value": resolution_value
            }
        )

        return {"status": "success", "resolution_value": resolution_value}

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid market ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resolve market: {str(e)}")


# =============================================================================
# Trading Endpoints
# =============================================================================

@app.post("/api/v1/markets/{market_id}/positions")
async def place_position(
    market_id: str,
    position_data: dict,
    current_user: ClerkUser = Depends(require_kyc_level(1)),
    db: AsyncSession = Depends(get_db)
):
    """Place position - maps to Order Placement Panel"""
    try:
        market_uuid = uuid.UUID(market_id)
        outcome_id = uuid.UUID(position_data["outcome_id"])

        # Get market
        result = await db.execute(
            select(Market).where(Market.id == market_uuid)
        )
        market = result.scalar_one_or_none()

        if not market or market.status != 'open':
            raise HTTPException(status_code=400, detail="Market not available for trading")

        # Get user profile
        profile_result = await db.execute(
            select(UserProfile).where(UserProfile.clerk_user_id == current_user.id)
        )
        profile = profile_result.scalar_one_or_none()

        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Validate position data
        stake = Decimal(str(position_data["stake"]))
        odds = Decimal(str(position_data["odds"]))
        position_type = position_data["position_type"]  # 'back' or 'lay'

        if stake <= 0:
            raise HTTPException(status_code=400, detail="Stake must be positive")

        # TODO: Check user has sufficient balance
        # await check_user_balance(current_user.id, stake)

        # Calculate potential payout
        if position_type == 'back':
            potential_payout = stake * odds
        else:  # lay
            potential_payout = stake * (odds - 1)

        # Create position
        position = MarketPosition(
            market_id=market_uuid,
            outcome_id=outcome_id,
            clerk_user_id=current_user.id,
            user_profile_id=profile.id,
            position_type=position_type,
            stake=stake,
            odds=odds,
            potential_payout=potential_payout
        )

        db.add(position)

        # Update market volume and participant count
        market.total_volume += stake
        if market.participant_count == 0 or not await user_has_positions_in_market(current_user.id, market_uuid, db):
            market.participant_count += 1

        # Update outcome total backed
        await db.execute(
            update(MarketOutcome)
            .where(MarketOutcome.id == outcome_id)
            .values(total_backed=MarketOutcome.total_backed + stake)
        )

        await db.commit()
        await db.refresh(position)

        # Update market odds (simplified)
        await update_market_odds(market_uuid, db)

        # Broadcast position update
        await market_manager.broadcast_to_market(
            market_id,
            {
                "type": "position_placed",
                "market_id": market_id,
                "outcome_id": str(outcome_id),
                "position_type": position_type,
                "stake": float(stake),
                "odds": float(odds),
                "total_volume": float(market.total_volume)
            }
        )

        return {
            "id": str(position.id),
            "status": "success",
            "potential_payout": float(potential_payout)
        }

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to place position: {str(e)}")


@app.get("/api/v1/markets/{market_id}/orderbook")
async def get_orderbook(market_id: str, outcome_id: str, db: AsyncSession = Depends(get_db)):
    """Get order book - maps to Order Book Display"""
    try:
        market_uuid = uuid.UUID(market_id)
        outcome_uuid = uuid.UUID(outcome_id)

        # Get recent positions for this outcome
        result = await db.execute(
            select(MarketPosition)
            .where(
                and_(
                    MarketPosition.market_id == market_uuid,
                    MarketPosition.outcome_id == outcome_uuid,
                    MarketPosition.status == 'open'
                )
            )
            .order_by(MarketPosition.created_at.desc())
            .limit(100)
        )
        positions = result.scalars().all()

        # Group by odds and aggregate volume
        back_orders = {}
        lay_orders = {}

        for position in positions:
            odds_key = float(position.odds)
            if position.position_type == 'back':
                if odds_key not in back_orders:
                    back_orders[odds_key] = 0
                back_orders[odds_key] += float(position.stake)
            else:
                if odds_key not in lay_orders:
                    lay_orders[odds_key] = 0
                lay_orders[odds_key] += float(position.stake)

        return {
            "market_id": market_id,
            "outcome_id": outcome_id,
            "back_orders": [
                {"odds": odds, "volume": volume}
                for odds, volume in sorted(back_orders.items(), reverse=True)
            ],
            "lay_orders": [
                {"odds": odds, "volume": volume}
                for odds, volume in sorted(lay_orders.items())
            ]
        }

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get orderbook: {str(e)}")


@app.get("/api/v1/users/positions")
async def get_user_positions(
    status: str = 'open',
    current_user: ClerkUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user positions - maps to Position Manager"""
    try:
        result = await db.execute(
            select(MarketPosition)
            .options(
                selectinload(MarketPosition.market),
                selectinload(MarketPosition.outcome)
            )
            .where(
                and_(
                    MarketPosition.clerk_user_id == current_user.id,
                    MarketPosition.status == status
                )
            )
            .order_by(MarketPosition.created_at.desc())
        )
        positions = result.scalars().all()

        return {
            "positions": [
                {
                    "id": str(position.id),
                    "market": {
                        "id": str(position.market.id),
                        "title": position.market.title,
                        "status": position.market.status
                    },
                    "outcome": {
                        "id": str(position.outcome.id),
                        "text": position.outcome.outcome_text
                    },
                    "position_type": position.position_type,
                    "stake": float(position.stake),
                    "odds": float(position.odds),
                    "potential_payout": float(position.potential_payout),
                    "status": position.status,
                    "created_at": position.created_at,
                    "settled_at": position.settled_at
                }
                for position in positions
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user positions: {str(e)}")


# =============================================================================
# WebSocket for Real-time Market Data
# =============================================================================

@app.websocket("/ws/markets/{market_id}")
async def market_websocket(websocket: WebSocket, market_id: str, token: Optional[str] = None):
    """WebSocket for real-time market updates"""
    try:
        # Connect (authentication optional for market data)
        await market_manager.connect(websocket, market_id)

        # Send initial market data
        db_gen = get_db()
        db = await db_gen.__anext__()

        try:
            result = await db.execute(
                select(Market)
                .options(selectinload(Market.creator))
                .where(Market.id == uuid.UUID(market_id))
            )
            market = result.scalar_one_or_none()

            if market:
                await websocket.send_json({
                    "type": "market_data",
                    "market": {
                        "id": str(market.id),
                        "title": market.title,
                        "status": market.status,
                        "total_volume": float(market.total_volume),
                        "participant_count": market.participant_count
                    }
                })

        finally:
            await db.close()

        # Keep connection alive
        while True:
            try:
                data = await websocket.receive_json()
                if data.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except:
                break

    except WebSocketDisconnect:
        market_manager.disconnect(websocket, market_id)
    except Exception as e:
        print(f"Market WebSocket error: {e}")
        await websocket.close(code=1011, reason="Internal server error")


# =============================================================================
# Utility Functions
# =============================================================================

async def user_has_positions_in_market(user_id: str, market_id: uuid.UUID, db: AsyncSession) -> bool:
    """Check if user already has positions in market"""
    result = await db.execute(
        select(func.count(MarketPosition.id))
        .where(
            and_(
                MarketPosition.clerk_user_id == user_id,
                MarketPosition.market_id == market_id
            )
        )
    )
    return result.scalar() > 0


async def update_market_odds(market_id: uuid.UUID, db: AsyncSession):
    """Update market odds based on positions (simplified)"""
    try:
        # Get all outcomes for the market
        result = await db.execute(
            select(MarketOutcome).where(MarketOutcome.market_id == market_id)
        )
        outcomes = result.scalars().all()

        for outcome in outcomes:
            # Simple odds calculation based on total volume
            if outcome.total_backed > 0:
                # This is a simplified calculation
                # In reality, you'd want more sophisticated odds calculation
                implied_probability = min(0.95, float(outcome.total_backed) / 100)
                new_odds = 1 / max(0.05, implied_probability)
                outcome.current_odds = Decimal(str(round(new_odds, 2)))

        await db.commit()

    except Exception as e:
        print(f"Error updating market odds: {e}")


async def process_market_payouts(market_id: uuid.UUID, db: AsyncSession):
    """Process payouts when market is resolved"""
    try:
        # Get winning outcome
        result = await db.execute(
            select(MarketOutcome)
            .where(
                and_(
                    MarketOutcome.market_id == market_id,
                    MarketOutcome.is_winner == True
                )
            )
        )
        winning_outcome = result.scalar_one_or_none()

        if not winning_outcome:
            return

        # Get all positions for winning outcome
        positions_result = await db.execute(
            select(MarketPosition)
            .where(
                and_(
                    MarketPosition.market_id == market_id,
                    MarketPosition.outcome_id == winning_outcome.id,
                    MarketPosition.position_type == 'back',
                    MarketPosition.status == 'open'
                )
            )
        )
        winning_positions = positions_result.scalars().all()

        # Mark positions as settled and calculate payouts
        for position in winning_positions:
            position.status = 'settled'
            position.settled_at = datetime.utcnow()
            # TODO: Actually credit user wallets with payouts

        await db.commit()

    except Exception as e:
        print(f"Error processing payouts: {e}")


# =============================================================================
# Health Check
# =============================================================================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "betting_market"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=True
    )