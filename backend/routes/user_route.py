from fastapi import APIRouter, HTTPException, Body, Depends
from controllers.userController import UserController
from middleware.auth import verify_token, authorize
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import Dict, Any
from schemas.user_schema import UserRegisterSchema, UserLoginSchema

security = HTTPBearer()

# Create router for user-related endpoints
router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}}
)


@router.get("/")
async def get_all_users(current_user: dict = Depends(authorize(allowed_roles=["admin"]))):
    """Get all users from database"""
    result = await UserController.get_all_users()
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])


@router.post("/register")
async def register_user(user_data: UserRegisterSchema):
    """Register a new user"""
    result = await UserController.create_user(user_data)
    if result["success"]:
        if "user" in result and "password" in result["user"]:
            del result["user"]["password"]
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])


@router.post("/login")
async def login_user(credentials: UserLoginSchema):
    """Login user and return JWT token"""
    result = await UserController.login_user(credentials)
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=401, detail=result["error"])
