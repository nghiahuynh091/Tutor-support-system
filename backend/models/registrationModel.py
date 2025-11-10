from typing import List, Dict, Any, Optional
from db.database import db
from datetime import datetime, timezone

class RegistrationModel:
    @staticmethod
    async def register_for_class(class_id: int, mentee_id: str) -> Dict[str, Any]:
        """
        Register a mentee for a class
        """
        # Check if class exists and has space
        class_query = """
            SELECT 
                id, 
                capacity, 
                current_enrolled, 
                registration_deadline,
                (registration_deadline < NOW()) as deadline_passed
            FROM classes
            WHERE id = $1
        """
        class_info = await db.execute_query(class_query, class_id)
        
        if not class_info:
            return {"success": False, "error": "Class not found"}
        
        class_data = class_info[0]
        
        # Check if registration deadline has passed
        # Để PostgreSQL tự xử lý timezone comparison
        if class_data['registration_deadline'] and class_data['deadline_passed']:
            return {"success": False, "error": "Registration deadline has passed"}
        
        # Check if class is full
        if class_data['current_enrolled'] >= class_data['capacity']:
            return {"success": False, "error": "Class is full"}
        
        # Check if already registered
        check_query = """
            SELECT class_id, mentee_id FROM class_registrations
            WHERE class_id = $1 AND mentee_id = $2
        """
        existing = await db.execute_query(check_query, class_id, mentee_id)
        
        if existing:
            return {"success": False, "error": "Already registered for this class"}
        
        # Insert registration
        insert_query = """
            INSERT INTO class_registrations (class_id, mentee_id, registration_log)
            VALUES ($1, $2, NOW())
            RETURNING class_id, mentee_id, registration_log
        """
        result = await db.execute_query(insert_query, class_id, mentee_id)
        
        # Update class enrollment count
        update_query = """
            UPDATE classes
            SET current_enrolled = current_enrolled + 1
            WHERE id = $1
        """
        await db.execute_query(update_query, class_id)
        
        return {"success": True, "data": result[0]}
    

    @staticmethod
    async def check_time_conflict(mentee_id: str, class_id: int) -> Dict[str, Any]:
        """
        Check if registering for a class would create a time conflict
        """
        query = """
            SELECT DISTINCT
                c1.id as conflicting_class_id,
                s1.subject_name as conflicting_subject,
                s1.subject_code as conflicting_subject_code,
                c1.week_day,
                c1.start_time as conflicting_start_time,
                c1.end_time as conflicting_end_time,
                c2.start_time as new_start_time,
                c2.end_time as new_end_time
            FROM class_registrations cr
            JOIN classes c1 ON cr.class_id = c1.id
            JOIN subjects s1 ON c1.subject_id = s1.id
            CROSS JOIN classes c2
            JOIN subjects s2 ON c2.subject_id = s2.id
            WHERE cr.mentee_id = $1
            AND c2.id = $2
            AND c1.id != c2.id
            AND c1.week_day = c2.week_day
            AND (
                -- Check if time periods overlap
                -- Overlap exists if: start1 < end2 AND end1 > start2
                c1.start_time < c2.end_time AND c1.end_time > c2.start_time
            )
        """
        conflicts = await db.execute_query(query, mentee_id, class_id)
        
        return {
            "has_conflict": len(conflicts) > 0,
            "conflicts": conflicts
        }