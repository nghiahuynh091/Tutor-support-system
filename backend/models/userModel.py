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
    async def create_user(email: str, password: str, full_name: str, role: str) -> Dict[str, Any]:
        # Hash password before storing
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        
        # Insert new user
        insert_profile_query = """
            INSERT INTO "user" (email, password, full_name, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING id;
        """
        
        # Create transaction to insert both profile and role
        async with db.pool.acquire() as conn:
            async with conn.transaction():
                user_id = await conn.fetchval(
                    insert_profile_query,
                    email,
                    hashed_password.decode('utf-8'),
                    full_name
                )
                
                # Insert user role
                insert_role_query = """
                    INSERT INTO user_roles (user_id, role)
                    VALUES ($1, $2);
                """
                await conn.execute(insert_role_query, user_id, role)
                
                return {
                    "id": user_id,
                    "email": email,
                    "full_name": full_name,
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

