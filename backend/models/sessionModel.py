from typing import List, Dict, Any, Optional
from db.database import db


class SessionModel:
    @staticmethod
    async def get_sessions_by_mentee(mentee_id: str) -> List[Dict[str, Any]]:
        """
        Get all sessions for a mentee (from classes they registered)
        """
        query = """
            SELECT 
                s.class_id,
                s.session_id,
                s.session_date,
                s.session_status,
                s.location,
                s.start_time,
                s.end_time,
                s.week_day,
                s.created_at,
                s.updated_at,
                c.semester,
                c.class_status,
                sub.subject_name,
                sub.subject_code,
                u.full_name as tutor_name,
                u.email as tutor_email
            FROM sessions s
            JOIN classes c ON s.class_id = c.id
            JOIN subjects sub ON c.subject_id = sub.id
            LEFT JOIN "user" u ON c.tutor_id = u.id
            JOIN class_registrations cr ON c.id = cr.class_id
            WHERE cr.mentee_id = $1
            ORDER BY s.session_date ASC, s.start_time ASC
        """
        return await db.execute_query(query, mentee_id)

    @staticmethod
    async def get_sessions_by_mentee_and_class(mentee_id: str, class_id: int) -> List[Dict[str, Any]]:
        """
        Get all sessions for a mentee in a specific class
        """
        # First verify mentee is registered for this class
        check_query = """
            SELECT class_id FROM class_registrations
            WHERE mentee_id = $1 AND class_id = $2
        """
        registration = await db.execute_query(check_query, mentee_id, class_id)
        
        if not registration:
            return None  # Mentee not registered for this class
        
        query = """
            SELECT 
                s.class_id,
                s.session_id,
                s.session_date,
                s.session_status,
                s.location,
                s.start_time,
                s.end_time,
                s.week_day,
                s.created_at,
                s.updated_at,
                c.semester,
                c.class_status,
                sub.subject_name,
                sub.subject_code,
                u.full_name as tutor_name,
                u.email as tutor_email
            FROM sessions s
            JOIN classes c ON s.class_id = c.id
            JOIN subjects sub ON c.subject_id = sub.id
            LEFT JOIN "user" u ON c.tutor_id = u.id
            WHERE s.class_id = $1
            ORDER BY s.session_date ASC, s.start_time ASC
        """
        return await db.execute_query(query, class_id)

    @staticmethod
    async def get_sessions_by_tutor(tutor_id: str) -> List[Dict[str, Any]]:
        """
        Get all sessions for a tutor (from classes they teach)
        """
        query = """
            SELECT 
                s.class_id,
                s.session_id,
                s.session_date,
                s.session_status,
                s.location,
                s.start_time,
                s.end_time,
                s.week_day,
                s.created_at,
                s.updated_at,
                c.semester,
                c.class_status,
                c.current_enrolled,
                c.capacity,
                sub.subject_name,
                sub.subject_code
            FROM sessions s
            JOIN classes c ON s.class_id = c.id
            JOIN subjects sub ON c.subject_id = sub.id
            WHERE c.tutor_id = $1
            ORDER BY s.session_date ASC, s.start_time ASC
        """
        return await db.execute_query(query, tutor_id)

    @staticmethod
    async def get_sessions_by_tutor_and_class(tutor_id: str, class_id: int) -> List[Dict[str, Any]]:
        """
        Get all sessions for a tutor in a specific class
        """
        # First verify tutor owns this class
        check_query = """
            SELECT id FROM classes
            WHERE id = $1 AND tutor_id = $2
        """
        class_exists = await db.execute_query(check_query, class_id, tutor_id)
        
        if not class_exists:
            return None  # Tutor doesn't own this class
        
        query = """
            SELECT 
                s.class_id,
                s.session_id,
                s.session_date,
                s.session_status,
                s.location,
                s.start_time,
                s.end_time,
                s.week_day,
                s.created_at,
                s.updated_at,
                c.semester,
                c.class_status,
                c.current_enrolled,
                c.capacity,
                sub.subject_name,
                sub.subject_code
            FROM sessions s
            JOIN classes c ON s.class_id = c.id
            JOIN subjects sub ON c.subject_id = sub.id
            WHERE s.class_id = $1
            ORDER BY s.session_date ASC, s.start_time ASC
        """
        return await db.execute_query(query, class_id)

    @staticmethod
    async def get_session_by_id(class_id: int, session_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific session by class_id and session_id
        """
        query = """
            SELECT 
                s.class_id,
                s.session_id,
                s.session_date,
                s.session_status,
                s.location,
                s.start_time,
                s.end_time,
                s.week_day,
                s.created_at,
                s.updated_at,
                c.tutor_id,
                c.semester,
                c.class_status,
                sub.subject_name,
                sub.subject_code
            FROM sessions s
            JOIN classes c ON s.class_id = c.id
            JOIN subjects sub ON c.subject_id = sub.id
            WHERE s.class_id = $1 AND s.session_id = $2
        """
        result = await db.execute_query(query, class_id, session_id)
        return result[0] if result else None

    @staticmethod
    async def update_session_status(class_id: int, session_id: int, new_status: str) -> Optional[Dict[str, Any]]:
        """
        Update session status
        """
        # Check if session exists
        check_query = """
            SELECT class_id, session_id, session_status 
            FROM sessions
            WHERE class_id = $1 AND session_id = $2
        """
        existing = await db.execute_query(check_query, class_id, session_id)
        
        if not existing:
            return None
        
        # Update session status
        update_query = """
            UPDATE sessions
            SET session_status = $1
            WHERE class_id = $2 AND session_id = $3
            RETURNING class_id, session_id, session_date, session_status, location, start_time, end_time, week_day, created_at, updated_at
        """
        result = await db.execute_query(update_query, new_status, class_id, session_id)
        
        return result[0] if result else None

    @staticmethod
    async def verify_tutor_owns_class(tutor_id: str, class_id: int) -> bool:
        """
        Verify that a tutor owns a specific class
        """
        query = """
            SELECT id FROM classes
            WHERE id = $1 AND tutor_id = $2
        """
        result = await db.execute_query(query, class_id, tutor_id)
        return len(result) > 0
