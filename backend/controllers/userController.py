from typing import Dict, Any
from models.userModel import UserModel
from middleware.auth import create_access_token
import bcrypt


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

    @staticmethod
    async def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Controller for creating a new user"""
        try:
            # Validate required fields
            required_fields = ["email", "password", "full_name", "role"]
            for field in required_fields:
                if field not in user_data:
                    return {
                        "success": False,
                        "error": f"Missing required field: {field}",
                        "data": None
                    }

            # Create new user
            user = await UserModel.create_user(
                email=user_data["email"],
                password=user_data["password"],
                full_name=user_data["full_name"],
                role=user_data["role"]
            )

            return {
                "success": True,
                "user": user,
                "message": "User created successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to create user: {str(e)}",
                "data": None
            }

    @staticmethod
    async def login_user(credentials: Dict[str, Any]) -> Dict[str, Any]:
        """Controller for user login"""
        try:
            email = credentials.get("email")
            password = credentials.get("password")

            if not email or not password:
                 return {
                    "success": False,
                    "error": "Missing email or password",
                    "data": None
                }

            user = await UserModel.get_user_by_email(email)
            if not user:
                return {
                    "success": False,
                    "error": "Invalid email or password",
                    "data": None
                }

            if not bcrypt.checkpw(
                password.encode('utf-8'),
                user["password"].encode('utf-8')
            ):
                return {
                    "success": False,
                    "error": "Invalid email or password",
                    "data": None
                }

            token_data = {
                "sub": str(user["id"]),
                "role": user["role"]
            }
            token = create_access_token(data=token_data)

            return {
                "success": True,
                "token": token,
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "full_name": user["full_name"],
                    "role": user["role"]
                },
                "message": "Login successful"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Login failed: {str(e)}",
                "data": None
            }
