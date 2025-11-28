from typing import List, Dict, Any, Optional
from db.database import db

class SubjectModel:
    @staticmethod
    async def get_all_subjects() -> List[Dict[str, Any]]:
        """Get all subjects"""
        query = """
            SELECT 
                id,
                subject_name,
                subject_code,
                created_at
            FROM subjects
            ORDER BY subject_name ASC
        """
        return await db.execute_query(query)

    @staticmethod
    async def get_subject_by_id(subject_id: int) -> Optional[Dict[str, Any]]:
        """Get a subject by ID"""
        query = """
            SELECT 
                id,
                subject_name,
                subject_code,
                created_at
            FROM subjects
            WHERE id = $1
        """
        result = await db.execute_query(query, subject_id)
        return result[0] if result else None

    @staticmethod
    async def create_subject(subject_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new subject"""
        query = """
            INSERT INTO subjects (subject_name, subject_code)
            VALUES ($1, $2)
            RETURNING id, subject_name, subject_code, created_at
        """
        result = await db.execute_query(
            query,
            subject_data.get("subject_name"),
            subject_data.get("subject_code")
        )
        return result[0] if result else None