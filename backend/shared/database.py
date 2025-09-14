"""
Shared database configuration and connection management
"""

import os
from typing import AsyncGenerator, Optional
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, AsyncEngine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import redis.asyncio as redis
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider
import asyncio

# Database URLs from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://betbet:betbet@localhost/betbet")
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/betbet")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
CASSANDRA_HOSTS = os.getenv("CASSANDRA_HOSTS", "localhost").split(",")

# SQLAlchemy
Base = declarative_base()
engine: Optional[AsyncEngine] = None
async_session: Optional[sessionmaker] = None

# MongoDB
mongo_client: Optional[AsyncIOMotorClient] = None
mongo_db: Optional[AsyncIOMotorDatabase] = None

# Redis
redis_client: Optional[redis.Redis] = None

# Cassandra
cassandra_session = None


async def init_postgres():
    """Initialize PostgreSQL connection"""
    global engine, async_session

    engine = create_async_engine(
        DATABASE_URL,
        echo=True if os.getenv("DEBUG") == "true" else False,
        pool_size=20,
        max_overflow=30,
        pool_timeout=30,
        pool_recycle=3600,
    )

    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )


async def init_mongodb():
    """Initialize MongoDB connection"""
    global mongo_client, mongo_db

    mongo_client = AsyncIOMotorClient(MONGODB_URL)
    mongo_db = mongo_client.betbet


async def init_redis():
    """Initialize Redis connection"""
    global redis_client

    redis_client = redis.from_url(
        REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
        max_connections=50
    )


async def init_cassandra():
    """Initialize Cassandra connection"""
    global cassandra_session

    try:
        # This is a sync operation, so we run it in a thread pool
        cluster = Cluster(CASSANDRA_HOSTS)
        cassandra_session = cluster.connect()

        # Create keyspace if not exists
        cassandra_session.execute("""
            CREATE KEYSPACE IF NOT EXISTS betbet_chat
            WITH replication = {
                'class': 'SimpleStrategy',
                'replication_factor': 1
            }
        """)

        cassandra_session.set_keyspace('betbet_chat')
    except Exception as e:
        print(f"Failed to connect to Cassandra: {e}")


async def close_postgres():
    """Close PostgreSQL connection"""
    global engine
    if engine:
        await engine.dispose()


async def close_mongodb():
    """Close MongoDB connection"""
    global mongo_client
    if mongo_client:
        mongo_client.close()


async def close_redis():
    """Close Redis connection"""
    global redis_client
    if redis_client:
        await redis_client.close()


@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session"""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def get_mongo_db() -> AsyncIOMotorDatabase:
    """Get MongoDB database"""
    return mongo_db


def get_redis_client() -> redis.Redis:
    """Get Redis client"""
    return redis_client


def get_cassandra_session():
    """Get Cassandra session"""
    return cassandra_session


# Database dependency for FastAPI
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with get_db_session() as session:
        yield session


async def init_all_databases():
    """Initialize all database connections"""
    await init_postgres()
    await init_mongodb()
    await init_redis()
    await init_cassandra()


async def close_all_databases():
    """Close all database connections"""
    await close_postgres()
    await close_mongodb()
    await close_redis()