from typing import List, Dict, Any, Optional
from db.database import db
from datetime import datetime, timedelta, timezone
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
    
    @staticmethod
    async def get_classes_by_tutor(tutor_id: str) -> List[Dict[str, Any]]:
        """Get all classes by tutor ID"""
        query = """
            SELECT 
                c.id,
                c.subject_id,
                c.tutor_id,
                c.week_day,
                c.class_status,
                c.location,
                c.capacity,
                c.start_time,
                c.end_time,
                c.current_enrolled,
                c.num_of_weeks,
                c.registration_deadline,
                c.semester,
                c.created_at,
                c.updated_at,
                s.subject_name,
                s.subject_code,
                u.full_name as tutor_name,
                u.email as tutor_email
            FROM classes c
            JOIN subjects s ON c.subject_id = s.id
            LEFT JOIN "user" u ON c.tutor_id = u.id
            WHERE c.tutor_id = $1
            ORDER BY c.created_at DESC
        """
        return await db.execute_query(query, tutor_id)

    @staticmethod
    async def update_class_status(class_id: int) -> Optional[Dict[str, Any]]:
        """
        Update class status based on registration deadline and enrollment.
        - If deadline has passed and current_enrolled >= capacity/2: status = 'confirmed'
        - If deadline has passed and current_enrolled < capacity/2: status = 'cancelled'
        """
        # First, get the class details
        get_class_query = """
            SELECT 
                id, 
                registration_deadline, 
                current_enrolled, 
                capacity, 
                class_status
            FROM classes
            WHERE id = $1
        """
        result = await db.execute_query(get_class_query, class_id)
        
        if not result:
            return None
        
        class_data = result[0]
        registration_deadline = class_data['registration_deadline']
        current_enrolled = class_data['current_enrolled']
        capacity = class_data['capacity']
        current_status = class_data['class_status']
        current_time = datetime.now(timezone.utc)
        
        # Make registration_deadline timezone-aware if it's naive
        if registration_deadline.tzinfo is None:
            registration_deadline = registration_deadline.replace(tzinfo=timezone.utc)
        
        # Check if deadline has passed
        if registration_deadline > current_time:
            return {
                "id": class_id,
                "status": current_status,
                "updated": False,
                "message": "Registration deadline has not passed yet"
            }
        
        # Determine new status based on enrollment
        min_required = capacity / 2
        if current_enrolled >= min_required:
            new_status = 'confirmed'
        else:
            new_status = 'cancelled'
        
        # Update the class status
        update_query = """
            UPDATE classes
            SET class_status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING id, class_status
        """
        update_result = await db.execute_query(update_query, new_status, class_id)
        
        return {
            "id": class_id,
            "status": new_status,
            "updated": True,
            "current_enrolled": current_enrolled,
            "capacity": capacity,
            "min_required": min_required
        }

    @staticmethod
    async def update_all_classes_status() -> Dict[str, Any]:
        """
        Update status for all classes with 'scheduled' status based on registration deadline and enrollment.
        - If deadline has passed and current_enrolled >= capacity/2: status = 'confirmed'
        - If deadline has passed and current_enrolled < capacity/2: status = 'cancelled'
        """
        current_time = datetime.now(timezone.utc)
        
        # Get all scheduled classes where deadline has passed
        get_classes_query = """
            SELECT 
                id, 
                registration_deadline, 
                current_enrolled, 
                capacity, 
                class_status
            FROM classes
            WHERE class_status = 'scheduled'
        """
        
        classes = await db.execute_query(get_classes_query)
        
        if not classes:
            return {
                "classes_processed": 0,
                "confirmed_count": 0,
                "cancelled_count": 0,
                "skipped_count": 0,
                "message": "No scheduled classes found"
            }
        
        confirmed_count = 0
        cancelled_count = 0
        skipped_count = 0
        updated_classes = []
        
        for class_data in classes:
            class_id = class_data['id']
            registration_deadline = class_data['registration_deadline']
            current_enrolled = class_data['current_enrolled']
            capacity = class_data['capacity']
            
            # Make registration_deadline timezone-aware if it's naive
            if registration_deadline.tzinfo is None:
                registration_deadline = registration_deadline.replace(tzinfo=timezone.utc)
            
            # Skip if deadline hasn't passed
            if registration_deadline > current_time:
                skipped_count += 1
                continue
            
            # Determine new status based on enrollment
            min_required = capacity / 2
            if current_enrolled >= min_required:
                new_status = 'confirmed'
                confirmed_count += 1
            else:
                new_status = 'cancelled'
                cancelled_count += 1
            
            # Update the class status
            update_query = """
                UPDATE classes
                SET class_status = $1, updated_at = NOW()
                WHERE id = $2
                RETURNING id, class_status
            """
            await db.execute_query(update_query, new_status, class_id)
            
            updated_classes.append({
                "id": class_id,
                "status": new_status,
                "current_enrolled": current_enrolled,
                "capacity": capacity
            })
        
        return {
            "classes_processed": len(updated_classes),
            "confirmed_count": confirmed_count,
            "cancelled_count": cancelled_count,
            "skipped_count": skipped_count,
            "updated_classes": updated_classes,
            "message": f"Processed {len(updated_classes)} classes. Confirmed: {confirmed_count}, Cancelled: {cancelled_count}, Skipped (deadline not passed): {skipped_count}"
        }
    @staticmethod
    def _get_first_weekday_after_date(start_date: datetime, target_weekday: str) -> datetime:
        """
        Get the first occurrence of a specific weekday after a given date.
        
        Args:
            start_date: The date to start searching from
            target_weekday: The target weekday (e.g., 'monday', 'tuesday', etc.)
        
        Returns:
            The first date that falls on the target weekday after start_date
        """
        weekday_map = {
            'monday': 0,
            'tuesday': 1,
            'wednesday': 2,
            'thursday': 3,
            'friday': 4,
            'saturday': 5,
            'sunday': 6
        }
        
        target_day = weekday_map.get(target_weekday.lower(), 0)
        current_day = start_date.weekday()
        
        # Calculate days until target weekday
        days_ahead = target_day - current_day
        if days_ahead <= 0:  # Target day already happened this week or is today
            days_ahead += 7
        
        return start_date + timedelta(days=days_ahead)

    @staticmethod
    async def create_sessions_for_confirmed_classes() -> Dict[str, Any]:
        """
        Create sessions for all confirmed classes that don't have sessions yet.
        For each confirmed class, create num_of_weeks sessions starting from
        the first occurrence of week_day after registration_deadline.
        """
        # Get all confirmed classes that don't have sessions yet
        get_confirmed_classes_query = """
            SELECT 
                c.id,
                c.num_of_weeks,
                c.week_day,
                c.location,
                c.start_time,
                c.end_time,
                c.registration_deadline
            FROM classes c
            WHERE c.class_status = 'confirmed'
            AND NOT EXISTS (
                SELECT 1 FROM sessions s WHERE s.class_id = c.id
            )
        """
        
        confirmed_classes = await db.execute_query(get_confirmed_classes_query)
        
        if not confirmed_classes:
            return {
                "classes_processed": 0,
                "sessions_created": 0,
                "message": "No confirmed classes without sessions found"
            }
        
        total_sessions_created = 0
        classes_processed = 0
        created_sessions_details = []
        
        for class_data in confirmed_classes:
            class_id = class_data['id']
            num_of_weeks = class_data['num_of_weeks']
            week_day = class_data['week_day']
            location = class_data['location']
            start_time = class_data['start_time']
            end_time = class_data['end_time']
            registration_deadline = class_data['registration_deadline']
            
            # Handle timezone for registration_deadline
            if registration_deadline.tzinfo is not None:
                registration_deadline = registration_deadline.replace(tzinfo=None)
            
            # Get the first session date (first week_day after registration_deadline)
            first_session_date = ClassModel._get_first_weekday_after_date(
                registration_deadline, 
                week_day
            )
            
            sessions_for_class = []
            
            # Create sessions for each week
            for week_num in range(num_of_weeks):
                session_date = first_session_date + timedelta(weeks=week_num)
                session_id = week_num + 1  # session_id starts from 1
                
                insert_session_query = """
                    INSERT INTO sessions (
                        class_id,
                        session_id,
                        session_date,
                        session_status,
                        location,
                        start_time,
                        end_time,
                        week_day,
                        created_at,
                        updated_at
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
                    RETURNING class_id, session_id, session_date
                """
                
                result = await db.execute_query(
                    insert_session_query,
                    class_id,
                    session_id,
                    session_date.date(),  # Convert to date only
                    'scheduled',  # Default session status
                    location,
                    start_time,
                    end_time,
                    week_day
                )
                
                if result:
                    sessions_for_class.append({
                        "session_id": session_id,
                        "session_date": str(session_date.date())
                    })
                    total_sessions_created += 1
            
            classes_processed += 1
            created_sessions_details.append({
                "class_id": class_id,
                "sessions_created": len(sessions_for_class),
                "sessions": sessions_for_class
            })
        
        return {
            "classes_processed": classes_processed,
            "sessions_created": total_sessions_created,
            "details": created_sessions_details,
            "message": f"Successfully created {total_sessions_created} sessions for {classes_processed} classes"
        }

    @staticmethod
    async def create_sessions_for_class(class_id: int) -> Dict[str, Any]:
        """
        Create sessions for a specific confirmed class.
        Creates num_of_weeks sessions starting from the first occurrence 
        of week_day after registration_deadline.
        """
        # Get class details
        get_class_query = """
            SELECT 
                c.id,
                c.num_of_weeks,
                c.week_day,
                c.location,
                c.start_time,
                c.end_time,
                c.registration_deadline,
                c.class_status
            FROM classes c
            WHERE c.id = $1
        """
        
        result = await db.execute_query(get_class_query, class_id)
        
        if not result:
            return None
        
        class_data = result[0]
        
        # Check if class is confirmed
        if class_data['class_status'] != 'confirmed':
            return {
                "class_id": class_id,
                "sessions_created": 0,
                "error": f"Class status is '{class_data['class_status']}', not 'confirmed'"
            }
        
        # Check if sessions already exist
        check_sessions_query = """
            SELECT COUNT(*) as count FROM sessions WHERE class_id = $1
        """
        existing_sessions = await db.execute_query(check_sessions_query, class_id)
        
        if existing_sessions and existing_sessions[0]['count'] > 0:
            return {
                "class_id": class_id,
                "sessions_created": 0,
                "error": "Sessions already exist for this class"
            }
        
        num_of_weeks = class_data['num_of_weeks']
        week_day = class_data['week_day']
        location = class_data['location']
        start_time = class_data['start_time']
        end_time = class_data['end_time']
        registration_deadline = class_data['registration_deadline']
        
        # Handle timezone for registration_deadline
        if registration_deadline.tzinfo is not None:
            registration_deadline = registration_deadline.replace(tzinfo=None)
        
        # Get the first session date
        first_session_date = ClassModel._get_first_weekday_after_date(
            registration_deadline, 
            week_day
        )
        
        sessions_created = []
        
        # Create sessions for each week
        for week_num in range(num_of_weeks):
            session_date = first_session_date + timedelta(weeks=week_num)
            session_id = week_num + 1
            
            insert_session_query = """
                INSERT INTO sessions (
                    class_id,
                    session_id,
                    session_date,
                    session_status,
                    location,
                    start_time,
                    end_time,
                    week_day,
                    created_at,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
                RETURNING class_id, session_id, session_date
            """
            
            insert_result = await db.execute_query(
                insert_session_query,
                class_id,
                session_id,
                session_date.date(),
                'scheduled',
                location,
                start_time,
                end_time,
                week_day
            )
            
            if insert_result:
                sessions_created.append({
                    "session_id": session_id,
                    "session_date": str(session_date.date())
                })
        
        return {
            "class_id": class_id,
            "sessions_created": len(sessions_created),
            "sessions": sessions_created
        }