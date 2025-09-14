"""
BetBet User Profile Service
Handles user profiles, KYC, and integration with Clerk authentication
"""

import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

import sys
sys.path.append('../..')
from shared.database import init_all_databases, close_all_databases, get_db
from shared.clerk_auth import (
    ClerkUser, get_current_user, verify_webhook_signature,
    update_user_metadata, is_admin
)
from shared.models import (
    UserProfile, KYCDocument,
    UserProfileCreate, UserProfileResponse
)


# Lifespan manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting User Profile Service...")
    await init_all_databases()
    yield
    # Shutdown
    print("Shutting down User Profile Service...")
    await close_all_databases()


# Create FastAPI app
app = FastAPI(
    title="BetBet User Profile Service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Clerk Webhook Handlers
# =============================================================================

@app.post("/api/v1/webhooks/clerk/user-created")
async def handle_user_created(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Clerk user.created webhook - maps to Onboarding UI"""
    body = await request.body()
    headers = dict(request.headers)

    # Verify webhook signature
    signature = headers.get("svix-signature", "")
    if not await verify_webhook_signature(body, signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    data = await request.json()
    user_data = data["data"]

    try:
        # Create user profile in our database
        clerk_user_id = user_data["id"]
        email = user_data["email_addresses"][0]["email_address"]
        username = user_data.get("username") or email.split("@")[0]

        # Check if profile already exists
        existing = await db.execute(
            select(UserProfile).where(UserProfile.clerk_user_id == clerk_user_id)
        )
        if existing.scalar_one_or_none():
            return {"status": "already_exists", "clerk_user_id": clerk_user_id}

        # Generate unique referral code
        referral_code = await generate_unique_referral_code(db)

        # Create profile
        profile = UserProfile(
            clerk_user_id=clerk_user_id,
            username=username,
            email=email,
            display_name=f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip(),
            avatar_url=user_data.get("profile_image_url"),
            referral_code=referral_code
        )

        db.add(profile)
        await db.commit()
        await db.refresh(profile)

        # Update Clerk metadata
        await update_user_metadata(
            clerk_user_id,
            public_metadata={
                "betbet_profile_id": str(profile.id),
                "referral_code": referral_code,
                "kyc_level": 0,
                "kyc_status": "pending"
            }
        )

        return {"status": "success", "profile_id": str(profile.id)}

    except Exception as e:
        print(f"Error creating user profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to create user profile")


@app.post("/api/v1/webhooks/clerk/user-updated")
async def handle_user_updated(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Clerk user.updated webhook"""
    body = await request.body()
    headers = dict(request.headers)

    signature = headers.get("svix-signature", "")
    if not await verify_webhook_signature(body, signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    data = await request.json()
    user_data = data["data"]
    clerk_user_id = user_data["id"]

    try:
        # Update profile in our database
        stmt = (
            update(UserProfile)
            .where(UserProfile.clerk_user_id == clerk_user_id)
            .values(
                email=user_data["email_addresses"][0]["email_address"],
                username=user_data.get("username"),
                display_name=f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip(),
                avatar_url=user_data.get("profile_image_url"),
                updated_at=datetime.utcnow()
            )
        )
        await db.execute(stmt)
        await db.commit()

        return {"status": "success"}

    except Exception as e:
        print(f"Error updating user profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user profile")


@app.post("/api/v1/webhooks/clerk/session-created")
async def handle_session_created(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Clerk session.created webhook - track user activity"""
    body = await request.body()
    headers = dict(request.headers)

    signature = headers.get("svix-signature", "")
    if not await verify_webhook_signature(body, signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    data = await request.json()
    clerk_user_id = data["data"]["user_id"]

    try:
        # Update last seen
        stmt = (
            update(UserProfile)
            .where(UserProfile.clerk_user_id == clerk_user_id)
            .values(last_seen=datetime.utcnow())
        )
        await db.execute(stmt)
        await db.commit()

        return {"status": "success"}

    except Exception as e:
        print(f"Error updating last seen: {e}")
        return {"status": "error", "message": str(e)}


# =============================================================================
# Profile Management Endpoints
# =============================================================================

@app.get("/api/v1/users/profile", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: ClerkUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user profile - maps to Profile View"""
    profile = await get_profile_by_clerk_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile


@app.get("/api/v1/users/{user_id}/profile", response_model=UserProfileResponse)
async def get_user_profile(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get user profile by ID - maps to Public Profile View"""
    try:
        profile_id = uuid.UUID(user_id)
        result = await db.execute(
            select(UserProfile).where(UserProfile.id == profile_id)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        return profile

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")


@app.put("/api/v1/users/profile", response_model=UserProfileResponse)
async def update_my_profile(
    profile_data: dict,
    current_user: ClerkUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile - maps to Profile Settings"""
    profile = await get_profile_by_clerk_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    try:
        # Update allowed fields
        allowed_fields = {
            'display_name', 'bio', 'country_code', 'timezone', 'language'
        }

        update_data = {k: v for k, v in profile_data.items() if k in allowed_fields}
        update_data['updated_at'] = datetime.utcnow()

        if update_data:
            stmt = (
                update(UserProfile)
                .where(UserProfile.id == profile.id)
                .values(**update_data)
            )
            await db.execute(stmt)
            await db.commit()

            # Refresh profile
            await db.refresh(profile)

        return profile

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")


@app.get("/api/v1/users/stats")
async def get_my_stats(
    current_user: ClerkUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user statistics - maps to Performance Tracker"""
    profile = await get_profile_by_clerk_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Calculate additional stats
    stats = {
        "profile_id": str(profile.id),
        "skill_rating": profile.skill_rating,
        "total_earnings": float(profile.total_earnings),
        "total_wagered": float(profile.total_wagered),
        "verified_expert": profile.verified_expert,
        "member_since": profile.created_at,
        "last_active": profile.last_seen,
        "kyc_level": current_user.kyc_level,
        "kyc_status": current_user.kyc_status
    }

    return stats


# =============================================================================
# KYC Management Endpoints
# =============================================================================

@app.post("/api/v1/kyc/submit")
async def submit_kyc_document(
    document_type: str,
    document_url: str,  # In production, handle file upload
    current_user: ClerkUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit KYC document - maps to KYC Process UI"""
    profile = await get_profile_by_clerk_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    try:
        # Create KYC document record
        kyc_doc = KYCDocument(
            user_profile_id=profile.id,
            clerk_user_id=current_user.id,
            document_type=document_type,
            document_url=document_url,
            status="pending"
        )

        db.add(kyc_doc)
        await db.commit()
        await db.refresh(kyc_doc)

        # Update Clerk metadata
        await update_user_metadata(
            current_user.id,
            public_metadata={
                **current_user.public_metadata,
                "kyc_status": "pending",
                "kyc_documents_submitted": True
            }
        )

        return {"status": "success", "document_id": str(kyc_doc.id)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit KYC: {str(e)}")


@app.get("/api/v1/kyc/status")
async def get_kyc_status(
    current_user: ClerkUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get KYC verification status"""
    profile = await get_profile_by_clerk_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Get KYC documents
    result = await db.execute(
        select(KYCDocument)
        .where(KYCDocument.user_profile_id == profile.id)
        .order_by(KYCDocument.created_at.desc())
    )
    documents = result.scalars().all()

    status = {
        "kyc_level": current_user.kyc_level,
        "kyc_status": current_user.kyc_status,
        "documents": [
            {
                "id": str(doc.id),
                "document_type": doc.document_type,
                "status": doc.status,
                "submitted_at": doc.created_at,
                "verified_at": doc.verified_at
            }
            for doc in documents
        ]
    }

    return status


@app.post("/api/v1/kyc/verify/{user_profile_id}")
async def verify_kyc(
    user_profile_id: str,
    verification_data: dict,
    current_user: ClerkUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify KYC document (admin only)"""
    # Check admin permission
    if not await is_admin(current_user.id):
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        profile_uuid = uuid.UUID(user_profile_id)

        # Get profile
        result = await db.execute(
            select(UserProfile).where(UserProfile.id == profile_uuid)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        # Update KYC status
        document_id = verification_data.get("document_id")
        new_status = verification_data.get("status")  # 'approved' or 'rejected'
        kyc_level = verification_data.get("kyc_level", 1)

        if document_id:
            stmt = (
                update(KYCDocument)
                .where(KYCDocument.id == uuid.UUID(document_id))
                .values(
                    status=new_status,
                    kyc_level=kyc_level if new_status == 'approved' else 0,
                    verified_at=datetime.utcnow() if new_status == 'approved' else None,
                    verified_by=current_user.profile_id
                )
            )
            await db.execute(stmt)

        await db.commit()

        # Update Clerk metadata
        await update_user_metadata(
            profile.clerk_user_id,
            public_metadata={
                "kyc_status": "verified" if new_status == 'approved' else "rejected",
                "kyc_level": kyc_level if new_status == 'approved' else 0
            }
        )

        return {"status": "success", "new_kyc_level": kyc_level}

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify KYC: {str(e)}")


# =============================================================================
# Referral System
# =============================================================================

@app.post("/api/v1/referrals/generate")
async def generate_referral_code(
    current_user: ClerkUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate referral code for user"""
    profile = await get_profile_by_clerk_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if profile.referral_code:
        return {"referral_code": profile.referral_code}

    # Generate new code
    new_code = await generate_unique_referral_code(db)

    stmt = (
        update(UserProfile)
        .where(UserProfile.id == profile.id)
        .values(referral_code=new_code)
    )
    await db.execute(stmt)
    await db.commit()

    return {"referral_code": new_code}


@app.post("/api/v1/referrals/apply")
async def apply_referral_code(
    code: str,
    current_user: ClerkUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Apply referral code during registration"""
    profile = await get_profile_by_clerk_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if profile.referred_by:
        raise HTTPException(status_code=400, detail="Referral already applied")

    # Find referrer
    result = await db.execute(
        select(UserProfile).where(UserProfile.referral_code == code)
    )
    referrer = result.scalar_one_or_none()

    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code")

    if referrer.id == profile.id:
        raise HTTPException(status_code=400, detail="Cannot refer yourself")

    # Apply referral
    stmt = (
        update(UserProfile)
        .where(UserProfile.id == profile.id)
        .values(referred_by=referrer.id)
    )
    await db.execute(stmt)
    await db.commit()

    return {
        "status": "success",
        "referrer": {
            "username": referrer.username,
            "display_name": referrer.display_name
        }
    }


# =============================================================================
# Utility Functions
# =============================================================================

async def get_profile_by_clerk_id(db: AsyncSession, clerk_user_id: str) -> Optional[UserProfile]:
    """Get user profile by Clerk user ID"""
    result = await db.execute(
        select(UserProfile).where(UserProfile.clerk_user_id == clerk_user_id)
    )
    return result.scalar_one_or_none()


async def generate_unique_referral_code(db: AsyncSession) -> str:
    """Generate unique referral code"""
    import random
    import string

    while True:
        code = "BETBET" + "".join(random.choices(string.digits + string.ascii_uppercase, k=6))

        # Check if code exists
        result = await db.execute(
            select(UserProfile).where(UserProfile.referral_code == code)
        )
        if not result.scalar_one_or_none():
            return code


# =============================================================================
# Health Check
# =============================================================================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "user_profile"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )