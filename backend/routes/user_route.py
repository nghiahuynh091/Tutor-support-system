from fastapi import APIRouter, HTTPException
from controllers.userController import UserController

# Create router for user-related endpoints
router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}}
)


@router.get("/")
async def get_all_users():
    """Get all users from database"""
    result = await UserController.get_all_users()
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])
