from typing import List, Dict, Any, Optional
from db.database import db
import bcrypt

class UserModel:
    @staticmethod
    async def get_all_users() -> List[Dict[str, Any]]:
        query = """
            SELECT
                u.id,
                u.email,
                u.full_name,
                ur.role,
                u.created_at,
                u.updated_at
            FROM "user" AS u
            LEFT JOIN user_roles AS ur
                ON u.id = ur.user_id
            ORDER BY u.created_at DESC;
        """
        return await db.execute_query(query)

    @staticmethod
    async def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
        # Hash password before storing
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(user_data["password"].encode('utf-8'), salt)
        role = user_data.get("role")
        
        # Insert new user
        async with db.pool.acquire() as conn:
            async with conn.transaction():
                
                insert_user_query = """
                    INSERT INTO "user" (email, password, full_name, created_at, updated_at)
                    VALUES ($1, $2, $3, NOW(), NOW())
                    RETURNING id;
                """
                user_id = await conn.fetchval(
                    insert_user_query,
                    user_data["email"],
                    hashed_password.decode('utf-8'),
                    user_data["full_name"]
                )
                
                insert_role_query = """
                    INSERT INTO user_roles (user_id, role) VALUES ($1, $2);
                """
                await conn.execute(insert_role_query, user_id, role)
                
                if role == "mentee":
                    insert_mentee_query = """
                        INSERT INTO mentee (user_id) VALUES ($1);
                    """
                    await conn.execute(insert_mentee_query, user_id)
                
                elif role == "tutor":
                    insert_tutor_query = """
                        INSERT INTO tutor (user_id) VALUES ($1);
                    """
                    await conn.execute(insert_tutor_query, user_id)
                
                return {
                    "id": user_id,
                    "email": user_data["email"],
                    "full_name": user_data["full_name"],
                    "role": role
                }

    @staticmethod
    async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        query = """
            SELECT 
                u.id,
                u.email,
                u.password,
                u.full_name,
                ur.role
            FROM "user" AS u
            LEFT JOIN user_roles AS ur
                ON u.id = ur.user_id
            WHERE u.email = $1;
        """
        result = await db.execute_query(query, email)
        return result[0] if result else None

