from typing import List, Dict, Any, Optional
from db.database import db
from datetime import datetime, timedelta
from typing import Any

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
                c.week_day,
                c.semester,
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
    async def get_class_by_id(class_id: int) -> Optional[Dict[str, Any]]:
        """Get a class by its ID"""
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
                c.week_day,
                c.semester,
                c.registration_deadline,
                s.subject_name,
                s.subject_code,
                u.full_name as tutor_name,
                u.email as tutor_email,
                u.faculty as tutor_faculty
            FROM classes c
            JOIN subjects s ON c.subject_id = s.id
            LEFT JOIN "user" u ON c.tutor_id = u.id
            WHERE c.id = $1
        """
        result = await db.execute_query(query, class_id)
        return result[0] if result else None
    
    async def get_class_by_subject(subject_id: int) -> List[Dict[str, Any]]:
        """Get classes by subject ID"""
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
                c.week_day,
                c.semester,
                c.registration_deadline,
                s.subject_name,
                s.subject_code,
                u.full_name as tutor_name,
                u.email as tutor_email,
                u.faculty as tutor_faculty
            FROM classes c
            JOIN subjects s ON c.subject_id = s.id
            LEFT JOIN "user" u ON c.tutor_id = u.id
            WHERE c.subject_id = $1
            ORDER BY c.created_at DESC
        """
        return await db.execute_query(query, subject_id)

    @staticmethod
    async def create_class_and_sessions(tutor_id: str, class_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a class row and corresponding sessions based on time_slots and number_of_weeks.

        class_data expected keys: subject_id, description, max_students, number_of_weeks, meeting_link, time_slots
        time_slots: list of { dayOfWeek, startPeriod, endPeriod }
        """
        subject_id = class_data.get("subject_id")
        description = class_data.get("description")
        max_students = class_data.get("max_students")
        number_of_weeks = class_data.get("number_of_weeks")
        meeting_link = class_data.get("meeting_link")
        time_slots = class_data.get("time_slots", [])

        # Map frontend period to hour (same logic as frontend: hour = period + 5)
        def period_to_hour(period: int) -> int:
            return period + 5

        async with db.pool.acquire() as conn:
            async with conn.transaction():
                insert_class_query = """
                    INSERT INTO classes (tutor_id, subject_id, location, capacity, num_of_weeks, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                    RETURNING id;
                """
                # store meeting_link in location column for now (schema doesn't have meeting_link)
                class_id = await conn.fetchval(
                    insert_class_query,
                    tutor_id,
                    subject_id,
                    meeting_link,
                    max_students,
                    number_of_weeks,
                )

                # Create sessions: for each week and each time slot
                sessions_insert = """
                    INSERT INTO sessions (class_id, session_date_time, session_status, location, current_enrolled, max_enrolled, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                """

                created_sessions = []

                today = datetime.utcnow()

                for week in range(number_of_weeks):
                    for slot in time_slots:
                        day = int(slot.get("dayOfWeek"))
                        start_period = int(slot.get("startPeriod"))

                        # Compute next date for the requested weekday
                        # Convert day (1=Mon..7=Sun) to python weekday (Mon=0..Sun=6)
                        target_weekday = (day - 1) % 7
                        days_ahead = target_weekday - today.weekday()
                        if days_ahead <= 0:
                            days_ahead += 7
                        # add week offset
                        days_ahead += week * 7

                        session_date = (today + timedelta(days=days_ahead)).replace(hour=period_to_hour(start_period), minute=0, second=0, microsecond=0)

                        await conn.execute(
                            sessions_insert,
                            class_id,
                            session_date,
                            'scheduled',
                            meeting_link,
                            0,
                            max_students,
                        )

                        created_sessions.append({
                            "class_id": class_id,
                            "session_date_time": session_date.isoformat(),
                        })

                # Return created class id and sessions summary
                return {"id": class_id, "sessions_created": len(created_sessions)}