"""
Admin Model - Handles admin dashboard queries
Provides statistics, activity feeds, conflict detection, and user management
"""

from db.database import db
from typing import List, Dict, Any, Optional
from datetime import datetime


class AdminModel:
    """Model for admin dashboard operations"""

    @staticmethod
    async def get_dashboard_stats() -> Dict[str, Any]:
        """
        Get overview statistics for the admin dashboard
        Returns: Dictionary with total counts and session statistics
        """
        try:
            # Total Mentees (active users with mentee role)
            mentee_result = await db.execute_single(
                """
                SELECT COUNT(DISTINCT m.user_id) as count 
                FROM MENTEE m
                JOIN public.user u ON m.user_id = u.id
                """
            )
            total_mentees = mentee_result['count'] if mentee_result else 0

            # Total Tutors (active users with tutor role)
            tutor_result = await db.execute_single(
                """
                SELECT COUNT(DISTINCT t.user_id) as count 
                FROM TUTOR t
                JOIN public.user u ON t.user_id = u.id
                """
            )
            total_tutors = tutor_result['count'] if tutor_result else 0

            # Total Classes (active)
            classes_result = await db.execute_single(
                """
                SELECT COUNT(*) as count 
                FROM classes 
                WHERE class_status != 'cancelled'
                """
            )
            total_classes = classes_result['count'] if classes_result else 0

            # Total Sessions
            sessions_result = await db.execute_single(
                "SELECT COUNT(*) as count FROM sessions"
            )
            total_sessions = sessions_result['count'] if sessions_result else 0

            # Total Subjects (distinct)
            subjects_result = await db.execute_single(
                "SELECT COUNT(*) as count FROM subjects"
            )
            total_subjects = subjects_result['count'] if subjects_result else 0

            # Upcoming Sessions
            upcoming_result = await db.execute_single(
                """
                SELECT COUNT(*) as count FROM sessions 
                WHERE session_date_time >= NOW() 
                AND session_status = 'scheduled'
                """
            )
            upcoming_sessions = upcoming_result['count'] if upcoming_result else 0

            # Completed Sessions
            completed_result = await db.execute_single(
                """
                SELECT COUNT(*) as count FROM sessions 
                WHERE session_status = 'completed'
                """
            )
            completed_sessions = completed_result['count'] if completed_result else 0

            return {
                "totalMentees": total_mentees,
                "totalTutors": total_tutors,
                "totalClasses": total_classes,
                "totalSessions": total_sessions,
                "totalSubjects": total_subjects,
                "upcomingSessions": upcoming_sessions,
                "completedSessions": completed_sessions
            }

        except Exception as e:
            print(f"Error getting dashboard stats: {e}")
            raise

    @staticmethod
    async def get_recent_activities(limit: int = 10, offset: int = 0) -> Dict[str, Any]:
        """
        Get recent system activities (registrations, class creations, session completions)
        Args:
            limit: Number of activities to return
            offset: Offset for pagination
        Returns: Dictionary with activities list and total count
        """
        try:
            activities = []

            # Recent Registrations
            registrations = await db.execute_query(
                """
                SELECT 
                    cr.mentee_id::text || '_' || cr.class_id::text as id,
                    'registration' as type,
                    CONCAT('New mentee registered for ', s.subject_name, ' (Class ', c.id, ')') as description,
                    cr.registration_log as timestamp,
                    u.full_name as user,
                    u.id::text as userId
                FROM class_registrations cr
                JOIN classes c ON cr.class_id = c.id
                JOIN subjects s ON c.subject_id = s.id
                JOIN public.user u ON cr.mentee_id = u.id
                WHERE cr.registration_log IS NOT NULL
                ORDER BY cr.registration_log DESC
                LIMIT 20
                """
            )
            activities.extend(registrations)

            # Recent Class Creations
            class_creations = await db.execute_query(
                """
                SELECT 
                    c.id::text as id,
                    'class_created' as type,
                    CONCAT('New class created: ', s.subject_name, ' (', s.subject_code, ')') as description,
                    c.created_at as timestamp,
                    u.full_name as user,
                    u.id::text as userId
                FROM classes c
                JOIN subjects s ON c.subject_id = s.id
                JOIN public.user u ON c.tutor_id = u.id
                ORDER BY c.created_at DESC
                LIMIT 20
                """
            )
            activities.extend(class_creations)

            # Recent Session Updates (sessions that were marked as completed)
            session_completions = await db.execute_query(
                """
                SELECT 
                    sess.class_id::text || '_' || sess.session_id::text as id,
                    'session_completed' as type,
                    CONCAT('Session completed: ', s.subject_name, ' - Session ', sess.session_id) as description,
                    sess.updated_at as timestamp,
                    u.full_name as user,
                    u.id::text as userId
                FROM sessions sess
                JOIN classes c ON sess.class_id = c.id
                JOIN subjects s ON c.subject_id = s.id
                JOIN public.user u ON c.tutor_id = u.id
                WHERE sess.session_status = 'completed'
                ORDER BY sess.updated_at DESC
                LIMIT 20
                """
            )
            activities.extend(session_completions)

            # Sort all activities by timestamp descending
            activities.sort(key=lambda x: x['timestamp'], reverse=True)

            # Apply pagination
            total = len(activities)
            paginated_activities = activities[offset:offset + limit]

            # Convert timestamps to ISO format
            for activity in paginated_activities:
                if activity['timestamp']:
                    activity['timestamp'] = activity['timestamp'].isoformat()

            return {
                "activities": paginated_activities,
                "total": total
            }

        except Exception as e:
            print(f"Error getting recent activities: {e}")
            raise

    @staticmethod
    async def get_schedule_conflicts() -> Dict[str, Any]:
        """
        Detect and return scheduling conflicts between classes
        Returns: Dictionary with conflicts list and total count
        """
        try:
            # Detect conflicts based on week_day and overlapping time periods
            conflicts_query = """
                SELECT 
                    c1.id::text as id,
                    s1.subject_name as subject,
                    c1.id::text as classCode,
                    u1.full_name as tutor,
                    c1.week_day::text as day,
                    CONCAT('Period ', c1.start_time, '-', c1.end_time) as periods,
                    CONCAT(c1.week_day::text, ' ', c1.start_time, '-', c1.end_time) as schedule,
                    CONCAT('Class ', c2.id, ' (', s2.subject_name, ') - ', c2.week_day::text, ' ', c2.start_time, '-', c2.end_time) as conflictsWith,
                    c2.id::text as conflictClassId
                FROM classes c1
                JOIN subjects s1 ON c1.subject_id = s1.id
                JOIN public.user u1 ON c1.tutor_id = u1.id
                JOIN classes c2 ON 
                    c1.id < c2.id
                    AND c1.week_day = c2.week_day
                    AND c1.tutor_id = c2.tutor_id
                    AND (
                        (c1.start_time <= c2.start_time AND c1.end_time > c2.start_time) OR
                        (c2.start_time <= c1.start_time AND c2.end_time > c1.start_time)
                    )
                JOIN subjects s2 ON c2.subject_id = s2.id
                WHERE c1.class_status != 'cancelled'
                  AND c2.class_status != 'cancelled'
                  AND c1.week_day IS NOT NULL
                  AND c2.week_day IS NOT NULL
                ORDER BY c1.week_day, c1.start_time
            """

            conflicts = await db.execute_query(conflicts_query)

            return {
                "conflicts": conflicts,
                "total": len(conflicts)
            }

        except Exception as e:
            print(f"Error getting schedule conflicts: {e}")
            raise

    @staticmethod
    async def get_all_users_with_filters(
        search: Optional[str] = None,
        role: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get all users with optional filters
        Args:
            search: Search by name or email
            role: Filter by role (mentee/tutor/admin)
            status: Filter by status (not used in current schema)
            limit: Number of users to return
            offset: Offset for pagination
        Returns: Dictionary with users list and total count
        """
        try:
            # Build the base query
            base_query = """
                SELECT 
                    u.id::text as id,
                    u.full_name as name,
                    u.email,
                    ur.role::text as role,
                    u.created_at as "joinDate",
                    u.phone,
                    u.bio,
                    u.faculty,
                    m.major as mentee_major,
                    m.learning_needs,
                    t.major as tutor_major,
                    t.expertise_areas
                FROM public.user u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN MENTEE m ON u.id = m.user_id
                LEFT JOIN TUTOR t ON u.id = t.user_id
                WHERE 1=1
            """
            
            # Build filters dynamically
            params = []
            param_count = 1
            
            if search:
                base_query += f" AND (u.full_name ILIKE ${param_count} OR u.email ILIKE ${param_count})"
                params.append(f"%{search}%")
                param_count += 1
            
            if role:
                base_query += f" AND ur.role::text = ${param_count}"
                params.append(role)
                param_count += 1
            
            # Get total count
            count_query = f"SELECT COUNT(*) as count FROM ({base_query}) as filtered_users"
            count_result = await db.execute_single(count_query, *params)
            total = count_result['count'] if count_result else 0
            
            # Add ordering and pagination
            base_query += f" ORDER BY u.created_at DESC LIMIT ${param_count} OFFSET ${param_count + 1}"
            params.extend([limit, offset])
            
            users = await db.execute_query(base_query, *params)
            
            # Enrich user data with courses and session statistics
            for user in users:
                if user['role'] == 'mentee' and user['id']:
                    # Get enrolled courses
                    courses = await db.execute_query(
                        """
                        SELECT s.subject_name
                        FROM class_registrations cr
                        JOIN classes c ON cr.class_id = c.id
                        JOIN subjects s ON c.subject_id = s.id
                        WHERE cr.mentee_id = $1
                          AND cr.cancellation_log IS NULL
                        """,
                        user['id']
                    )
                    user['coursesEnrolled'] = [c['subject_name'] for c in courses]
                    
                    # Get session statistics (count attended sessions)
                    stats = await db.execute_single(
                        """
                        SELECT 
                            COUNT(*) as "totalSessions",
                            SUM(CASE WHEN a.attendance_mark = true THEN 1 ELSE 0 END) as "completedSessions"
                        FROM attendance a
                        WHERE a.mentee_id = $1
                        """,
                        user['id']
                    )
                    if stats:
                        user['totalSessions'] = stats['totalSessions'] or 0
                        user['completedSessions'] = stats['completedSessions'] or 0
                    else:
                        user['totalSessions'] = 0
                        user['completedSessions'] = 0
                else:
                    user['coursesEnrolled'] = []
                    user['totalSessions'] = 0
                    user['completedSessions'] = 0
                
                # Convert dates to ISO format
                if user.get('joinDate'):
                    user['joinDate'] = user['joinDate'].isoformat()
                
                # Set status as 'active' (since schema doesn't have status column)
                user['status'] = 'active'
                user['lastActive'] = user.get('joinDate')  # Use creation date as placeholder
            
            return {
                "users": users,
                "total": total
            }
            
        except Exception as e:
            print(f"Error getting users with filters: {e}")
            raise

    @staticmethod
    async def get_user_details(user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific user
        Args:
            user_id: User ID to retrieve
        Returns: User details dictionary or None if not found
        """
        try:
            user = await db.execute_single(
                """
                SELECT 
                    u.id::text as id,
                    u.full_name as name,
                    u.email,
                    ur.role::text as role,
                    u.created_at as "joinDate",
                    u.phone,
                    u.bio,
                    u.faculty,
                    m.major as mentee_major,
                    m.learning_needs,
                    t.major as tutor_major,
                    t.expertise_areas
                FROM public.user u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN MENTEE m ON u.id = m.user_id
                LEFT JOIN TUTOR t ON u.id = t.user_id
                WHERE u.id = $1
                """,
                user_id
            )
            
            if not user:
                return None
            
            # Enrich user data if mentee
            if user['role'] == 'mentee':
                # Get enrolled courses
                courses = await db.execute_query(
                    """
                    SELECT s.subject_name
                    FROM class_registrations cr
                    JOIN classes c ON cr.class_id = c.id
                    JOIN subjects s ON c.subject_id = s.id
                    WHERE cr.mentee_id = $1
                      AND cr.cancellation_log IS NULL
                    """,
                    user_id
                )
                user['coursesEnrolled'] = [c['subject_name'] for c in courses]
                
                # Get session statistics
                stats = await db.execute_single(
                    """
                    SELECT 
                        COUNT(*) as "totalSessions",
                        SUM(CASE WHEN a.attendance_mark = true THEN 1 ELSE 0 END) as "completedSessions"
                    FROM attendance a
                    WHERE a.mentee_id = $1
                    """,
                    user_id
                )
                if stats:
                    user['totalSessions'] = stats['totalSessions'] or 0
                    user['completedSessions'] = stats['completedSessions'] or 0
            else:
                user['coursesEnrolled'] = []
                user['totalSessions'] = 0
                user['completedSessions'] = 0
            
            # Convert dates to ISO format
            if user.get('joinDate'):
                user['joinDate'] = user['joinDate'].isoformat()
            
            # Set status as 'active' (schema doesn't have status column)
            user['status'] = 'active'
            user['lastActive'] = user.get('joinDate')  # Use creation date as placeholder
            
            return user
            
        except Exception as e:
            print(f"Error getting user details: {e}")
            raise

    @staticmethod
    async def deactivate_user(user_id: str, reason: Optional[str] = None) -> bool:
        """
        Deactivate a user account by deleting their user_roles
        Note: The schema doesn't have a status column, so we remove their roles instead
        Args:
            user_id: User ID to deactivate
            reason: Optional reason for deactivation (logged but not stored in schema)
        Returns: True if successful
        """
        try:
            # Log the deactivation reason (you could store this in a separate audit table if needed)
            if reason:
                print(f"Deactivating user {user_id} with reason: {reason}")
            
            # Remove user roles to effectively deactivate the user
            result = await db.execute_command(
                """
                DELETE FROM user_roles
                WHERE user_id = $1
                """,
                user_id
            )
            return True
            
        except Exception as e:
            print(f"Error deactivating user: {e}")
            raise
