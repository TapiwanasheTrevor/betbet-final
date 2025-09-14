# BetBet Platform - Microservices Backend Architecture Specification with Clerk Auth

## System Architecture Overview

### Core Technology Stack
- **Authentication**: Clerk (managed auth service)
- **API Gateway**: Kong Gateway (with plugins for rate limiting, auth, caching)
- **Framework**: FastAPI (Python 3.11+)
- **Async Runtime**: Uvicorn with Gunicorn
- **Message Broker**: Redis Pub/Sub + Apache Kafka
- **WebSockets**: FastAPI WebSocket + Redis Channels
- **Databases**: 
  - PostgreSQL (primary data)
  - MongoDB (game states, logs)
  - Redis (caching, sessions, real-time data)
  - TimescaleDB (time-series data for analytics)
  - Cassandra (chat messages, high-write scenarios)
- **Search**: Elasticsearch
- **Container Orchestration**: Kubernetes
- **Service Mesh**: Istio
- **Monitoring**: Prometheus + Grafana
- **Tracing**: Jaeger

### Microservices Architecture with Clerk

```
┌─────────────────────────────────────────────────────────────┐
│                        Clerk Auth                            │
│              (User Management, SSO, MFA, JWT)                │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                     Kong API Gateway                         │
│           (Clerk JWT Validation, Rate Limit, Cache)          │
└────────┬────────────────────────────────────────────────────┘
         │
    ┌────┴────┬──────────┬───────────┬────────────┬──────────┐
    │         │          │           │            │          │
┌───▼───┐ ┌──▼───┐ ┌────▼────┐ ┌───▼────┐ ┌────▼────┐ ┌───▼───┐
│User   │ │Game  │ │Betting  │ │Analytics│ │Wallet   │ │Social │
│Profile│ │Engine│ │Market   │ │Service  │ │Service  │ │Forum  │
└───┬───┘ └──┬───┘ └────┬────┘ └───┬────┘ └────┬────┘ └───┬───┘
    │        │          │           │            │          │
┌───▼────────▼──────────▼───────────▼────────────▼──────────▼───┐
│                    Event Bus (Kafka + Redis)                   │
└────────────────────────────────────────────────────────────────┘
```

## Clerk Integration Configuration

### Environment Variables
```env
# .env
CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_JWT_KEY=<clerk-jwt-verification-key>
CLERK_WEBHOOK_SECRET=whsec_xxxxx
CLERK_DOMAIN=betbet.com
```

### Clerk SDK Setup
```python
# clerk_config.py
from clerk_backend_sdk import Clerk
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import httpx
from typing import Optional

# Initialize Clerk client
clerk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))

# JWT verification
security = HTTPBearer()

async def verify_clerk_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Clerk JWT token"""
    token = credentials.credentials
    
    try:
        # Get Clerk's JWT verification key
        jwks_url = f"https://{os.getenv('CLERK_DOMAIN')}/.well-known/jwks.json"
        async with httpx.AsyncClient() as client:
            response = await client.get(jwks_url)
            jwks = response.json()
        
        # Decode and verify the JWT
        decoded = jwt.decode(
            token,
            key=jwks,
            algorithms=["RS256"],
            audience=os.getenv("CLERK_DOMAIN")
        )
        
        return decoded
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )

async def get_current_user(token_data: dict = Depends(verify_clerk_token)):
    """Get current user from Clerk token"""
    user_id = token_data.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    
    # Get user from Clerk
    try:
        user = clerk.users.get(user_id=user_id)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

# Clerk webhook handler
async def verify_clerk_webhook(request):
    """Verify Clerk webhook signature"""
    webhook_secret = os.getenv("CLERK_WEBHOOK_SECRET")
    signature = request.headers.get("svix-signature")
    
    # Verify webhook signature
    # Implementation depends on Clerk's webhook verification method
    return True
```

## Service 1: User Profile Service (Enhanced with Clerk)

### Database Schema (PostgreSQL)

```sql
-- User profiles (synced with Clerk)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id VARCHAR(255) UNIQUE NOT NULL, -- Clerk user ID
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    country_code VARCHAR(2),
    timezone VARCHAR(50),
    language VARCHAR(10) DEFAULT 'en',
    skill_rating INTEGER DEFAULT 1000,
    total_earnings DECIMAL(20, 8) DEFAULT 0,
    total_wagered DECIMAL(20, 8) DEFAULT 0,
    verified_expert BOOLEAN DEFAULT FALSE,
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES user_profiles(id),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP
);

-- KYC documents (additional to Clerk's data)
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id UUID REFERENCES user_profiles(id),
    clerk_user_id VARCHAR(255) NOT NULL,
    document_type VARCHAR(50),
    document_url VARCHAR(500),
    kyc_level INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES user_profiles(id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User permissions and roles (extends Clerk roles)
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id UUID REFERENCES user_profiles(id),
    permission_type VARCHAR(50), -- 'game_host', 'market_creator', 'expert_analyst'
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES user_profiles(id),
    expires_at TIMESTAMP,
    metadata JSONB
);

-- Referral tracking
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES user_profiles(id),
    referred_id UUID REFERENCES user_profiles(id),
    referral_code VARCHAR(20),
    reward_amount DECIMAL(20, 8),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Routes with Clerk Integration

```python
# user_profile_service.py
from fastapi import FastAPI, Depends, HTTPException
from clerk_backend_sdk import Clerk
from typing import Optional

app = FastAPI(title="User Profile Service")

# Clerk webhook endpoints
@app.post("/api/v1/webhooks/clerk/user-created")
async def handle_user_created(request: dict):
    """Handle Clerk user.created webhook - maps to Onboarding UI"""
    # Verify webhook signature
    if not await verify_clerk_webhook(request):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")
    
    # Create user profile in our database
    clerk_user_id = request['data']['id']
    email = request['data']['email_addresses'][0]['email_address']
    username = request['data']['username'] or email.split('@')[0]
    
    # Create profile in our database
    profile = await create_user_profile(
        clerk_user_id=clerk_user_id,
        email=email,
        username=username
    )
    return {"status": "success", "profile_id": profile.id}

@app.post("/api/v1/webhooks/clerk/user-updated")
async def handle_user_updated(request: dict):
    """Handle Clerk user.updated webhook"""
    # Sync updated data with our database
    clerk_user_id = request['data']['id']
    await sync_user_profile(clerk_user_id, request['data'])
    return {"status": "success"}

@app.post("/api/v1/webhooks/clerk/session-created")
async def handle_session_created(request: dict):
    """Handle Clerk session.created webhook - track user activity"""
    clerk_user_id = request['data']['user_id']
    await update_last_seen(clerk_user_id)
    return {"status": "success"}

# Profile management endpoints
@app.get("/api/v1/users/profile")
async def get_my_profile(current_user = Depends(get_current_user)):
    """Get current user profile - maps to Profile View"""
    profile = await get_profile_by_clerk_id(current_user.id)
    return profile

@app.get("/api/v1/users/{user_id}/profile")
async def get_user_profile(user_id: str):
    """Get user profile by ID - maps to Public Profile View"""
    profile = await get_profile_by_id(user_id)
    return profile

@app.put("/api/v1/users/profile")
async def update_my_profile(
    profile_data: dict,
    current_user = Depends(get_current_user)
):
    """Update user profile - maps to Profile Settings"""
    # Update profile in our database
    profile = await update_profile(current_user.id, profile_data)
    
    # Update metadata in Clerk
    clerk.users.update(
        user_id=current_user.id,
        public_metadata={"betbet_profile_id": str(profile.id)}
    )
    return profile

@app.get("/api/v1/users/stats")
async def get_my_stats(current_user = Depends(get_current_user)):
    """Get user statistics - maps to Performance Tracker"""
    stats = await get_user_statistics(current_user.id)
    return stats

# KYC endpoints (extends Clerk verification)
@app.post("/api/v1/kyc/submit")
async def submit_kyc_document(
    document_type: str,
    document_file: bytes,
    current_user = Depends(get_current_user)
):
    """Submit KYC document - maps to KYC Process UI"""
    # Store document
    document = await store_kyc_document(
        clerk_user_id=current_user.id,
        document_type=document_type,
        document_file=document_file
    )
    
    # Update Clerk user metadata
    clerk.users.update(
        user_id=current_user.id,
        public_metadata={"kyc_status": "pending", "kyc_level": 1}
    )
    return document

@app.get("/api/v1/kyc/status")
async def get_kyc_status(current_user = Depends(get_current_user)):
    """Get KYC verification status"""
    status = await get_user_kyc_status(current_user.id)
    return status

@app.post("/api/v1/kyc/verify/{user_id}")
async def verify_kyc(
    user_id: str,
    verification_data: dict,
    current_user = Depends(get_current_user)
):
    """Verify KYC document (admin only)"""
    # Check admin permission
    if not await is_admin(current_user.id):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Update KYC status
    await update_kyc_status(user_id, verification_data)
    
    # Update Clerk user metadata
    clerk.users.update(
        user_id=user_id,
        public_metadata={
            "kyc_status": "verified",
            "kyc_level": verification_data.get("level", 2)
        }
    )
    return {"status": "success"}

# Referral system
@app.post("/api/v1/referrals/generate")
async def generate_referral_code(current_user = Depends(get_current_user)):
    """Generate referral code for user"""
    code = await create_referral_code(current_user.id)
    return {"referral_code": code}

@app.post("/api/v1/referrals/apply")
async def apply_referral_code(
    code: str,
    current_user = Depends(get_current_user)
):
    """Apply referral code during registration"""
    result = await process_referral(current_user.id, code)
    return result

@app.get("/api/v1/referrals/stats")
async def get_referral_stats(current_user = Depends(get_current_user)):
    """Get user's referral statistics"""
    stats = await get_referral_statistics(current_user.id)
    return stats
```

## Kong API Gateway Configuration with Clerk

```yaml
# kong.yml
_format_version: "3.0"

plugins:
  # Global Clerk JWT validation plugin
  - name: jwt
    config:
      uri_param_names: []
      cookie_names: []
      header_names:
        - authorization
      claims_to_verify:
        - exp
      key_claim_name: iss
      secret_is_base64: false
      anonymous: null
      run_on_preflight: true

services:
  - name: user-profile-service
    url: http://user-profile:8000
    routes:
      - name: profile-routes
        paths:
          - /api/v1/users
          - /api/v1/kyc
          - /api/v1/referrals
    plugins:
      - name: request-transformer
        config:
          add:
            headers:
              - x-clerk-verified:true
              
  - name: clerk-webhooks
    url: http://user-profile:8000
    routes:
      - name: webhook-routes
        paths:
          - /api/v1/webhooks/clerk
    plugins:
      - name: hmac-auth
        config:
          enforce_headers:
            - svix-signature
          
  - name: game-engine-service
    url: http://game-engine:8001
    routes:
      - name: game-routes
        paths:
          - /api/v1/games
          - /api/v1/sessions
          - /api/v1/tournaments
          - /ws/game
    plugins:
      - name: jwt
        config:
          uri_param_names: []
          key_claim_name: azp
          claims_to_verify:
            - exp
            - azp
              
  - name: betting-market-service
    url: http://betting-market:8002
    routes:
      - name: market-routes
        paths:
          - /api/v1/markets
          - /api/v1/orders
          - /api/v1/pools
          - /ws/markets
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          second: 10
          policy: redis
          
  - name: analytics-service
    url: http://analytics:8003
    routes:
      - name: analytics-routes
        paths:
          - /api/v1/datasources
          - /api/v1/analysis
          - /api/v1/picks
          - /api/v1/booking
          - /api/v1/experts
    plugins:
      - name: jwt
      - name: request-size-limiting
        config:
          allowed_payload_size: 100
          
  - name: wallet-service
    url: http://wallet:8004
    routes:
      - name: wallet-routes
        paths:
          - /api/v1/wallets
          - /api/v1/deposits
          - /api/v1/withdrawals
          - /api/v1/transactions
          - /api/v1/transfers
    plugins:
      - name: jwt
      - name: ip-restriction
        config:
          allow:
            - 0.0.0.0/0
            
  - name: social-forum-service
    url: http://social-forum:8005
    routes:
      - name: social-routes
        paths:
          - /api/v1/communities
          - /api/v1/threads
          - /api/v1/groups
          - /api/v1/messages
          - /ws/chat
          - /ws/voice
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 200
```

## Service 2: Game Engine Service (with Clerk Auth)

### Database Schema (PostgreSQL + MongoDB)

```sql
-- Same game tables but with clerk_user_id references
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id),
    session_code VARCHAR(20) UNIQUE,
    status VARCHAR(20) DEFAULT 'waiting',
    stake_amount DECIMAL(20, 8),
    currency VARCHAR(10),
    player_count INTEGER,
    max_players INTEGER,
    is_private BOOLEAN DEFAULT FALSE,
    spectator_fee DECIMAL(20, 8) DEFAULT 0,
    created_by_clerk_id VARCHAR(255) NOT NULL, -- Clerk user ID
    created_by_profile_id UUID REFERENCES user_profiles(id),
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE game_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES game_sessions(id),
    clerk_user_id VARCHAR(255) NOT NULL,
    user_profile_id UUID REFERENCES user_profiles(id),
    position INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    score INTEGER DEFAULT 0,
    payout DECIMAL(20, 8),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, clerk_user_id)
);
```

### API Routes with Clerk Auth

```python
# game_engine_service.py
from fastapi import FastAPI, WebSocket, Depends
from typing import List, Optional

app = FastAPI(title="Game Engine Service")

# Game session endpoints with Clerk auth
@app.post("/api/v1/sessions/create")
async def create_game_session(
    game_id: str,
    stake: float,
    is_private: bool,
    current_user = Depends(get_current_user)
):
    """Create game session - maps to Match Creation Interface"""
    # Get user profile
    profile = await get_profile_by_clerk_id(current_user.id)
    
    # Create game session
    session = await create_session(
        game_id=game_id,
        stake=stake,
        is_private=is_private,
        created_by_clerk_id=current_user.id,
        created_by_profile_id=profile.id
    )
    
    # Track in Clerk metadata
    clerk.users.update(
        user_id=current_user.id,
        public_metadata={
            "active_game_session": session.id,
            "total_games_created": profile.total_games_created + 1
        }
    )
    
    return session

@app.post("/api/v1/sessions/{session_id}/join")
async def join_game_session(
    session_id: str,
    current_user = Depends(get_current_user)
):
    """Join game session - maps to Quick Join Button"""
    profile = await get_profile_by_clerk_id(current_user.id)
    
    # Check KYC level from Clerk metadata
    if current_user.public_metadata.get("kyc_level", 0) < 1:
        raise HTTPException(status_code=403, detail="KYC verification required")
    
    # Join session
    result = await join_session(
        session_id=session_id,
        clerk_user_id=current_user.id,
        user_profile_id=profile.id
    )
    
    return result

# WebSocket with Clerk token verification
@app.websocket("/ws/game/{session_id}")
async def game_websocket(websocket: WebSocket, session_id: str, token: str):
    """WebSocket for real-time game updates"""
    # Verify Clerk token
    try:
        user_data = await verify_clerk_token_ws(token)
        clerk_user_id = user_data['sub']
    except:
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    await websocket.accept()
    
    # Add to game room
    await add_player_to_room(session_id, clerk_user_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # Process game moves with user verification
            if data['type'] == 'game_move':
                await process_game_move(
                    session_id=session_id,
                    clerk_user_id=clerk_user_id,
                    move_data=data
                )
                
            # Broadcast to room
            await broadcast_game_update(session_id, data)
            
    except WebSocketDisconnect:
        await remove_player_from_room(session_id, clerk_user_id)
```

## Service 3: Betting Market Service (with Clerk Auth)

### Database Schema Updates

```sql
-- Markets with Clerk user references
CREATE TABLE markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    market_type VARCHAR(20),
    creator_clerk_id VARCHAR(255) NOT NULL,
    creator_profile_id UUID REFERENCES user_profiles(id),
    creator_fee_percent DECIMAL(5, 2) DEFAULT 1.0,
    status VARCHAR(20) DEFAULT 'open',
    resolution_source TEXT,
    oracle_type VARCHAR(20),
    opens_at TIMESTAMP,
    closes_at TIMESTAMP,
    resolved_at TIMESTAMP,
    resolution_value VARCHAR(255),
    total_volume DECIMAL(20, 8) DEFAULT 0,
    participant_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE market_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID REFERENCES markets(id),
    outcome_id UUID REFERENCES market_outcomes(id),
    clerk_user_id VARCHAR(255) NOT NULL,
    user_profile_id UUID REFERENCES user_profiles(id),
    position_type VARCHAR(10),
    stake DECIMAL(20, 8),
    odds DECIMAL(10, 4),
    potential_payout DECIMAL(20, 8),
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP
);
```

### API Routes

```python
# betting_market_service.py
@app.post("/api/v1/markets/create")
async def create_market(
    title: str,
    description: str,
    market_type: str,
    outcomes: List[str],
    closes_at: datetime,
    current_user = Depends(get_current_user)
):
    """Create market - maps to Market Builder Wizard"""
    # Check if user can create markets (from Clerk metadata)
    if not current_user.public_metadata.get("can_create_markets", False):
        # Check KYC level
        if current_user.public_metadata.get("kyc_level", 0) < 2:
            raise HTTPException(
                status_code=403, 
                detail="Level 2 KYC required to create markets"
            )
    
    profile = await get_profile_by_clerk_id(current_user.id)
    
    market = await create_new_market(
        title=title,
        description=description,
        market_type=market_type,
        outcomes=outcomes,
        closes_at=closes_at,
        creator_clerk_id=current_user.id,
        creator_profile_id=profile.id
    )
    
    # Update user metadata
    clerk.users.update(
        user_id=current_user.id,
        public_metadata={
            "markets_created": current_user.public_metadata.get("markets_created", 0) + 1
        }
    )
    
    return market

@app.post("/api/v1/markets/{market_id}/orders")
async def place_order(
    market_id: str,
    outcome_id: str,
    order_type: str,
    price: float,
    quantity: float,
    current_user = Depends(get_current_user)
):
    """Place order - maps to Order Placement Panel"""
    # Check wallet balance
    profile = await get_profile_by_clerk_id(current_user.id)
    
    # Verify user has sufficient balance
    if not await check_balance(profile.id, quantity):
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    order = await create_order(
        market_id=market_id,
        outcome_id=outcome_id,
        clerk_user_id=current_user.id,
        user_profile_id=profile.id,
        order_type=order_type,
        price=price,
        quantity=quantity
    )
    
    return order
```

## Service 4: Analytics & Expert Service (with Clerk Auth)

### Database Schema Updates

```sql
-- Expert profiles linked to Clerk users
CREATE TABLE expert_profiles (
    clerk_user_id VARCHAR(255) PRIMARY KEY,
    user_profile_id UUID REFERENCES user_profiles(id),
    specializations TEXT[],
    success_rate DECIMAL(5, 2),
    total_picks INTEGER DEFAULT 0,
    winning_picks INTEGER DEFAULT 0,
    subscription_price DECIMAL(20, 8),
    trial_days INTEGER DEFAULT 7,
    rating DECIMAL(3, 2),
    verified_at TIMESTAMP,
    stripe_account_id VARCHAR(255) -- For expert payouts
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_clerk_id VARCHAR(255) NOT NULL,
    expert_clerk_id VARCHAR(255) NOT NULL,
    stripe_subscription_id VARCHAR(255), -- Stripe subscription
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    amount_paid DECIMAL(20, 8),
    status VARCHAR(20) DEFAULT 'active',
    auto_renew BOOLEAN DEFAULT TRUE
);
```

### API Routes

```python
# analytics_service.py
@app.post("/api/v1/experts/register")
async def register_as_expert(
    specializations: List[str],
    subscription_price: float,
    current_user = Depends(get_current_user)
):
    """Register as expert analyst"""
    # Verify user eligibility
    if current_user.public_metadata.get("kyc_level", 0) < 2:
        raise HTTPException(status_code=403, detail="Level 2 KYC required")
    
    profile = await get_profile_by_clerk_id(current_user.id)
    
    # Create Stripe Connect account for payouts
    stripe_account = await create_stripe_connect_account(current_user.email)
    
    expert_profile = await create_expert_profile(
        clerk_user_id=current_user.id,
        user_profile_id=profile.id,
        specializations=specializations,
        subscription_price=subscription_price,
        stripe_account_id=stripe_account.id
    )
    
    # Update Clerk metadata
    clerk.users.update(
        user_id=current_user.id,
        public_metadata={
            "is_expert": True,
            "expert_verified": False,
            "stripe_account_id": stripe_account.id
        }
    )
    
    return expert_profile

@app.post("/api/v1/analysis/query")
async def analyze_data(
    query: str,
    datasource_ids: List[str],
    current_user = Depends(get_current_user)
):
    """Natural language query - maps to Natural Language Query Bar"""
    # Check user's analysis quota
    quota = current_user.public_metadata.get("analysis_quota", 10)
    if quota <= 0:
        raise HTTPException(status_code=429, detail="Analysis quota exceeded")
    
    # Process query
    result = await process_analysis_query(
        query=query,
        datasource_ids=datasource_ids,
        clerk_user_id=current_user.id
    )
    
    # Update quota
    clerk.users.update(
        user_id=current_user.id,
        public_metadata={
            "analysis_quota": quota - 1,
            "last_analysis": datetime.now().isoformat()
        }
    )
    
    return result
```

## Service 5: Wallet Service (with Clerk Auth)

### Database Schema Updates

```sql
-- Wallets linked to Clerk users
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id VARCHAR(255) NOT NULL,
    user_profile_id UUID REFERENCES user_profiles(id),
    currency VARCHAR(10),
    balance DECIMAL(20, 8) DEFAULT 0,
    available_balance DECIMAL(20, 8) DEFAULT 0,
    locked_balance DECIMAL(20, 8) DEFAULT 0,
    wallet_address VARCHAR(255) UNIQUE,
    wallet_type VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    stripe_customer_id VARCHAR(255), -- Stripe customer ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(clerk_user_id, currency)
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id VARCHAR(255) NOT NULL,
    user_profile_id UUID REFERENCES user_profiles(id),
    wallet_id UUID REFERENCES wallets(id),
    type VARCHAR(20),
    amount DECIMAL(20, 8),
    currency VARCHAR(10),
    fee DECIMAL(20, 8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    reference_id VARCHAR(100),
    reference_type VARCHAR(50),
    payment_method VARCHAR(50),
    payment_details JSONB,
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
```

### API Routes

```python
# wallet_service.py
@app.post("/api/v1/wallets/create")
async def create_wallet(
    currency: str,
    current_user = Depends(get_current_user)
):
    """Create new wallet for user"""
    profile = await get_profile_by_clerk_id(current_user.id)
    
    # Create Stripe customer if not exists
    stripe_customer_id = current_user.public_metadata.get("stripe_customer_id")
    if not stripe_customer_id:
        stripe_customer = await create_stripe_customer(
            email=current_user.email,
            name=current_user.first_name + " " + current_user.last_name
        )
        stripe_customer_id = stripe_customer.id
        
        # Update Clerk metadata
        clerk.users.update(
            user_id=current_user.id,
            public_metadata={"stripe_customer_id": stripe_customer_id}
        )
    
    wallet = await create_user_wallet(
        clerk_user_id=current_user.id,
        user_profile_id=profile.id,
        currency=currency,
        stripe_customer_id=stripe_customer_id
    )
    
    return wallet

@app.post("/api/v1/deposits/initiate")
async def initiate_deposit(
    amount: float,
    currency: str,
    payment_method: str,
    current_user = Depends(get_current_user)
):
    """Initiate deposit - maps to Deposit Interface"""
    # Check KYC for large amounts
    if amount > 1000:
        kyc_level = current_user.public_metadata.get("kyc_level", 0)
        if kyc_level < 2:
            raise HTTPException(
                status_code=403,
                detail="Level 2 KYC required for deposits over $1000"
            )
    
    profile = await get_profile_by_clerk_id(current_user.id)
    
    # Create payment intent
    if payment_method == "card":
        payment_intent = await create_stripe_payment_intent(
            amount=amount,
            currency=currency,
            customer_id=current_user.public_metadata.get("stripe_customer_id")
        )
        
        deposit = await create_deposit_record(
            clerk_user_id=current_user.id,
            user_profile_id=profile.id,
            amount=amount,
            currency=currency,
            payment_method=payment_method,
            stripe_payment_intent_id=payment_intent.id
        )
        
        return {
            "deposit_id": deposit.id,
            "client_secret": payment_intent.client_secret
        }
    
    # Handle other payment methods
    return await process_deposit(
        clerk_user_id=current_user.id,
        amount=amount,
        currency=currency,
        payment_method=payment_method
    )

@app.post("/api/v1/withdrawals/request")
async def request_withdrawal(
    amount: float,
    payment_method_id: str,
    current_user = Depends(get_current_user)
):
    """Request withdrawal - maps to Withdrawal Request Form"""
    # Verify KYC for withdrawals
    kyc_level = current_user.public_metadata.get("kyc_level", 0)
    if kyc_level < 1:
        raise HTTPException(
            status_code=403,
            detail="KYC verification required for withdrawals"
        )
    
    profile = await get_profile_by_clerk_id(current_user.id)
    
    # Check balance
    wallet = await get_user_wallet(current_user.id)
    if wallet.available_balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Create withdrawal request
    withdrawal = await create_withdrawal(
        clerk_user_id=current_user.id,
        user_profile_id=profile.id,
        amount=amount,
        payment_method_id=payment_method_id
    )
    
    # Send notification via Clerk
    await send_withdrawal_notification(current_user.id, withdrawal.id)
    
    return withdrawal
```

## Service 6: Social Forum Service (with Clerk Auth)

### Database Schema Updates

```sql
-- Communities with Clerk user references
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    type VARCHAR(20) DEFAULT 'public',
    membership_fee DECIMAL(20, 8) DEFAULT 0,
    owner_clerk_id VARCHAR(255) NOT NULL,
    owner_profile_id UUID REFERENCES user_profiles(id),
    member_count INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES communities(id),
    clerk_user_id VARCHAR(255) NOT NULL,
    user_profile_id UUID REFERENCES user_profiles(id),
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    muted_until TIMESTAMP,
    banned_until TIMESTAMP,
    UNIQUE(community_id, clerk_user_id)
);
```

### API Routes

```python
# social_forum_service.py
@app.post("/api/v1/communities/create")
async def create_community(
    name: str,
    description: str,
    type: str,
    current_user = Depends(get_current_user)
):
    """Create community - maps to Community Hub"""
    profile = await get_profile_by_clerk_id(current_user.id)
    
    community = await create_new_community(
        name=name,
        description=description,
        type=type,
        owner_clerk_id=current_user.id,
        owner_profile_id=profile.id
    )
    
    # Update user metadata
    clerk.users.update(
        user_id=current_user.id,
        public_metadata={
            "communities_owned": current_user.public_metadata.get("communities_owned", []) + [str(community.id)]
        }
    )
    
    return community

# WebSocket with Clerk auth
@app.websocket("/ws/chat/{room_id}")
async def chat_websocket(websocket: WebSocket, room_id: str, token: str):
    """WebSocket for real-time chat"""
    # Verify Clerk token
    try:
        user_data = await verify_clerk_token_ws(token)
        clerk_user_id = user_data['sub']
    except:
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    # Check if user is member of the room
    if not await is_room_member(room_id, clerk_user_id):
        await websocket.close(code=1008, reason="Not a member")
        return
    
    await websocket.accept()
    await add_user_to_chat_room(room_id, clerk_user_id, websocket)
    
    try:
        while True:
            message = await websocket.receive_json()
            
            # Process and broadcast message
            await process_chat_message(
                room_id=room_id,
                clerk_user_id=clerk_user_id,
                message=message
            )
            
    except WebSocketDisconnect:
        await remove_user_from_chat_room(room_id, clerk_user_id)
```

## Clerk Frontend Integration

```javascript
// clerk_setup.js
import { ClerkProvider, SignIn, SignUp, UserButton, useUser, useAuth } from '@clerk/nextjs';

// Wrap your app with ClerkProvider
export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

// Protected route component
import { withAuth } from '@clerk/nextjs/api';

export default withAuth(async (req, res) => {
  const { userId } = req.auth;
  // Your protected API logic here
});

// Use in components
function GameComponent() {
  const { isLoaded, userId, sessionId, getToken } = useAuth();
  const { user } = useUser();
  
  const createGame = async () => {
    const token = await getToken();
    const response = await fetch('/api/v1/sessions/create', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      method: 'POST',
      body: JSON.stringify({ /* game data */ })
    });
  };
  
  // WebSocket connection with token
  const connectWebSocket = async () => {
    const token = await getToken();
    const ws = new WebSocket(`wss://api.betbet.com/ws/game/123?token=${token}`);
    
    ws.onopen = () => {
      console.log('Connected to game');
    };
  };
}
```

## Clerk Webhook Configuration

```python
# webhook_handler.py
from fastapi import Request, HTTPException
from svix.webhooks import Webhook
import os

@app.post("/api/v1/webhooks/clerk")
async def handle_clerk_webhook(request: Request):
    """Handle all Clerk webhook events"""
    
    # Get the webhook secret from environment
    webhook_secret = os.getenv("CLERK_WEBHOOK_SECRET")
    
    # Get headers and body
    headers = dict(request.headers)
    body = await request.body()
    
    # Verify the webhook signature
    wh = Webhook(webhook_secret)
    try:
        payload = wh.verify(body, headers)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle different event types
    event_type = payload["type"]
    data = payload["data"]
    
    if event_type == "user.created":
        # Create user profile in our database
        await handle_user_created(data)
        
    elif event_type == "user.updated":
        # Sync user data
        await handle_user_updated(data)
        
    elif event_type == "user.deleted":
        # Handle user deletion
        await handle_user_deleted(data)
        
    elif event_type == "session.created":
        # Track user login
        await handle_session_created(data)
        
    elif event_type == "organization.created":
        # Handle organization creation (for group betting)
        await handle_organization_created(data)
        
    elif event_type == "organizationMembership.created":
        # Handle organization member added
        await handle_organization_member_added(data)
    
    return {"status": "success"}

# Helper functions
async def handle_user_created(data):
    """Create user profile when Clerk user is created"""
    profile = await create_user_profile(
        clerk_user_id=data["id"],
        email=data["email_addresses"][0]["email_address"],
        username=data["username"] or data["email_addresses"][0]["email_address"].split("@")[0],
        first_name=data["first_name"],
        last_name=data["last_name"],
        avatar_url=data["profile_image_url"]
    )
    
    # Generate referral code
    referral_code = await generate_unique_referral_code()
    await update_profile(profile.id, {"referral_code": referral_code})
    
    # Create default wallet
    await create_user_wallet(
        clerk_user_id=data["id"],
        user_profile_id=profile.id,
        currency="USD"
    )
    
    # Send welcome email via Clerk
    await send_welcome_email(data["id"])

async def handle_user_updated(data):
    """Sync user data when Clerk user is updated"""
    await update_user_profile_from_clerk(
        clerk_user_id=data["id"],
        updates={
            "email": data["email_addresses"][0]["email_address"],
            "username": data["username"],
            "first_name": data["first_name"],
            "last_name": data["last_name"],
            "avatar_url": data["profile_image_url"]
        }
    )

async def handle_session_created(data):
    """Track user activity when they log in"""
    await update_last_seen(data["user_id"])
    
    # Check for pending notifications
    notifications = await get_pending_notifications(data["user_id"])
    if notifications:
        await send_push_notifications(data["user_id"], notifications)
```

## Environment Configuration

```bash
# .env
# Clerk Configuration
CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
CLERK_JWT_VERIFICATION_KEY=-----BEGIN PUBLIC KEY-----xxxxx-----END PUBLIC KEY-----

# Service URLs
USER_PROFILE_SERVICE_URL=http://user-profile:8000
GAME_ENGINE_SERVICE_URL=http://game-engine:8001
BETTING_MARKET_SERVICE_URL=http://betting-market:8002
ANALYTICS_SERVICE_URL=http://analytics:8003
WALLET_SERVICE_URL=http://wallet:8004
SOCIAL_FORUM_SERVICE_URL=http://social-forum:8005

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_CONNECT_CLIENT_ID=ca_xxxxx

# Database URLs
DATABASE_URL=postgresql://betbet:betbet@postgres/betbet
MONGODB_URL=mongodb://betbet:betbet@mongodb:27017/betbet
REDIS_URL=redis://redis:6379
TIMESCALE_URL=postgresql://betbet:betbet@timescaledb/betbet_timeseries
CASSANDRA_HOSTS=cassandra
ELASTICSEARCH_URL=http://elasticsearch:9200

# Kafka Configuration
KAFKA_BROKER=kafka:9092

# Kong Admin URL
KONG_ADMIN_URL=http://kong:8001
```

## Docker Compose with Clerk

```yaml
# docker-compose.yml
version: '3.8'

services:
  kong:
    image: kong:3.0
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: kong-db
      KONG_PG_USER: kong
      KONG_PG_PASSWORD: kong
      KONG_PLUGINS: bundled,jwt
      KONG_JWT_SECRET: ${CLERK_JWT_VERIFICATION_KEY}
    ports:
      - "8000:8000"
      - "8443:8443"
      - "8001:8001"
    depends_on:
      - kong-db
      
  user-profile:
    build: ./services/user_profile
    environment:
      DATABASE_URL: postgresql://betbet:betbet@postgres/betbet
      REDIS_URL: redis://redis:6379
      CLERK_SECRET_KEY: ${CLERK_SECRET_KEY}
      CLERK_WEBHOOK_SECRET: ${CLERK_WEBHOOK_SECRET}
    depends_on:
      - postgres
      - redis
      
  game-engine:
    build: ./services/game_engine
    environment:
      DATABASE_URL: postgresql://betbet:betbet@postgres/betbet
      MONGODB_URL: mongodb://betbet:betbet@mongodb:27017/betbet
      REDIS_URL: redis://redis:6379
      CLERK_SECRET_KEY: ${CLERK_SECRET_KEY}
    depends_on:
      - postgres
      - mongodb
      - redis
      
  betting-market:
    build: ./services/betting_market
    environment:
      DATABASE_URL: postgresql://betbet:betbet@postgres/betbet
      TIMESCALE_URL: postgresql://betbet:betbet@timescaledb/betbet_timeseries
      REDIS_URL: redis://redis:6379
      CLERK_SECRET_KEY: ${CLERK_SECRET_KEY}
    depends_on:
      - postgres
      - timescaledb
      - redis
      
  analytics:
    build: ./services/analytics
    environment:
      DATABASE_URL: postgresql://betbet:betbet@postgres/betbet
      MONGODB_URL: mongodb://betbet:betbet@mongodb:27017/betbet
      ELASTICSEARCH_URL: http://elasticsearch:9200
      CLERK_SECRET_KEY: ${CLERK_SECRET_KEY}
    depends_on:
      - postgres
      - mongodb
      - elasticsearch
      
  wallet:
    build: ./services/wallet
    environment:
      DATABASE_URL: postgresql://betbet:betbet@postgres/betbet
      REDIS_URL: redis://redis:6379
      KAFKA_BROKER: kafka:9092
      CLERK_SECRET_KEY: ${CLERK_SECRET_KEY}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
    depends_on:
      - postgres
      - redis
      - kafka
      
  social-forum:
    build: ./services/social_forum
    environment:
      DATABASE_URL: postgresql://betbet:betbet@postgres/betbet
      CASSANDRA_HOSTS: cassandra
      REDIS_URL: redis://redis:6379
      CLERK_SECRET_KEY: ${CLERK_SECRET_KEY}
    depends_on:
      - postgres
      - cassandra
      - redis

  # Databases and other services remain the same
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: betbet
      POSTGRES_PASSWORD: betbet
      POSTGRES_DB: betbet
    volumes:
      - postgres-data:/var/lib/postgresql/data
      
  # ... rest of the services ...

volumes:
  postgres-data:
  mongo-data:
  redis-data:
  cassandra-data:
  es-data:
  timescale-data:
  kong-data:
```

## Clerk User Metadata Structure

```javascript
// Clerk Public Metadata Schema
{
  "public_metadata": {
    // Profile
    "betbet_profile_id": "uuid",
    "referral_code": "BETBET123",
    
    // KYC
    "kyc_status": "verified",
    "kyc_level": 2,
    
    // Permissions
    "can_create_markets": true,
    "is_expert": true,
    "expert_verified": true,
    
    // Limits & Quotas
    "analysis_quota": 10,
    "daily_withdrawal_limit": 5000,
    
    // Activity
    "active_game_session": "uuid",
    "total_games_created": 42,
    "markets_created": 15,
    "communities_owned": ["uuid1", "uuid2"],
    
    // Financial
    "stripe_customer_id": "cus_xxxxx",
    "stripe_account_id": "acct_xxxxx",
    
    // Stats
    "last_analysis": "2024-01-01T00:00:00Z",
    "total_volume_traded": 50000
  },
  
  "private_metadata": {
    // Internal flags
    "risk_score": 0.2,
    "fraud_checks_passed": true,
    "manual_review_required": false,
    
    // Compliance
    "sanctions_checked": true,
    "pep_status": false,
    
    // Internal notes
    "admin_notes": "VIP user, high volume trader"
  }
}
```

## Authentication Flow Summary

1. **User Registration**:
   - User signs up via Clerk
   - Clerk webhook triggers profile creation in our database
   - Default wallet created
   - Referral code generated

2. **User Login**:
   - User authenticates with Clerk
   - Clerk issues JWT token
   - Token includes user ID and metadata
   - Frontend includes token in API requests

3. **API Request**:
   - Kong Gateway validates Clerk JWT
   - Service extracts user ID from token
   - Service queries user profile from database
   - Service checks permissions from Clerk metadata

4. **WebSocket Connection**:
   - Client requests token from Clerk
   - Client connects to WebSocket with token
   - Server validates token
   - Server maintains authenticated connection

5. **KYC Verification**:
   - User submits documents to our service
   - Admin reviews and approves
   - KYC level updated in Clerk metadata
   - User gains access to restricted features

This architecture provides:
- **Secure authentication** via Clerk's managed service
- **Single Sign-On** capabilities
- **Social login** options (Google, Facebook, etc.)
- **Multi-factor authentication** built-in
- **Session management** handled by Clerk
- **User management UI** provided by Clerk
- **Webhook integration** for real-time sync
- **JWT-based authorization** for all services
- **Scalable user management** without custom auth code