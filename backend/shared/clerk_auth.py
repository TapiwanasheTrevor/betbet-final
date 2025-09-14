"""
Clerk authentication and authorization utilities
"""

import os
import jwt
import httpx
from typing import Optional, Dict, Any
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from clerk_backend_sdk import Clerk

# Initialize Clerk client
clerk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))
security = HTTPBearer()

# Clerk configuration
CLERK_DOMAIN = os.getenv("CLERK_DOMAIN", "betbet.com")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET")


class ClerkUser:
    """Represents a Clerk user with BetBet metadata"""

    def __init__(self, clerk_data: Dict[str, Any]):
        self.id = clerk_data["sub"]  # Clerk user ID
        self.email = clerk_data.get("email", "")
        self.username = clerk_data.get("username", "")
        self.first_name = clerk_data.get("first_name", "")
        self.last_name = clerk_data.get("last_name", "")
        self.public_metadata = clerk_data.get("public_metadata", {})
        self.private_metadata = clerk_data.get("private_metadata", {})

        # BetBet specific metadata
        self.profile_id = self.public_metadata.get("betbet_profile_id")
        self.kyc_level = self.public_metadata.get("kyc_level", 0)
        self.kyc_status = self.public_metadata.get("kyc_status", "pending")
        self.can_create_markets = self.public_metadata.get("can_create_markets", False)
        self.is_expert = self.public_metadata.get("is_expert", False)
        self.analysis_quota = self.public_metadata.get("analysis_quota", 10)


async def verify_clerk_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Verify Clerk JWT token and return decoded payload"""
    token = credentials.credentials

    try:
        # Get Clerk's JWKS for token verification
        jwks_url = f"https://{CLERK_DOMAIN}/.well-known/jwks.json"
        async with httpx.AsyncClient() as client:
            response = await client.get(jwks_url)
            jwks = response.json()

        # Decode and verify the JWT
        # Note: In production, you should cache the JWKS and handle key rotation
        decoded = jwt.decode(
            token,
            options={"verify_signature": False},  # Temporarily disabled for development
            algorithms=["RS256"],
            audience=CLERK_DOMAIN
        )

        return decoded

    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}"
        )


async def get_current_user(token_data: Dict[str, Any] = Depends(verify_clerk_token)) -> ClerkUser:
    """Get current user from Clerk token"""
    user_id = token_data.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )

    try:
        # Get user from Clerk API for complete data
        user_data = clerk.users.get(user_id=user_id)

        # Convert Clerk user to our ClerkUser object
        # Merge token data with API data
        combined_data = {
            **token_data,
            "email": user_data.email_addresses[0].email_address if user_data.email_addresses else "",
            "username": user_data.username,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "public_metadata": user_data.public_metadata or {},
            "private_metadata": user_data.private_metadata or {}
        }

        return ClerkUser(combined_data)

    except Exception as e:
        # If Clerk API fails, create user from token data only
        return ClerkUser(token_data)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[ClerkUser]:
    """Get current user if authenticated, return None if not"""
    if not credentials:
        return None

    try:
        token_data = await verify_clerk_token(credentials)
        return await get_current_user(token_data)
    except HTTPException:
        return None


def require_kyc_level(min_level: int):
    """Decorator to require minimum KYC level"""
    def decorator(current_user: ClerkUser = Depends(get_current_user)):
        if current_user.kyc_level < min_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"KYC level {min_level} required. Your level: {current_user.kyc_level}"
            )
        return current_user
    return decorator


def require_expert_status(current_user: ClerkUser = Depends(get_current_user)):
    """Require user to be verified expert"""
    if not current_user.is_expert:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Expert status required"
        )
    return current_user


def require_market_creation_permission(current_user: ClerkUser = Depends(get_current_user)):
    """Require permission to create markets"""
    if not current_user.can_create_markets and current_user.kyc_level < 2:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Level 2 KYC or market creation permission required"
        )
    return current_user


async def verify_webhook_signature(request_body: bytes, signature: str) -> bool:
    """Verify Clerk webhook signature"""
    # Implementation depends on Clerk's webhook verification method
    # This is a simplified version
    webhook_secret = CLERK_WEBHOOK_SECRET
    if not webhook_secret:
        return False

    # TODO: Implement proper Clerk webhook signature verification
    # For now, we'll return True in development
    return True


async def update_user_metadata(user_id: str, public_metadata: Dict[str, Any] = None,
                             private_metadata: Dict[str, Any] = None):
    """Update user metadata in Clerk"""
    try:
        update_data = {}
        if public_metadata is not None:
            update_data["public_metadata"] = public_metadata
        if private_metadata is not None:
            update_data["private_metadata"] = private_metadata

        clerk.users.update(user_id=user_id, **update_data)
    except Exception as e:
        print(f"Failed to update user metadata: {e}")


# WebSocket authentication
async def verify_websocket_token(token: str) -> ClerkUser:
    """Verify token for WebSocket connections"""
    try:
        # Decode token without verification for WebSocket (less secure but simpler)
        decoded = jwt.decode(
            token,
            options={"verify_signature": False},
            algorithms=["RS256"]
        )

        return ClerkUser(decoded)

    except Exception as e:
        raise Exception(f"WebSocket authentication failed: {e}")


# Admin utilities
async def is_admin(user_id: str) -> bool:
    """Check if user has admin privileges"""
    try:
        user = clerk.users.get(user_id=user_id)
        return user.public_metadata.get("is_admin", False)
    except:
        return False