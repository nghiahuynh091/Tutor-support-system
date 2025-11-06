from typing import List, Dict, Any
from db.database import db


class UserModel:
    @staticmethod
    async def get_all_users() -> List[Dict[str, Any]]:
        query = """
            SELECT
                id,
                email,
                full_name,
                user_type,
                created_at,
                updated_at,
                is_active
            FROM users
            WHERE is_active = true
            ORDER BY created_at DESC
        """
        return await db.execute_query(query)
