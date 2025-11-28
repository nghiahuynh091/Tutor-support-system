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
    async def create_class(tutor_id: str, class_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a class with all required attributes.

        class_data expected keys: subject_id, week_day, class_status, location, capacity, 
        start_time, end_time, num_of_weeks, registration_deadline, semester
        """
        subject_id = class_data.get("subject_id")
        week_day = class_data.get("week_day")
        class_status = class_data.get("class_status", "scheduled")
        location = class_data.get("location")
        capacity = class_data.get("capacity")
        start_time = class_data.get("start_time")
        end_time = class_data.get("end_time")
        num_of_weeks = class_data.get("num_of_weeks")
        registration_deadline = class_data.get("registration_deadline")
        semester = class_data.get("semester")

        # Check for time overlap with existing classes for the same tutor
        overlap_check_query = """
            SELECT id, start_time, end_time, week_day
            FROM classes 
            WHERE tutor_id = $1 
            AND week_day = $2 
            AND semester = $3
            AND class_status != 'cancelled'
            AND (
                (start_time <= $4 AND end_time > $4) OR  -- New start_time overlaps
                (start_time < $5 AND end_time >= $5) OR  -- New end_time overlaps
                (start_time >= $4 AND end_time <= $5)    -- Existing class is within new time range
            )
        """
        
        existing_classes = await db.execute_query(
            overlap_check_query, 
            tutor_id, 
            week_day, 
            semester, 
            start_time, 
            end_time
        )
        
        if existing_classes:
            overlapping_class = existing_classes[0]
            raise ValueError(
                f"Time conflict detected! Tutor already has a class on {week_day} "
                f"from {overlapping_class['start_time']} to {overlapping_class['end_time']} "
                f"in semester {semester} (Class ID: {overlapping_class['id']})"
            )

        insert_class_query = """
            INSERT INTO classes (
                tutor_id, 
                subject_id, 
                week_day, 
                class_status, 
                location, 
                capacity, 
                start_time, 
                end_time, 
                current_enrolled, 
                num_of_weeks, 
                registration_deadline, 
                semester, 
                created_at, 
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
            RETURNING id;
        """
        
        class_id = await db.execute_query(
            insert_class_query,
            tutor_id,
            subject_id,
            week_day,
            class_status,
            location,
            capacity,
            start_time,
            end_time,
            0,  # current_enrolled starts at 0
            num_of_weeks,
            registration_deadline,
            semester
        )

        return {"id": class_id[0]['id'] if class_id else None}