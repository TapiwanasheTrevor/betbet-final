"""
BetBet Game Engine Service
Handles game sessions, tournaments, spectators, and real-time gaming
"""

import os
import uuid
import json
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func
from sqlalchemy.orm import selectinload

import sys
sys.path.append('../..')
from shared.database import (
    init_all_databases, close_all_databases, get_db,
    get_mongo_db, get_redis_client
)
from shared.clerk_auth import (
    ClerkUser, get_current_user, get_current_user_optional,
    verify_websocket_token, require_kyc_level
)
from shared.models import (
    Game, GameSession, GamePlayer, UserProfile,
    GameSessionCreate, GameSessionResponse
)


# WebSocket connection manager
class GameWebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.user_sessions: Dict[str, str] = {}  # user_id -> session_id

    async def connect(self, websocket: WebSocket, session_id: str, user_id: str):
        await websocket.accept()

        if session_id not in self.active_connections:
            self.active_connections[session_id] = []

        self.active_connections[session_id].append(websocket)
        self.user_sessions[user_id] = session_id

    def disconnect(self, websocket: WebSocket, session_id: str, user_id: str):
        if session_id in self.active_connections:
            if websocket in self.active_connections[session_id]:
                self.active_connections[session_id].remove(websocket)

            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

        if user_id in self.user_sessions:
            del self.user_sessions[user_id]

    async def broadcast_to_session(self, session_id: str, message: dict, exclude_user: str = None):
        if session_id not in self.active_connections:
            return

        disconnected = []
        for connection in self.active_connections[session_id]:
            try:
                # Skip excluded user if specified
                if exclude_user and connection in [
                    conn for user_id, conn_session in self.user_sessions.items()
                    if conn_session == session_id and user_id == exclude_user
                ]:
                    continue

                await connection.send_json(message)
            except:
                disconnected.append(connection)

        # Clean up disconnected clients
        for conn in disconnected:
            if conn in self.active_connections[session_id]:
                self.active_connections[session_id].remove(conn)


manager = GameWebSocketManager()


# Lifespan manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting Game Engine Service...")
    await init_all_databases()
    yield
    # Shutdown
    print("Shutting down Game Engine Service...")
    await close_all_databases()


# Create FastAPI app
app = FastAPI(
    title="BetBet Game Engine Service",
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
# Game Catalog Endpoints
# =============================================================================

@app.get("/api/v1/games")
async def list_games(
    category: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """List available games - maps to Game Discovery Dashboard"""
    try:
        offset = (page - 1) * limit

        query = select(Game).where(Game.is_active == True)

        if category:
            query = query.where(Game.category == category)

        query = query.offset(offset).limit(limit).order_by(Game.name)

        result = await db.execute(query)
        games = result.scalars().all()

        # Get total count
        count_query = select(func.count(Game.id)).where(Game.is_active == True)
        if category:
            count_query = count_query.where(Game.category == category)

        total_result = await db.execute(count_query)
        total = total_result.scalar()

        return {
            "games": [
                {
                    "id": str(game.id),
                    "name": game.name,
                    "category": game.category,
                    "subcategory": game.subcategory,
                    "game_type": game.game_type,
                    "min_players": game.min_players,
                    "max_players": game.max_players,
                    "thumbnail_url": game.thumbnail_url,
                }
                for game in games
            ],
            "total": total,
            "page": page,
            "limit": limit,
            "has_next": offset + limit < total
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list games: {str(e)}")


@app.get("/api/v1/games/{game_id}")
async def get_game_details(game_id: str, db: AsyncSession = Depends(get_db)):
    """Get game details - maps to Game Cards Display"""
    try:
        game_uuid = uuid.UUID(game_id)
        result = await db.execute(
            select(Game).where(Game.id == game_uuid)
        )
        game = result.scalar_one_or_none()

        if not game:
            raise HTTPException(status_code=404, detail="Game not found")

        # Get active sessions count
        sessions_result = await db.execute(
            select(func.count(GameSession.id)).where(
                and_(
                    GameSession.game_id == game_uuid,
                    GameSession.status.in_(['waiting', 'active'])
                )
            )
        )
        active_sessions = sessions_result.scalar()

        return {
            "id": str(game.id),
            "name": game.name,
            "category": game.category,
            "subcategory": game.subcategory,
            "game_type": game.game_type,
            "min_players": game.min_players,
            "max_players": game.max_players,
            "rules": game.rules,
            "thumbnail_url": game.thumbnail_url,
            "active_sessions": active_sessions
        }

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid game ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get game details: {str(e)}")


@app.get("/api/v1/games/categories")
async def get_game_categories(db: AsyncSession = Depends(get_db)):
    """Get game categories - maps to Category Navigation Bar"""
    try:
        result = await db.execute(
            select(Game.category, func.count(Game.id).label('count'))
            .where(Game.is_active == True)
            .group_by(Game.category)
            .order_by(Game.category)
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
# Game Session Management
# =============================================================================

@app.post("/api/v1/sessions/create", response_model=GameSessionResponse)
async def create_game_session(
    session_data: GameSessionCreate,
    current_user: ClerkUser = Depends(require_kyc_level(1)),
    db: AsyncSession = Depends(get_db)
):
    """Create game session - maps to Match Creation Interface"""
    try:
        # Verify game exists
        game_uuid = uuid.UUID(session_data.game_id)
        result = await db.execute(
            select(Game).where(Game.id == game_uuid)
        )
        game = result.scalar_one_or_none()

        if not game or not game.is_active:
            raise HTTPException(status_code=404, detail="Game not found")

        # Get user profile
        profile_result = await db.execute(
            select(UserProfile).where(UserProfile.clerk_user_id == current_user.id)
        )
        profile = profile_result.scalar_one_or_none()

        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Generate unique session code
        session_code = await generate_session_code(db)

        # Create game session
        session = GameSession(
            game_id=game_uuid,
            session_code=session_code,
            stake_amount=session_data.stake_amount,
            currency=session_data.currency,
            max_players=min(session_data.max_players, game.max_players),
            is_private=session_data.is_private,
            spectator_fee=session_data.spectator_fee,
            created_by_clerk_id=current_user.id,
            created_by_profile_id=profile.id
        )

        db.add(session)
        await db.commit()
        await db.refresh(session)

        # Auto-join creator as player
        player = GamePlayer(
            session_id=session.id,
            clerk_user_id=current_user.id,
            user_profile_id=profile.id,
            position=1
        )
        db.add(player)

        # Update session player count
        session.player_count = 1
        await db.commit()

        # Store game state in MongoDB
        mongo_db = get_mongo_db()
        await mongo_db.game_states.insert_one({
            "_id": str(session.id),
            "game_id": str(game_uuid),
            "current_state": {
                "status": "waiting",
                "players": [str(profile.id)],
                "turn": None,
                "timer": None,
                "board": [],
                "game_specific_data": {}
            },
            "events": [],
            "chat_messages": [],
            "created_at": datetime.utcnow(),
            "last_updated": datetime.utcnow()
        })

        return session

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid game ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@app.post("/api/v1/sessions/{session_id}/join")
async def join_game_session(
    session_id: str,
    current_user: ClerkUser = Depends(require_kyc_level(1)),
    db: AsyncSession = Depends(get_db)
):
    """Join game session - maps to Quick Join Button"""
    try:
        session_uuid = uuid.UUID(session_id)

        # Get session
        result = await db.execute(
            select(GameSession)
            .options(selectinload(GameSession.game))
            .where(GameSession.id == session_uuid)
        )
        session = result.scalar_one_or_none()

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        if session.status not in ['waiting']:
            raise HTTPException(status_code=400, detail="Session is not accepting players")

        if session.player_count >= session.max_players:
            raise HTTPException(status_code=400, detail="Session is full")

        # Check if user already in session
        existing_result = await db.execute(
            select(GamePlayer).where(
                and_(
                    GamePlayer.session_id == session_uuid,
                    GamePlayer.clerk_user_id == current_user.id
                )
            )
        )
        if existing_result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Already in this session")

        # Get user profile
        profile_result = await db.execute(
            select(UserProfile).where(UserProfile.clerk_user_id == current_user.id)
        )
        profile = profile_result.scalar_one_or_none()

        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Add player
        player = GamePlayer(
            session_id=session_uuid,
            clerk_user_id=current_user.id,
            user_profile_id=profile.id,
            position=session.player_count + 1
        )
        db.add(player)

        # Update session
        session.player_count += 1

        # Auto-start if at minimum players
        if session.player_count >= session.game.min_players and session.status == 'waiting':
            session.status = 'active'
            session.started_at = datetime.utcnow()

        await db.commit()

        # Update game state in MongoDB
        mongo_db = get_mongo_db()
        await mongo_db.game_states.update_one(
            {"_id": session_id},
            {
                "$push": {"current_state.players": str(profile.id)},
                "$set": {
                    "current_state.status": session.status,
                    "last_updated": datetime.utcnow()
                }
            }
        )

        # Broadcast to session
        await manager.broadcast_to_session(
            session_id,
            {
                "type": "player_joined",
                "user_id": current_user.id,
                "username": profile.username,
                "position": player.position,
                "player_count": session.player_count,
                "session_status": session.status
            }
        )

        return {
            "status": "success",
            "session_status": session.status,
            "position": player.position,
            "player_count": session.player_count
        }

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to join session: {str(e)}")


@app.get("/api/v1/sessions/active")
async def get_active_sessions(
    game_id: Optional[str] = None,
    stake_min: Optional[float] = None,
    stake_max: Optional[float] = None,
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Get active sessions - maps to Game Browser"""
    try:
        offset = (page - 1) * limit

        query = (
            select(GameSession)
            .options(selectinload(GameSession.game), selectinload(GameSession.creator))
            .where(GameSession.status.in_(['waiting', 'active']))
            .where(GameSession.is_private == False)
        )

        if game_id:
            query = query.where(GameSession.game_id == uuid.UUID(game_id))

        if stake_min:
            query = query.where(GameSession.stake_amount >= stake_min)

        if stake_max:
            query = query.where(GameSession.stake_amount <= stake_max)

        query = query.offset(offset).limit(limit).order_by(GameSession.created_at.desc())

        result = await db.execute(query)
        sessions = result.scalars().all()

        return {
            "sessions": [
                {
                    "id": str(session.id),
                    "session_code": session.session_code,
                    "game": {
                        "id": str(session.game.id),
                        "name": session.game.name,
                        "category": session.game.category,
                        "thumbnail_url": session.game.thumbnail_url
                    },
                    "creator": {
                        "username": session.creator.username,
                        "display_name": session.creator.display_name
                    },
                    "stake_amount": float(session.stake_amount),
                    "currency": session.currency,
                    "player_count": session.player_count,
                    "max_players": session.max_players,
                    "status": session.status,
                    "spectator_fee": float(session.spectator_fee),
                    "created_at": session.created_at
                }
                for session in sessions
            ],
            "page": page,
            "limit": limit
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get active sessions: {str(e)}")


# =============================================================================
# Real-time Gaming WebSocket
# =============================================================================

@app.websocket("/ws/game/{session_id}")
async def game_websocket(websocket: WebSocket, session_id: str, token: str):
    """WebSocket for real-time game updates"""
    try:
        # Verify token
        user = await verify_websocket_token(token)

        # Verify user is in session
        db_gen = get_db()
        db = await db_gen.__anext__()

        try:
            result = await db.execute(
                select(GamePlayer).where(
                    and_(
                        GamePlayer.session_id == uuid.UUID(session_id),
                        GamePlayer.clerk_user_id == user.id
                    )
                )
            )
            player = result.scalar_one_or_none()

            if not player:
                await websocket.close(code=1008, reason="Not a player in this session")
                return

        finally:
            await db.close()

        # Connect to WebSocket
        await manager.connect(websocket, session_id, user.id)

        # Send initial state
        mongo_db = get_mongo_db()
        game_state = await mongo_db.game_states.find_one({"_id": session_id})

        if game_state:
            await websocket.send_json({
                "type": "game_state",
                "state": game_state["current_state"]
            })

        # Handle messages
        while True:
            data = await websocket.receive_json()

            if data['type'] == 'game_move':
                await handle_game_move(session_id, user.id, data)
            elif data['type'] == 'chat_message':
                await handle_chat_message(session_id, user.id, data)
            elif data['type'] == 'ping':
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id, user.id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close(code=1011, reason="Internal server error")


async def handle_game_move(session_id: str, user_id: str, move_data: dict):
    """Handle game move"""
    try:
        mongo_db = get_mongo_db()
        redis_client = get_redis_client()

        # Get current game state
        game_state = await mongo_db.game_states.find_one({"_id": session_id})

        if not game_state:
            return

        # Validate move (game-specific logic would go here)
        if not await validate_move(game_state, user_id, move_data):
            return

        # Apply move
        new_state = await apply_move(game_state, user_id, move_data)

        # Update game state
        await mongo_db.game_states.update_one(
            {"_id": session_id},
            {
                "$set": {
                    "current_state": new_state,
                    "last_updated": datetime.utcnow()
                },
                "$push": {
                    "events": {
                        "type": "move",
                        "user_id": user_id,
                        "data": move_data['data'],
                        "timestamp": datetime.utcnow()
                    }
                }
            }
        )

        # Broadcast move
        await manager.broadcast_to_session(
            session_id,
            {
                "type": "game_update",
                "state": new_state,
                "last_move": {
                    "user_id": user_id,
                    "data": move_data['data']
                }
            }
        )

        # Publish to Redis for other services
        await redis_client.publish(
            f"game:{session_id}",
            json.dumps({
                "type": "move",
                "session_id": session_id,
                "user_id": user_id,
                "move_data": move_data
            })
        )

    except Exception as e:
        print(f"Error handling game move: {e}")


async def handle_chat_message(session_id: str, user_id: str, message_data: dict):
    """Handle chat message"""
    try:
        mongo_db = get_mongo_db()

        # Add to chat history
        await mongo_db.game_states.update_one(
            {"_id": session_id},
            {
                "$push": {
                    "chat_messages": {
                        "user_id": user_id,
                        "message": message_data['message'],
                        "timestamp": datetime.utcnow()
                    }
                }
            }
        )

        # Broadcast message
        await manager.broadcast_to_session(
            session_id,
            {
                "type": "chat_message",
                "user_id": user_id,
                "message": message_data['message'],
                "timestamp": datetime.utcnow().isoformat()
            }
        )

    except Exception as e:
        print(f"Error handling chat message: {e}")


# =============================================================================
# Spectator System
# =============================================================================

@app.post("/api/v1/sessions/{session_id}/spectate")
async def join_as_spectator(
    session_id: str,
    current_user: ClerkUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Join as spectator - maps to Watch Interface"""
    try:
        session_uuid = uuid.UUID(session_id)

        # Get session
        result = await db.execute(
            select(GameSession).where(GameSession.id == session_uuid)
        )
        session = result.scalar_one_or_none()

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        if session.status not in ['active']:
            raise HTTPException(status_code=400, detail="Session not active for spectating")

        # Handle spectator fee if required
        if session.spectator_fee > 0:
            # TODO: Implement payment processing
            pass

        return {
            "status": "success",
            "spectator_fee": float(session.spectator_fee),
            "websocket_url": f"/ws/spectate/{session_id}"
        }

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to join as spectator: {str(e)}")


# =============================================================================
# Utility Functions
# =============================================================================

async def generate_session_code(db: AsyncSession) -> str:
    """Generate unique session code"""
    import random
    import string

    while True:
        code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

        result = await db.execute(
            select(GameSession).where(GameSession.session_code == code)
        )
        if not result.scalar_one_or_none():
            return code


async def validate_move(game_state: dict, user_id: str, move_data: dict) -> bool:
    """Validate game move (game-specific logic)"""
    # This is a simplified validation
    # In a real implementation, this would contain game-specific rules
    current_state = game_state["current_state"]

    # Check if it's the user's turn
    if current_state.get("turn") and current_state["turn"] != user_id:
        return False

    return True


async def apply_move(game_state: dict, user_id: str, move_data: dict) -> dict:
    """Apply game move and return new state"""
    # This is game-specific logic
    # For now, just update the turn to next player
    new_state = game_state["current_state"].copy()

    # Simple turn rotation logic
    players = new_state.get("players", [])
    if user_id in players:
        current_index = players.index(user_id)
        next_index = (current_index + 1) % len(players)
        new_state["turn"] = players[next_index]

    # Apply move-specific changes
    if "move" in move_data:
        new_state["last_move"] = move_data["move"]

    return new_state


# =============================================================================
# Health Check
# =============================================================================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "game_engine"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )