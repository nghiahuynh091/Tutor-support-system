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
                subject_id,
                capacity,
                semester,
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

        # Check if already registered for the SAME SUBJECT in SAME SEMESTER
        conflict_query = """
            SELECT 
                c1.id as conflicting_class_id,
                s1.subject_name,
                s1.subject_code
            FROM classes c1
            JOIN class_registrations cr ON c1.id = cr.class_id
            JOIN subjects s1 ON c1.subject_id = s1.id
            WHERE cr.mentee_id = $1 
            AND c1.semester = $2
            AND c1.subject_id = $3
        """
        conflicts = await db.execute_query(
            conflict_query, 
            mentee_id, 
            class_data['semester'],
            class_data['subject_id']  # Thêm subject_id
        )
        
        if conflicts:
            conflict_info = conflicts[0]
            return {
                "success": False,
                "error": f"Already registered for {conflict_info['subject_code']} - {conflict_info['subject_name']} (Class ID: {conflict_info['conflicting_class_id']}) in semester {class_data['semester']}"
            }

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
    async def cancel_registration(class_id: int, mentee_id: str) -> Dict[str, Any]:
        """
        Cancel a class registration
        """
        # Check if registration exists
        check_query = """
            SELECT class_id, mentee_id FROM class_registrations
            WHERE class_id = $1 AND mentee_id = $2
        """
        existing = await db.execute_query(check_query, class_id, mentee_id)
        
        if not existing:
            return {"success": False, "error": "Registration not found"}
        
        # Delete registration
        delete_query = """
            DELETE FROM class_registrations
            WHERE class_id = $1 AND mentee_id = $2
            RETURNING class_id, mentee_id
        """
        result = await db.execute_query(delete_query, class_id, mentee_id)
        
        # Decrease class enrollment count
        decrease_query = """
            UPDATE classes
            SET current_enrolled = current_enrolled - 1
            WHERE id = $1 AND current_enrolled > 0
        """
        await db.execute_query(decrease_query, class_id)
        
        return {"success": True, "data": result[0]}
    
    @staticmethod
    async def reschedule_class(
        old_class_id: int, 
        new_class_id: int, 
        mentee_id: str
    ) -> Dict[str, Any]:
        """
        Reschedule from old class to new class
        Steps:
        1. Validate old registration exists
        2. Check old class deadline hasn't passed
        3. Validate new class exists and has space
        4. Check new class deadline hasn't passed
        5. Check no time conflict with other classes (excluding old class)
        6. Update registration (atomic operation)
        """

        # check 2 class have same subject id
        subject_check_query = """
            SELECT 
                c1.subject_id as old_subject_id,
                c2.subject_id as new_subject_id 
            FROM classes c1
            CROSS JOIN classes c2
            WHERE c1.id = $1 AND c2.id = $2
            """
        subject_check = await db.execute_query(subject_check_query, old_class_id, new_class_id)
        
        if not subject_check:
            return {"success": False, "error": "One or both classes not found"}

        subject_data = subject_check[0]
        if subject_data['old_subject_id'] != subject_data['new_subject_id']:
            return {"success": False, "error": "Both classes must be in the same subject"}
        
        # Step 1 & 2: Check old registration and deadline
        old_class_query = """
            SELECT 
                cr.class_id,
                cr.mentee_id,
                cr.registration_log,
                c.registration_deadline,
                (c.registration_deadline < NOW()) as deadline_passed
            FROM class_registrations cr
            JOIN classes c ON cr.class_id = c.id
            WHERE cr.class_id = $1 AND cr.mentee_id = $2
        """
        old_registration = await db.execute_query(old_class_query, old_class_id, mentee_id)
        
        if not old_registration:
            return {"success": False, "error": "Original registration not found"}
        
        old_reg_data = old_registration[0]
        
        # Check if old class deadline has passed
        if old_reg_data['registration_deadline'] and old_reg_data['deadline_passed']:
            return {
                "success": False, 
                "error": "Cannot reschedule - registration deadline for current class has passed"
            }
        
        # Step 3: Check new class exists and has space
        new_class_query = """
            SELECT 
                id, 
                capacity, 
                current_enrolled,
                registration_deadline,
                (registration_deadline < NOW()) as deadline_passed,
                week_day,
                semester,
                start_time,
                end_time
            FROM classes
            WHERE id = $1
        """
        new_class_info = await db.execute_query(new_class_query, new_class_id)
        
        if not new_class_info:
            return {"success": False, "error": "New class not found"}
        
        new_class_data = new_class_info[0]
        
        # Step 4: Check new class deadline
        if new_class_data['registration_deadline'] and new_class_data['deadline_passed']:
            return {"success": False, "error": "Registration deadline for new class has passed"}
        
        # Check if new class is full
        if new_class_data['current_enrolled'] >= new_class_data['capacity']:
            return {"success": False, "error": "New class is full"}
        
        # Check if already registered in new class
        check_new_query = """
            SELECT class_id FROM class_registrations
            WHERE class_id = $1 AND mentee_id = $2
        """
        existing_new = await db.execute_query(check_new_query, new_class_id, mentee_id)
        
        if existing_new:
            return {"success": False, "error": "Already registered for the new class"}
        
        # Step 5: Check time conflict (excluding old class)
        conflict_query = """
            SELECT DISTINCT
                c1.id as conflicting_class_id,
                s1.subject_name as conflicting_subject,
                s1.subject_code as conflicting_subject_code,
                c1.week_day,
                c1.start_time as conflicting_start_time,
                c1.end_time as conflicting_end_time
            FROM class_registrations cr
            JOIN classes c1 ON cr.class_id = c1.id
            JOIN subjects s1 ON c1.subject_id = s1.id
            WHERE cr.mentee_id = $1
            AND c1.id != $2  -- Exclude old class
            AND c1.week_day = $3
            AND (
                c1.start_time <= $5 AND c1.end_time >= $4
            )
        """
        conflicts = await db.execute_query(
            conflict_query,
            mentee_id,
            old_class_id,
            new_class_data['week_day'],
            new_class_data['start_time'],
            new_class_data['end_time']
        )

        if conflicts:
            return {
                "success": False,
                "error": "Time conflict with other registered classes",
                "conflicts": conflicts
            }
        
        # Step 6: Atomic update - reschedule
        # Update registration to new class
        update_query = """
            UPDATE class_registrations
            SET class_id = $1, registration_log = NOW()
            WHERE class_id = $2 AND mentee_id = $3
            RETURNING class_id, mentee_id, registration_log
        """
        result = await db.execute_query(update_query, new_class_id, old_class_id, mentee_id)
        
        # Update enrollment counts
        # Decrease old class
        decrease_query = """
            UPDATE classes
            SET current_enrolled = current_enrolled - 1
            WHERE id = $1 AND current_enrolled > 0
        """
        await db.execute_query(decrease_query, old_class_id)
        
        # Increase new class
        increase_query = """
            UPDATE classes
            SET current_enrolled = current_enrolled + 1
            WHERE id = $1
        """

        await db.execute_query(increase_query, new_class_id)
        
        return {
            "success": True,
            "message": "Successfully rescheduled",
            "data": {
                "old_class_id": old_class_id,
                "new_class_id": new_class_id,
                "mentee_id": mentee_id,
                "rescheduled_at": result[0]['registration_log']
            }
        }
    
    @staticmethod
    async def get_registrations_by_mentee(mentee_id: str) -> List[Dict[str, Any]]:
        """
        Get all class registrations for a mentee
        """
        query = """
            SELECT 
                c.id,
                cr.class_id,
                cr.mentee_id,
                cr.registration_log,
                c.subject_id,
                c.tutor_id,
                c.location,
                c.capacity,
                c.current_enrolled,
                c.num_of_weeks,
                c.class_status,
                c.start_time,
                c.end_time,
                c.week_day,
                c.semester,
                c.registration_deadline,
                s.subject_name,
                s.subject_code
            FROM class_registrations cr
            JOIN classes c ON cr.class_id = c.id
            JOIN subjects s ON c.subject_id = s.id
            WHERE cr.mentee_id = $1
        """
        registrations = await db.execute_query(query, mentee_id)
        return registrations

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
                c1.semester,
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
            AND c1.semester = c2.semester
            AND (
                -- Check if time periods overlap
                -- Overlap exists if: start1 <= end2 AND end1 >= start2
                c1.start_time <= c2.end_time AND c1.end_time >= c2.start_time
            )
        """
        conflicts = await db.execute_query(query, mentee_id, class_id)
        
        return {
            "has_conflict": len(conflicts) > 0,
            "conflicts": conflicts
        }