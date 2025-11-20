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

    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        """Return user profile joined with mentee/tutor details."""
        query = """
            SELECT
                u.id,
                u.email,
                u.full_name,
                u.faculty,
                u.bio,
                ur.role,
                t.major AS tutor_major,
                t.expertise_areas,
                m.major AS mentee_major,
                m.learning_needs
            FROM "user" AS u
            LEFT JOIN user_roles AS ur ON u.id = ur.user_id
            LEFT JOIN tutor AS t ON u.id = t.user_id
            LEFT JOIN mentee AS m ON u.id = m.user_id
            WHERE u.id = $1;
        """
        result = await db.execute_query(query, user_id)
        return result[0] if result else None

    @staticmethod
    async def update_user_detail(user_id: str, role: str, field: str, value: str) -> Dict[str, Any]:
        """Update the mentee/tutor detail field (upsert if necessary).

        field should be one of: 'learning_needs' (for mentee) or 'expertise_areas' (for tutor)
        """
        # Use pool directly for transactional upsert
        async with db.pool.acquire() as conn:
            async with conn.transaction():
                if role == "mentee" and field == "learning_needs":
                    # Try update first
                    res = await conn.execute(
                        "UPDATE mentee SET learning_needs=$1 WHERE user_id=$2",
                        value,
                        user_id,
                    )
                    if res == "UPDATE 0":
                        await conn.execute(
                            "INSERT INTO mentee (user_id, learning_needs) VALUES ($1, $2)",
                            user_id,
                            value,
                        )

                elif role == "tutor" and field == "expertise_areas":
                    res = await conn.execute(
                        "UPDATE tutor SET expertise_areas=$1 WHERE user_id=$2",
                        value,
                        user_id,
                    )
                    if res == "UPDATE 0":
                        await conn.execute(
                            "INSERT INTO tutor (user_id, expertise_areas) VALUES ($1, $2)",
                            user_id,
                            value,
                        )
                else:
                    raise ValueError("Invalid role/field combination")

        # Return the updated profile
        return await UserModel.get_user_by_id(user_id)

