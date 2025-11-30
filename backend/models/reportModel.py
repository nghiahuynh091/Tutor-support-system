"""
Report Model - Handles reporting and analytics queries
Provides course analytics, resource usage, and participation reports
"""

from db.database import db
from typing import List, Dict, Any, Optional
from datetime import datetime


class ReportModel:
    """Model for reporting and analytics operations"""

    @staticmethod
    async def get_course_analytics() -> Dict[str, Any]:
        """
        Get comprehensive course analytics report
        Returns: Dictionary with summary and detailed course statistics
        """
        try:
            # Get course statistics
            courses = await db.execute_query(
                """
                SELECT 
                    c.id::text as id,
                    CONCAT(s.subject_name, ' (', s.subject_code, ')') as name,
                    COUNT(DISTINCT cr.mentee_id) as enrollments,
                    COUNT(DISTINCT CASE 
                        WHEN cr.cancellation_log IS NULL THEN cr.mentee_id 
                    END) as active_enrollments,
                    COALESCE(AVG(f.rating_scale), 0) as rating,
                    ROUND(
                        (COUNT(CASE WHEN a.attendance_mark = true THEN 1 END)::DECIMAL / 
                         NULLIF(COUNT(a.mentee_id), 0)) * 100, 
                        2
                    ) as "attendanceRate"
                FROM classes c
                JOIN subjects s ON c.subject_id = s.id
                LEFT JOIN class_registrations cr ON c.id = cr.class_id
                LEFT JOIN feedback f ON c.id = f.class_id
                LEFT JOIN sessions sess ON c.id = sess.class_id
                LEFT JOIN attendance a ON sess.class_id = a.class_id AND sess.session_id = a.session_id
                WHERE c.class_status != 'cancelled'
                GROUP BY c.id, s.subject_name, s.subject_code
                ORDER BY enrollments DESC
                """
            )

            # Calculate summary statistics
            total_courses = len(courses)
            total_enrollments = sum(course['enrollments'] or 0 for course in courses)
            
            # Calculate average rating (excluding 0 ratings)
            ratings = [course['rating'] for course in courses if course['rating'] > 0]
            average_rating = round(sum(ratings) / len(ratings), 1) if ratings else 0
            
            # Calculate completion rate (active enrollments / total enrollments)
            total_active = sum(course['active_enrollments'] or 0 for course in courses)
            completion_rate = round((total_active / total_enrollments * 100), 0) if total_enrollments > 0 else 0

            # Format course data
            for course in courses:
                # Handle None values
                course['enrollments'] = course['enrollments'] or 0
                course['completions'] = course['active_enrollments'] or 0
                course['rating'] = round(float(course['rating'] or 0), 1)
                course['attendanceRate'] = round(float(course['attendanceRate'] or 0), 0)
                # Remove the intermediate field
                del course['active_enrollments']

            return {
                "summary": {
                    "totalCourses": total_courses,
                    "totalEnrollments": total_enrollments,
                    "averageRating": average_rating,
                    "completionRate": int(completion_rate)
                },
                "courses": courses
            }

        except Exception as e:
            print(f"Error getting course analytics: {e}")
            raise

    @staticmethod
    async def get_resource_usage() -> Dict[str, Any]:
        """
        Get resource usage statistics report
        Returns: Dictionary with summary and detailed resource usage
        """
        try:
            # Note: The schema doesn't have download_count or view_count columns
            # We'll count how many classes are using each resource
            resources = await db.execute_query(
                """
                SELECT 
                    lr.id::text as id,
                    lr.title as name,
                    lr.file_type as type,
                    COUNT(DISTINCT cr_link.class_id) as downloads,
                    COUNT(DISTINCT cr_link.class_id) as views,
                    lr.created_at as "uploadDate"
                FROM learning_resources lr
                LEFT JOIN class_resources cr_link ON lr.id = cr_link.resource_id
                GROUP BY lr.id, lr.title, lr.file_type, lr.created_at
                ORDER BY downloads DESC
                LIMIT 50
                """
            )

            # Calculate summary statistics
            total_resources = len(resources)
            total_downloads = sum(resource['downloads'] for resource in resources)
            
            # Find most used resource
            most_used_resource = resources[0]['name'] if resources else "N/A"

            # Format resource data
            for resource in resources:
                if resource.get('uploadDate'):
                    resource['uploadDate'] = resource['uploadDate'].date().isoformat()

            return {
                "summary": {
                    "totalResources": total_resources,
                    "mostUsedResource": most_used_resource,
                    "totalDownloads": total_downloads
                },
                "resources": resources
            }

        except Exception as e:
            print(f"Error getting resource usage: {e}")
            raise

    @staticmethod
    async def get_participation_report() -> Dict[str, Any]:
        """
        Get participation and engagement statistics
        Returns: Dictionary with summary and detailed participant statistics
        """
        try:
            # Get participation statistics
            participants = await db.execute_query(
                """
                SELECT 
                    u.id::text as id,
                    u.full_name as name,
                    ur.role::text as role,
                    COUNT(CASE WHEN a.attendance_mark = true THEN 1 END) as "sessionsAttended",
                    COALESCE(
                        SUM(
                            CASE WHEN a.attendance_mark = true 
                            THEN 1.5 
                            ELSE 0 END
                        ),
                        0
                    ) as "totalHours",
                    ROUND(
                        (COUNT(CASE WHEN a.attendance_mark = true THEN 1 END)::DECIMAL / 
                         NULLIF(COUNT(a.mentee_id), 0)) * 100,
                        0
                    ) as "attendanceRate",
                    MAX(u.created_at) as "lastActive"
                FROM public.user u
                JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN attendance a ON u.id = a.mentee_id
                LEFT JOIN sessions sess ON a.class_id = sess.class_id AND a.session_id = sess.session_id
                WHERE ur.role IN ('mentee', 'tutor')
                GROUP BY u.id, u.full_name, ur.role
                HAVING COUNT(a.mentee_id) > 0
                ORDER BY "sessionsAttended" DESC
                LIMIT 100
                """
            )

            # Calculate summary statistics
            total_participants = len(participants)
            
            # Count active users (attended session in last 30 days) - using created_at as proxy
            active_users = sum(
                1 for p in participants 
                if p.get('lastActive') and 
                (datetime.now(p['lastActive'].tzinfo) - p['lastActive']).days <= 30
            )
            
            # Calculate average session time (assuming 1.5 hours per session)
            total_hours = sum(float(p['totalHours'] or 0) for p in participants)
            total_sessions = sum(p['sessionsAttended'] for p in participants)
            average_session_time = round((total_hours / total_sessions * 60), 0) if total_sessions > 0 else 0
            
            # Calculate average attendance rate
            attendance_rates = [float(p['attendanceRate'] or 0) for p in participants if p.get('attendanceRate')]
            average_attendance_rate = round(sum(attendance_rates) / len(attendance_rates), 0) if attendance_rates else 0

            # Format participant data
            for participant in participants:
                participant['sessionsAttended'] = participant['sessionsAttended'] or 0
                participant['totalHours'] = round(float(participant['totalHours'] or 0), 1)
                participant['attendanceRate'] = round(float(participant['attendanceRate'] or 0), 0)
                if participant.get('lastActive'):
                    participant['lastActive'] = participant['lastActive'].date().isoformat()

            return {
                "summary": {
                    "totalParticipants": total_participants,
                    "activeUsers": active_users,
                    "averageSessionTime": int(average_session_time),
                    "averageAttendanceRate": int(average_attendance_rate)
                },
                "participants": participants
            }

        except Exception as e:
            print(f"Error getting participation report: {e}")
            raise

    @staticmethod
    async def get_student_performance_by_subject(subject_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Get student performance analytics by subject (for Academic Departments)
        This helps departments monitor student performance in specific courses
        
        Args:
            subject_id: Optional subject ID to filter by specific subject
            
        Returns: Dictionary with subject-level performance metrics
        """
        try:
            subject_filter = "AND s.id = $1" if subject_id else ""
            params = [subject_id] if subject_id else []
            
            # Get performance data by subject
            subject_performance = await db.execute_query(
                f"""
                SELECT 
                    s.id as subject_id,
                    s.subject_code,
                    s.subject_name,
                    COUNT(DISTINCT c.id) as total_classes,
                    COUNT(DISTINCT cr.mentee_id) as total_students,
                    COUNT(DISTINCT CASE WHEN cr.cancellation_log IS NULL THEN cr.mentee_id END) as active_students,
                    COALESCE(AVG(f.rating_scale), 0) as avg_rating,
                    ROUND(
                        (COUNT(CASE WHEN a.attendance_mark = true THEN 1 END)::DECIMAL / 
                         NULLIF(COUNT(a.mentee_id), 0)) * 100, 
                        2
                    ) as avg_attendance_rate,
                    COUNT(DISTINCT c.tutor_id) as tutors_teaching,
                    ROUND(
                        COUNT(DISTINCT cr.mentee_id)::DECIMAL / 
                        NULLIF(COUNT(DISTINCT c.id), 0), 
                        1
                    ) as avg_class_size
                FROM subjects s
                LEFT JOIN classes c ON s.id = c.subject_id AND c.class_status != 'cancelled'
                LEFT JOIN class_registrations cr ON c.id = cr.class_id
                LEFT JOIN feedback f ON c.id = f.class_id
                LEFT JOIN sessions sess ON c.id = sess.class_id
                LEFT JOIN attendance a ON sess.class_id = a.class_id AND sess.session_id = a.session_id
                WHERE 1=1 {subject_filter}
                GROUP BY s.id, s.subject_code, s.subject_name
                ORDER BY total_students DESC
                """,
                *params
            )
            
            # Format the data
            for subject in subject_performance:
                subject['avg_rating'] = round(float(subject['avg_rating'] or 0), 1)
                subject['avg_attendance_rate'] = round(float(subject['avg_attendance_rate'] or 0), 1)
                subject['avg_class_size'] = round(float(subject['avg_class_size'] or 0), 1)
                
            return {
                "subjects": subject_performance,
                "total": len(subject_performance)
            }
            
        except Exception as e:
            print(f"Error getting subject performance: {e}")
            raise

    @staticmethod
    async def get_tutor_workload_analysis() -> Dict[str, Any]:
        """
        Get tutor workload and performance analysis (for Office of Academic Affairs)
        Helps optimize resource allocation and identify overworked/underutilized tutors
        
        Returns: Dictionary with tutor workload metrics
        """
        try:
            tutors = await db.execute_query(
                """
                SELECT 
                    u.id::text as tutor_id,
                    u.full_name as tutor_name,
                    t.expertise_areas,
                    COUNT(DISTINCT c.id) as total_classes,
                    SUM(c.current_enrolled) as total_students,
                    COUNT(DISTINCT sess.session_id) as total_sessions,
                    ROUND(
                        SUM(c.current_enrolled)::DECIMAL / 
                        NULLIF(COUNT(DISTINCT c.id), 0), 
                        1
                    ) as avg_class_size,
                    ROUND(
                        (SUM(c.current_enrolled)::DECIMAL / 
                         NULLIF(SUM(c.capacity), 0)) * 100, 
                        1
                    ) as utilization_rate,
                    COALESCE(AVG(f.rating_scale), 0) as avg_rating,
                    COUNT(DISTINCT CASE 
                        WHEN c.week_day IS NOT NULL THEN c.week_day::text || c.start_time::text 
                    END) as unique_time_slots
                FROM public.user u
                JOIN tutor t ON u.id = t.user_id
                LEFT JOIN classes c ON u.id = c.tutor_id AND c.class_status != 'cancelled'
                LEFT JOIN sessions sess ON c.id = sess.class_id
                LEFT JOIN feedback f ON c.id = f.class_id
                GROUP BY u.id, u.full_name, t.expertise_areas
                HAVING COUNT(DISTINCT c.id) > 0
                ORDER BY total_classes DESC
                """
            )
            
            # Calculate workload categories
            for tutor in tutors:
                tutor['avg_class_size'] = round(float(tutor['avg_class_size'] or 0), 1)
                tutor['utilization_rate'] = round(float(tutor['utilization_rate'] or 0), 1)
                tutor['avg_rating'] = round(float(tutor['avg_rating'] or 0), 1)
                
                # Categorize workload
                total_classes = tutor['total_classes']
                if total_classes >= 5:
                    tutor['workload_status'] = 'heavy'
                elif total_classes >= 3:
                    tutor['workload_status'] = 'moderate'
                else:
                    tutor['workload_status'] = 'light'
            
            # Calculate summary
            total_tutors = len(tutors)
            avg_classes_per_tutor = round(sum(t['total_classes'] for t in tutors) / total_tutors, 1) if total_tutors > 0 else 0
            avg_students_per_tutor = round(sum(t['total_students'] for t in tutors) / total_tutors, 1) if total_tutors > 0 else 0
            
            return {
                "summary": {
                    "total_tutors": total_tutors,
                    "avg_classes_per_tutor": avg_classes_per_tutor,
                    "avg_students_per_tutor": avg_students_per_tutor
                },
                "tutors": tutors
            }
            
        except Exception as e:
            print(f"Error getting tutor workload analysis: {e}")
            raise

    @staticmethod
    async def get_scholarship_eligible_students(
        min_attendance_rate: float = 80.0,
        min_hours: float = 10.0,
        min_rating_given: float = 4.0
    ) -> Dict[str, Any]:
        """
        Get students eligible for scholarships/training credits (for Office of Student Affairs)
        Filters students based on participation criteria
        
        Args:
            min_attendance_rate: Minimum attendance rate percentage (default: 80%)
            min_hours: Minimum total hours attended (default: 10 hours)
            min_rating_given: Minimum average rating given in feedback (default: 4.0)
            
        Returns: Dictionary with eligible students and their achievements
        """
        try:
            students = await db.execute_query(
                """
                SELECT 
                    u.id::text as student_id,
                    u.full_name as student_name,
                    u.email,
                    u.faculty,
                    m.major,
                    COUNT(DISTINCT cr.class_id) as classes_enrolled,
                    COUNT(CASE WHEN a.attendance_mark = true THEN 1 END) as sessions_attended,
                    COALESCE(
                        SUM(CASE WHEN a.attendance_mark = true THEN 1.5 ELSE 0 END),
                        0
                    ) as total_hours,
                    ROUND(
                        (COUNT(CASE WHEN a.attendance_mark = true THEN 1 END)::DECIMAL / 
                         NULLIF(COUNT(a.mentee_id), 0)) * 100,
                        1
                    ) as attendance_rate,
                    COALESCE(AVG(f.rating_scale), 0) as avg_feedback_rating,
                    COUNT(DISTINCT f.class_id) as feedback_submitted
                FROM public.user u
                JOIN mentee m ON u.id = m.user_id
                LEFT JOIN class_registrations cr ON u.id = cr.mentee_id 
                    AND cr.cancellation_log IS NULL
                LEFT JOIN attendance a ON u.id = a.mentee_id
                LEFT JOIN feedback f ON u.id = f.mentee_id
                GROUP BY u.id, u.full_name, u.email, u.faculty, m.major
                HAVING 
                    COUNT(CASE WHEN a.attendance_mark = true THEN 1 END) > 0
                    AND ROUND(
                        (COUNT(CASE WHEN a.attendance_mark = true THEN 1 END)::DECIMAL / 
                         NULLIF(COUNT(a.mentee_id), 0)) * 100,
                        1
                    ) >= $1
                    AND COALESCE(
                        SUM(CASE WHEN a.attendance_mark = true THEN 1.5 ELSE 0 END),
                        0
                    ) >= $2
                ORDER BY attendance_rate DESC, total_hours DESC
                """,
                min_attendance_rate,
                min_hours
            )
            
            # Filter by rating if they submitted feedback
            eligible_students = []
            for student in students:
                student['attendance_rate'] = round(float(student['attendance_rate'] or 0), 1)
                student['total_hours'] = round(float(student['total_hours'] or 0), 1)
                student['avg_feedback_rating'] = round(float(student['avg_feedback_rating'] or 0), 1)
                
                # Check rating criteria (only if they submitted feedback)
                if student['feedback_submitted'] == 0 or student['avg_feedback_rating'] >= min_rating_given:
                    # Determine achievement level
                    if student['attendance_rate'] >= 95 and student['total_hours'] >= 30:
                        student['achievement_level'] = 'excellent'
                    elif student['attendance_rate'] >= 90 and student['total_hours'] >= 20:
                        student['achievement_level'] = 'outstanding'
                    else:
                        student['achievement_level'] = 'good'
                    
                    eligible_students.append(student)
            
            return {
                "summary": {
                    "total_eligible": len(eligible_students),
                    "excellent_level": len([s for s in eligible_students if s['achievement_level'] == 'excellent']),
                    "outstanding_level": len([s for s in eligible_students if s['achievement_level'] == 'outstanding']),
                    "good_level": len([s for s in eligible_students if s['achievement_level'] == 'good']),
                    "criteria": {
                        "min_attendance_rate": min_attendance_rate,
                        "min_hours": min_hours,
                        "min_rating_given": min_rating_given
                    }
                },
                "students": eligible_students
            }
            
        except Exception as e:
            print(f"Error getting scholarship eligible students: {e}")
            raise

    @staticmethod
    async def get_class_utilization_report() -> Dict[str, Any]:
        """
        Get class utilization and capacity analysis (for Office of Academic Affairs)
        Helps optimize resource allocation and room scheduling
        
        Returns: Dictionary with class utilization metrics
        """
        try:
            classes = await db.execute_query(
                """
                SELECT 
                    c.id::text as class_id,
                    s.subject_name,
                    s.subject_code,
                    u.full_name as tutor_name,
                    c.week_day::text as day,
                    c.start_time,
                    c.end_time,
                    c.location,
                    c.capacity,
                    c.current_enrolled,
                    c.semester,
                    ROUND(
                        (c.current_enrolled::DECIMAL / NULLIF(c.capacity, 0)) * 100,
                        1
                    ) as utilization_rate,
                    COUNT(DISTINCT sess.session_id) as total_sessions,
                    COUNT(DISTINCT CASE WHEN sess.session_status = 'completed' THEN sess.session_id END) as completed_sessions,
                    COALESCE(AVG(f.rating_scale), 0) as avg_rating
                FROM classes c
                JOIN subjects s ON c.subject_id = s.id
                JOIN public.user u ON c.tutor_id = u.id
                LEFT JOIN sessions sess ON c.id = sess.class_id
                LEFT JOIN feedback f ON c.id = f.class_id
                WHERE c.class_status != 'cancelled'
                GROUP BY c.id, s.subject_name, s.subject_code, u.full_name, 
                         c.week_day, c.start_time, c.end_time, c.location, 
                         c.capacity, c.current_enrolled, c.semester
                ORDER BY utilization_rate DESC
                """
            )
            
            # Categorize utilization
            underutilized = []
            optimal = []
            overbooked = []
            
            for cls in classes:
                cls['utilization_rate'] = round(float(cls['utilization_rate'] or 0), 1)
                cls['avg_rating'] = round(float(cls['avg_rating'] or 0), 1)
                
                utilization = cls['utilization_rate']
                if utilization < 50:
                    cls['utilization_status'] = 'underutilized'
                    underutilized.append(cls)
                elif utilization <= 90:
                    cls['utilization_status'] = 'optimal'
                    optimal.append(cls)
                else:
                    cls['utilization_status'] = 'near_capacity'
                    overbooked.append(cls)
            
            # Calculate overall metrics
            total_capacity = sum(c['capacity'] for c in classes)
            total_enrolled = sum(c['current_enrolled'] for c in classes)
            overall_utilization = round((total_enrolled / total_capacity * 100), 1) if total_capacity > 0 else 0
            
            return {
                "summary": {
                    "total_classes": len(classes),
                    "total_capacity": total_capacity,
                    "total_enrolled": total_enrolled,
                    "overall_utilization_rate": overall_utilization,
                    "underutilized_count": len(underutilized),
                    "optimal_count": len(optimal),
                    "near_capacity_count": len(overbooked)
                },
                "classes": classes,
                "by_status": {
                    "underutilized": underutilized[:10],  # Top 10
                    "near_capacity": overbooked[:10]  # Top 10
                }
            }
            
        except Exception as e:
            print(f"Error getting class utilization report: {e}")
            raise

