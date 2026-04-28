import os
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field

from backend.utils.auth_utils import create_access_token, get_current_user, verify_password
from backend.utils.mock_db import create_user, get_user_by_email, update_user_password


router = APIRouter()
RESET_TOKENS: dict = {}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str = ""
    last_name: str = ""
    phone: str = ""
    company_name: str = ""
    role: str = ""
    country: str = ""


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)


def _public_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip(),
        "role": user.get("role", ""),
        "company": user.get("company_name", ""),
    }


@router.post("/login")
async def login(data: LoginRequest):
    user = get_user_by_email(data.email)
    if not user:
        raise HTTPException(status_code=401, detail="No account found with this email")

    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect password")

    token = create_access_token({"sub": user["id"], "email": user["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _public_user(user),
    }


@router.post("/register")
async def register(data: RegisterRequest):
    try:
        user = create_user(data.model_dump())
        token = create_access_token({"sub": user["id"], "email": user["email"]})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": _public_user(user),
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    email = data.email.lower().strip()
    user = get_user_by_email(email)

    token = secrets.token_urlsafe(32)
    if user:
        RESET_TOKENS[token] = {
            "email": email,
            "expires": datetime.utcnow() + timedelta(minutes=30),
        }

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    print(f"Reset token for {email}: {token}")
    print(f"Reset link: {frontend_url}/reset-password?token={token}")

    return {
        "message": "If an account exists with this email, a reset link has been sent.",
        "debug_token": token if os.getenv("ENVIRONMENT") == "development" else None,
    }


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    token_data = RESET_TOKENS.get(data.token)
    if not token_data:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    if datetime.utcnow() > token_data["expires"]:
        del RESET_TOKENS[data.token]
        raise HTTPException(
            status_code=400,
            detail="Reset link has expired. Please request a new one.",
        )

    success = update_user_password(token_data["email"], data.new_password)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")

    del RESET_TOKENS[data.token]
    return {"message": "Password reset successfully. You can now log in."}


@router.get("/verify-reset-token/{token}")
async def verify_reset_token(token: str):
    token_data = RESET_TOKENS.get(token)
    if not token_data:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    if datetime.utcnow() > token_data["expires"]:
        del RESET_TOKENS[token]
        raise HTTPException(status_code=400, detail="Reset token has expired")

    return {"valid": True, "email": token_data["email"]}
