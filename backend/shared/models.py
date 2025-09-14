"""
Shared database models and schemas
"""

import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from decimal import Decimal

from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Text, DECIMAL,
    ForeignKey, Index, JSON, ARRAY
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field

Base = declarative_base()


# =============================================================================
# User Management Models
# =============================================================================

class UserProfile(Base):
    """User profile linked to Clerk user"""
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_user_id = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20))
    display_name = Column(String(100))
    avatar_url = Column(String(500))
    bio = Column(Text)
    country_code = Column(String(2))
    timezone = Column(String(50))
    language = Column(String(10), default='en')
    skill_rating = Column(Integer, default=1000)
    total_earnings = Column(DECIMAL(20, 8), default=0)
    total_wagered = Column(DECIMAL(20, 8), default=0)
    verified_expert = Column(Boolean, default=False)
    referral_code = Column(String(20), unique=True)
    referred_by = Column(UUID(as_uuid=True), ForeignKey('user_profiles.id'))
    settings = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_seen = Column(DateTime)

    # Relationships
    referred_users = relationship("UserProfile", remote_side=[id])


class KYCDocument(Base):
    """KYC documents for user verification"""
    __tablename__ = "kyc_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_profile_id = Column(UUID(as_uuid=True), ForeignKey('user_profiles.id'))
    clerk_user_id = Column(String(255), nullable=False)
    document_type = Column(String(50))  # 'passport', 'id_card', 'driver_license'
    document_url = Column(String(500))
    kyc_level = Column(Integer, default=0)
    status = Column(String(20), default='pending')  # 'pending', 'approved', 'rejected'
    verified_at = Column(DateTime)
    verified_by = Column(UUID(as_uuid=True), ForeignKey('user_profiles.id'))
    metadata = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)


# =============================================================================
# Game Engine Models
# =============================================================================

class Game(Base):
    """Game definitions"""
    __tablename__ = "games"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    subcategory = Column(String(50))
    game_type = Column(String(50))  # 'realtime', 'turn_based', 'countdown'
    min_players = Column(Integer, default=2)
    max_players = Column(Integer, default=10)
    rules = Column(JSONB)
    thumbnail_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class GameSession(Base):
    """Game session instances"""
    __tablename__ = "game_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(UUID(as_uuid=True), ForeignKey('games.id'))
    session_code = Column(String(20), unique=True)
    status = Column(String(20), default='waiting')  # 'waiting', 'active', 'completed', 'cancelled'
    stake_amount = Column(DECIMAL(20, 8))
    currency = Column(String(10))
    player_count = Column(Integer, default=0)
    max_players = Column(Integer)
    is_private = Column(Boolean, default=False)
    spectator_fee = Column(DECIMAL(20, 8), default=0)
    created_by_clerk_id = Column(String(255), nullable=False)
    created_by_profile_id = Column(UUID(as_uuid=True), ForeignKey('user_profiles.id'))
    started_at = Column(DateTime)
    ended_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    game = relationship("Game")
    creator = relationship("UserProfile")


class GamePlayer(Base):
    """Players in game sessions"""
    __tablename__ = "game_players"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey('game_sessions.id'))
    clerk_user_id = Column(String(255), nullable=False)
    user_profile_id = Column(UUID(as_uuid=True), ForeignKey('user_profiles.id'))
    position = Column(Integer)
    status = Column(String(20), default='active')
    score = Column(Integer, default=0)
    payout = Column(DECIMAL(20, 8))
    joined_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("GameSession")
    profile = relationship("UserProfile")

    __table_args__ = (
        Index('ix_game_players_session_user', 'session_id', 'clerk_user_id', unique=True),
    )


# =============================================================================
# Betting Market Models
# =============================================================================

class Market(Base):
    """Betting markets"""
    __tablename__ = "markets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    category = Column(String(50))
    market_type = Column(String(20))  # 'binary', 'multiple', 'scalar'
    creator_clerk_id = Column(String(255), nullable=False)
    creator_profile_id = Column(UUID(as_uuid=True), ForeignKey('user_profiles.id'))
    creator_fee_percent = Column(DECIMAL(5, 2), default=1.0)
    status = Column(String(20), default='open')  # 'open', 'closed', 'resolved', 'cancelled'
    resolution_source = Column(Text)
    oracle_type = Column(String(20))  # 'manual', 'automated'
    opens_at = Column(DateTime)
    closes_at = Column(DateTime)
    resolved_at = Column(DateTime)
    resolution_value = Column(String(255))
    total_volume = Column(DECIMAL(20, 8), default=0)
    participant_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    creator = relationship("UserProfile")


class MarketOutcome(Base):
    """Possible outcomes for markets"""
    __tablename__ = "market_outcomes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    market_id = Column(UUID(as_uuid=True), ForeignKey('markets.id'))
    outcome_text = Column(String(255))
    outcome_value = Column(String(100))
    current_odds = Column(DECIMAL(10, 4))
    total_backed = Column(DECIMAL(20, 8), default=0)
    is_winner = Column(Boolean)

    # Relationships
    market = relationship("Market")


class MarketPosition(Base):
    """User positions in markets"""
    __tablename__ = "market_positions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    market_id = Column(UUID(as_uuid=True), ForeignKey('markets.id'))
    outcome_id = Column(UUID(as_uuid=True), ForeignKey('market_outcomes.id'))
    clerk_user_id = Column(String(255), nullable=False)
    user_profile_id = Column(UUID(as_uuid=True), ForeignKey('user_profiles.id'))
    position_type = Column(String(10))  # 'back', 'lay'
    stake = Column(DECIMAL(20, 8))
    odds = Column(DECIMAL(10, 4))
    potential_payout = Column(DECIMAL(20, 8))
    status = Column(String(20), default='open')  # 'open', 'settled', 'cancelled'
    created_at = Column(DateTime, default=datetime.utcnow)
    settled_at = Column(DateTime)

    # Relationships
    market = relationship("Market")
    outcome = relationship("MarketOutcome")
    profile = relationship("UserProfile")


# =============================================================================
# Wallet Models
# =============================================================================

class Wallet(Base):
    """User wallets for different currencies"""
    __tablename__ = "wallets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_user_id = Column(String(255), nullable=False)
    user_profile_id = Column(UUID(as_uuid=True), ForeignKey('user_profiles.id'))
    currency = Column(String(10))
    balance = Column(DECIMAL(20, 8), default=0)
    available_balance = Column(DECIMAL(20, 8), default=0)
    locked_balance = Column(DECIMAL(20, 8), default=0)
    wallet_address = Column(String(255), unique=True)
    wallet_type = Column(String(20))  # 'fiat', 'crypto'
    is_default = Column(Boolean, default=False)
    stripe_customer_id = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("UserProfile")

    __table_args__ = (
        Index('ix_wallets_user_currency', 'clerk_user_id', 'currency', unique=True),
    )


class Transaction(Base):
    """Transaction history"""
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_user_id = Column(String(255), nullable=False)
    user_profile_id = Column(UUID(as_uuid=True), ForeignKey('user_profiles.id'))
    wallet_id = Column(UUID(as_uuid=True), ForeignKey('wallets.id'))
    type = Column(String(20))  # 'deposit', 'withdrawal', 'transfer', 'bet', 'payout'
    amount = Column(DECIMAL(20, 8))
    currency = Column(String(10))
    fee = Column(DECIMAL(20, 8), default=0)
    status = Column(String(20), default='pending')  # 'pending', 'completed', 'failed', 'cancelled'
    reference_id = Column(String(100))
    reference_type = Column(String(50))  # 'game', 'market', 'p2p'
    payment_method = Column(String(50))
    payment_details = Column(JSONB)
    stripe_payment_intent_id = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

    # Relationships
    profile = relationship("UserProfile")
    wallet = relationship("Wallet")


# =============================================================================
# Pydantic Schemas for API
# =============================================================================

class UserProfileCreate(BaseModel):
    clerk_user_id: str
    username: str
    email: str
    display_name: Optional[str] = None
    phone: Optional[str] = None


class UserProfileResponse(BaseModel):
    id: str
    clerk_user_id: str
    username: str
    email: str
    display_name: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    skill_rating: int
    total_earnings: Decimal
    total_wagered: Decimal
    verified_expert: bool
    referral_code: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class GameSessionCreate(BaseModel):
    game_id: str
    stake_amount: Decimal
    currency: str = "USD"
    max_players: int = 2
    is_private: bool = False
    spectator_fee: Decimal = 0


class GameSessionResponse(BaseModel):
    id: str
    session_code: str
    status: str
    stake_amount: Decimal
    currency: str
    player_count: int
    max_players: int
    is_private: bool
    created_at: datetime

    class Config:
        from_attributes = True


class MarketCreate(BaseModel):
    title: str
    description: str
    category: str
    market_type: str = "binary"
    outcomes: List[str]
    closes_at: datetime
    resolution_source: Optional[str] = None


class MarketResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    market_type: str
    status: str
    total_volume: Decimal
    participant_count: int
    closes_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class WalletResponse(BaseModel):
    id: str
    currency: str
    balance: Decimal
    available_balance: Decimal
    locked_balance: Decimal
    wallet_type: str
    is_default: bool

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    id: str
    type: str
    amount: Decimal
    currency: str
    fee: Decimal
    status: str
    payment_method: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True