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
            user_data_dict = user_data.model_dump() 
            
            user = await UserModel.create_user(user_data_dict)

            return {
                "success": True,
                "user": user,
                "message": "User created successfully"
            }
        except Exception as e:
            if "unique constraint" in str(e).lower():
                 return {
                    "success": False,
                    "error": "Email already exists",
                    "data": None
                }
            
            return {
                "success": False,
                "error": f"Failed to create user: {str(e)}",
                "data": None
            }

    @staticmethod
    async def login_user(credentials: Dict[str, Any]) -> Dict[str, Any]:
        """Controller for user login"""
        try:
            credentials_dict = credentials.model_dump()
            email = credentials_dict.get("email")
            password = credentials_dict.get("password")

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

    @staticmethod
    async def get_current_user(token_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Return the current user's profile based on token payload (sub)."""
        try:
            user_id = token_payload.get("sub")
            if not user_id:
                return {"success": False, "error": "Invalid token payload", "data": None}

            user = await UserModel.get_user_by_id(user_id)
            if not user:
                return {"success": False, "error": "User not found", "data": None}

            return {"success": True, "user": user}
        except Exception as e:
            return {"success": False, "error": f"Failed to fetch user: {str(e)}", "data": None}

    @staticmethod
    async def update_profile(token_payload: Dict[str, Any], update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update the current user's mentee/tutor field (learning_needs or expertise_areas)."""
        try:
            user_id = token_payload.get("sub")
            role = token_payload.get("role")
            if not user_id or not role:
                return {"success": False, "error": "Invalid token payload", "data": None}

            # Only allow mentee -> learning_needs, tutor -> expertise_areas
            if role == "mentee":
                new_value = update_data.get("learning_needs")
                if new_value is None:
                    return {"success": False, "error": "Missing learning_needs for mentee", "data": None}
                updated = await UserModel.update_user_detail(user_id, role, "learning_needs", new_value)

            elif role == "tutor":
                new_value = update_data.get("expertise_areas")
                if new_value is None:
                    return {"success": False, "error": "Missing expertise_areas for tutor", "data": None}
                updated = await UserModel.update_user_detail(user_id, role, "expertise_areas", new_value)

            else:
                return {"success": False, "error": "Role not allowed to update profile field", "data": None}

            return {"success": True, "user": updated, "message": "Profile updated successfully"}

        except ValueError as ve:
            return {"success": False, "error": str(ve), "data": None}
        except Exception as e:
            return {"success": False, "error": f"Failed to update profile: {str(e)}", "data": None}
