from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str
    confirmPassword: str
    company: str = ""
    phone: str = ""
    country: str = ""
    role: str = ""


class LoginResponse(BaseModel):
    status: str
    message: str
    token: str = None
    user: dict = None


@router.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    """
    POST /api/v1/auth/login
    
    Authenticate user with email and password.
    Returns session token on success.
    """
    # Basic validation - in production, check against database
    if not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    # Mock token generation - replace with real JWT in production
    token = f"token-{payload.email}-{hash(payload.password)}"
    
    return {
        "status": "success",
        "message": f"Welcome back, {payload.email}!",
        "token": token,
        "user": {
            "email": payload.email,
            "role": "user"
        }
    }


@router.post("/auth/register", response_model=LoginResponse)
def register(payload: RegisterRequest):
    """
    POST /api/v1/auth/register
    
    Register new user account.
    Returns session token on success.
    """
    if payload.password != payload.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Mock token generation - replace with real JWT in production
    token = f"token-{payload.email}-{hash(payload.password)}"
    
    return {
        "status": "success",
        "message": f"Account created successfully for {payload.email}!",
        "token": token,
        "user": {
            "firstName": payload.firstName,
            "lastName": payload.lastName,
            "email": payload.email,
            "company": payload.company,
            "role": payload.role or "user"
        }
    }
