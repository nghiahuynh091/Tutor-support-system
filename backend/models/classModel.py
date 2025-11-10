from typing import List, Dict, Any, Optional
from db.database import db

class ClassModel:
    @staticmethod
    async def get_all_classes() -> List[Dict[str, Any]]:
        """
        Get all classes with optional filters
        Returns classes with their subject info and time slots
        """
        query = """
            SELECT 
                c.id,
                c.subject_id,
                c.tutor_id,
                c.location,
                c.capacity,
                c.current_enrolled,
                c.num_of_weeks,
                c.class_status,
                c.created_at,
                c.updated_at,
                c.start_time,
                c.end_time,
                c.registration_deadline,
                s.subject_name,
                s.subject_code,
                u.full_name as tutor_name,
                u.email as tutor_email,
                u.faculty as tutor_faculty
            FROM classes c
            JOIN subjects s ON c.subject_id = s.id
            LEFT JOIN "user" u ON c.tutor_id = u.id
            WHERE 1=1
        """
        
        params = []
        
        query += " ORDER BY c.created_at DESC"
        
        return await db.execute_query(query, *params)

    @staticmethod
    
    @staticmethod
    async def get_class_sessions(class_id: str) -> List[Dict[str, Any]]:
        """Get all sessions for a class"""
        query = """
            SELECT 
                id,
                class_id,
                session_date,
                week_number,
                day_of_week,
                start_period,
                end_period,
                duration_minutes,
                meeting_link,
                status,
                is_makeup_session,
                original_session_id,
                created_at,
                updated_at
            FROM sessions
            WHERE class_id = $1
            ORDER BY session_date, start_period
        """
        return await db.execute_query(query, class_id)