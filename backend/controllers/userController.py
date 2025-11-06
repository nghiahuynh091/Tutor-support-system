from typing import Dict, Any
from models.userModel import UserModel


class UserController:
    @staticmethod
    async def get_all_users() -> Dict[str, Any]:
        """Controller for getting all users - like your Node.js controllers"""
        try:
            users = await UserModel.get_all_users()
            return {
                "success": True,
                "users": users,
                "count": len(users),
                "message": "Users retrieved successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to fetch users: {str(e)}",
                "data": None
            }
