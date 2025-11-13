"""
Admin Routes - Endpoints for admin dashboard features
Includes dashboard statistics, activity feeds, conflict detection, user management, and reports
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from middleware.auth import verify_token, authorize
from models.adminModel import AdminModel
from models.reportModel import ReportModel
from typing import Dict, Any, Optional
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin Dashboard"]
)


# Pydantic models for request bodies
class DeactivateUserRequest(BaseModel):
    reason: Optional[str] = None


@router.get("/stats")
async def get_dashboard_stats(
    current_user: dict = Depends(authorize(["admin"]))
) -> Dict[str, Any]:
    """
    Get overview statistics for the admin dashboard
    
    Returns:
        - totalMentees: Number of active mentees
        - totalTutors: Number of active tutors
        - totalClasses: Number of active classes
        - totalSessions: Total number of sessions
        - totalSubjects: Number of distinct subjects
        - upcomingSessions: Number of upcoming scheduled sessions
        - completedSessions: Number of completed sessions
    
    Requires: Admin role
    """
    try:
        stats = await AdminModel.get_dashboard_stats()
        return {
            "success": True,
            "data": stats,
            "message": "Dashboard statistics retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve dashboard statistics",
                "details": str(e)
            }
        )


@router.get("/activities")
async def get_recent_activities(
    limit: int = Query(10, ge=1, le=100, description="Number of activities to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    current_user: dict = Depends(authorize(["admin"]))
) -> Dict[str, Any]:
    """
    Get recent system activities
    
    Query Parameters:
        - limit: Number of activities to return (default: 10, max: 100)
        - offset: Offset for pagination (default: 0)
    
    Returns:
        - activities: List of recent activities (registrations, class creations, session completions)
        - total: Total number of activities
    
    Requires: Admin role
    """
    try:
        activities_data = await AdminModel.get_recent_activities(limit, offset)
        return {
            "success": True,
            "data": activities_data,
            "message": "Recent activities retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve recent activities",
                "details": str(e)
            }
        )


@router.get("/conflicts")
async def get_schedule_conflicts(
    current_user: dict = Depends(authorize(["admin"]))
) -> Dict[str, Any]:
    """
    Detect and return scheduling conflicts between classes
    
    Returns:
        - conflicts: List of schedule conflicts
        - total: Total number of conflicts
    
    Each conflict includes:
        - id: Class ID
        - subject: Subject name
        - classCode: Class code
        - tutor: Tutor name
        - day: Day of week
        - periods: Time periods (e.g., "2-4")
        - conflictsWith: Description of conflicting class
        - conflictClassId: ID of the conflicting class
    
    Requires: Admin role
    """
    try:
        conflicts_data = await AdminModel.get_schedule_conflicts()
        return {
            "success": True,
            "data": conflicts_data,
            "message": "Schedule conflicts retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve schedule conflicts",
                "details": str(e)
            }
        )


# ==================== USER MANAGEMENT ENDPOINTS ====================

@router.get("/users")
async def get_all_users(
    search: Optional[str] = Query(None, description="Search by name or email"),
    role: Optional[str] = Query(None, description="Filter by role (mentee/tutor/admin)"),
    status: Optional[str] = Query(None, description="Filter by status (active/inactive)"),
    limit: int = Query(50, ge=1, le=100, description="Number of users to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    current_user: dict = Depends(authorize(["admin"]))
) -> Dict[str, Any]:
    """
    Get all users with optional filters
    
    Query Parameters:
        - search: Search by name or email
        - role: Filter by role (mentee/tutor/admin)
        - status: Filter by status (active/inactive)
        - limit: Number of users to return (default: 50, max: 100)
        - offset: Offset for pagination (default: 0)
    
    Returns:
        - users: List of users with detailed information
        - total: Total number of users matching filters
    
    Requires: Admin role
    """
    try:
        users_data = await AdminModel.get_all_users_with_filters(
            search=search,
            role=role,
            status=status,
            limit=limit,
            offset=offset
        )
        return {
            "success": True,
            "data": users_data,
            "message": "Users retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve users",
                "details": str(e)
            }
        )


@router.get("/users/{user_id}")
async def get_user_details(
    user_id: str = Path(..., description="User ID to retrieve"),
    current_user: dict = Depends(authorize(["admin"]))
) -> Dict[str, Any]:
    """
    Get detailed information about a specific user
    
    Path Parameters:
        - user_id: User ID to retrieve
    
    Returns:
        User details including:
        - Basic information (name, email, role, status)
        - Contact information (phone, address)
        - Enrollment information (for mentees)
        - Session statistics (for mentees)
    
    Requires: Admin role
    """
    try:
        user = await AdminModel.get_user_details(user_id)
        if not user:
            raise HTTPException(
                status_code=404,
                detail={
                    "success": False,
                    "error": "User not found",
                    "details": f"No user found with ID: {user_id}"
                }
            )
        
        return {
            "success": True,
            "data": user,
            "message": "User details retrieved successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve user details",
                "details": str(e)
            }
        )


@router.patch("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: str = Path(..., description="User ID to deactivate"),
    request: Optional[DeactivateUserRequest] = None,
    current_user: dict = Depends(authorize(["admin"]))
) -> Dict[str, Any]:
    """
    Deactivate a user account
    
    Path Parameters:
        - user_id: User ID to deactivate
    
    Request Body:
        - reason: Optional reason for deactivation
    
    Returns:
        Success message with deactivated user ID
    
    Requires: Admin role
    """
    try:
        # Check if user exists
        user = await AdminModel.get_user_details(user_id)
        if not user:
            raise HTTPException(
                status_code=404,
                detail={
                    "success": False,
                    "error": "User not found",
                    "details": f"No user found with ID: {user_id}"
                }
            )
        
        # Deactivate user
        reason = request.reason if request else None
        await AdminModel.deactivate_user(user_id, reason)
        
        return {
            "success": True,
            "data": {
                "userId": user_id
            },
            "message": "User deactivated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to deactivate user",
                "details": str(e)
            }
        )


# ==================== REPORTING ENDPOINTS ====================

@router.get("/reports/course-analytics")
async def get_course_analytics(
    current_user: dict = Depends(authorize(["admin"]))
) -> Dict[str, Any]:
    """
    Get comprehensive course analytics report
    
    Returns:
        summary:
            - totalCourses: Total number of courses
            - totalEnrollments: Total number of enrollments
            - averageRating: Average course rating
            - completionRate: Percentage of completed courses
        courses:
            List of courses with enrollment, completion, rating, and attendance statistics
    
    Requires: Admin role
    """
    try:
        report_data = await ReportModel.get_course_analytics()
        return {
            "success": True,
            "data": report_data,
            "message": "Course analytics retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve course analytics",
                "details": str(e)
            }
        )


@router.get("/reports/resource-usage")
async def get_resource_usage(
    current_user: dict = Depends(authorize(["admin"]))
) -> Dict[str, Any]:
    """
    Get resource usage statistics report
    
    Returns:
        summary:
            - totalResources: Total number of resources
            - mostUsedResource: Name of most downloaded resource
            - totalDownloads: Total download count across all resources
        resources:
            List of resources with download and view statistics
    
    Requires: Admin role
    """
    try:
        report_data = await ReportModel.get_resource_usage()
        return {
            "success": True,
            "data": report_data,
            "message": "Resource usage report retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve resource usage report",
                "details": str(e)
            }
        )


@router.get("/reports/participation")
async def get_participation_report(
    current_user: dict = Depends(authorize(["admin"]))
) -> Dict[str, Any]:
    """
    Get participation and engagement statistics
    
    Returns:
        summary:
            - totalParticipants: Total number of participants
            - activeUsers: Number of users active in last 30 days
            - averageSessionTime: Average session duration in minutes
            - averageAttendanceRate: Average attendance rate percentage
        participants:
            List of participants with session attendance and engagement metrics
    
    Requires: Admin role
    """
    try:
        report_data = await ReportModel.get_participation_report()
        return {
            "success": True,
            "data": report_data,
            "message": "Participation report retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve participation report",
                "details": str(e)
            }
        )


@router.get("/reports/subject-performance")
async def get_subject_performance(
    subject_id: Optional[int] = Query(None, description="Filter by specific subject ID"),
    current_user: dict = Depends(authorize(["admin", "department_chair", "academic_affairs"]))
) -> Dict[str, Any]:
    """
    Get student performance analytics by subject (for Academic Departments)
    Helps departments monitor student performance in specific courses
    
    Query Parameters:
        - subject_id: Optional subject ID to filter by specific subject
    
    Returns:
        subjects: List of subjects with performance metrics including:
            - Total students and active students
            - Average ratings and attendance rates
            - Number of tutors teaching
            - Average class size
    
    Requires: Admin, Department Chair, or Academic Affairs role
    """
    try:
        report_data = await ReportModel.get_student_performance_by_subject(subject_id)
        return {
            "success": True,
            "data": report_data,
            "message": "Subject performance report retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve subject performance report",
                "details": str(e)
            }
        )


@router.get("/reports/tutor-workload")
async def get_tutor_workload(
    current_user: dict = Depends(authorize(["admin", "academic_affairs"]))
) -> Dict[str, Any]:
    """
    Get tutor workload and performance analysis (for Office of Academic Affairs)
    Helps optimize resource allocation and identify overworked/underutilized tutors
    
    Returns:
        summary:
            - total_tutors: Total number of active tutors
            - avg_classes_per_tutor: Average classes taught per tutor
            - avg_students_per_tutor: Average students per tutor
        tutors: List of tutors with workload metrics including:
            - Total classes and students
            - Class utilization rate
            - Average ratings
            - Workload status (light/moderate/heavy)
    
    Requires: Admin or Academic Affairs role
    """
    try:
        report_data = await ReportModel.get_tutor_workload_analysis()
        return {
            "success": True,
            "data": report_data,
            "message": "Tutor workload analysis retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve tutor workload analysis",
                "details": str(e)
            }
        )


@router.get("/reports/scholarship-eligible")
async def get_scholarship_eligible_students(
    min_attendance_rate: float = Query(80.0, ge=0, le=100, description="Minimum attendance rate %"),
    min_hours: float = Query(10.0, ge=0, description="Minimum total hours"),
    min_rating_given: float = Query(4.0, ge=1, le=5, description="Minimum avg feedback rating"),
    current_user: dict = Depends(authorize(["admin", "student_affairs"]))
) -> Dict[str, Any]:
    """
    Get students eligible for scholarships/training credits (for Office of Student Affairs)
    Filters students based on participation criteria
    
    Query Parameters:
        - min_attendance_rate: Minimum attendance rate % (default: 80%)
        - min_hours: Minimum total hours attended (default: 10)
        - min_rating_given: Minimum average rating given in feedback (default: 4.0)
    
    Returns:
        summary:
            - total_eligible: Number of eligible students
            - excellent_level: Students with ≥95% attendance and ≥30 hours
            - outstanding_level: Students with ≥90% attendance and ≥20 hours
            - good_level: Other eligible students
            - criteria: The filtering criteria used
        students: List of eligible students with achievement metrics
    
    Requires: Admin or Student Affairs role
    """
    try:
        report_data = await ReportModel.get_scholarship_eligible_students(
            min_attendance_rate=min_attendance_rate,
            min_hours=min_hours,
            min_rating_given=min_rating_given
        )
        return {
            "success": True,
            "data": report_data,
            "message": "Scholarship eligible students retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve scholarship eligible students",
                "details": str(e)
            }
        )


@router.get("/reports/class-utilization")
async def get_class_utilization(
    current_user: dict = Depends(authorize(["admin", "academic_affairs"]))
) -> Dict[str, Any]:
    """
    Get class utilization and capacity analysis (for Office of Academic Affairs)
    Helps optimize resource allocation and room scheduling
    
    Returns:
        summary:
            - total_classes: Total number of active classes
            - total_capacity: Total capacity across all classes
            - total_enrolled: Total enrolled students
            - overall_utilization_rate: Overall utilization percentage
            - underutilized_count: Classes with <50% utilization
            - optimal_count: Classes with 50-90% utilization
            - near_capacity_count: Classes with >90% utilization
        classes: List of all classes with utilization metrics
        by_status:
            - underutilized: Top 10 underutilized classes
            - near_capacity: Top 10 classes near capacity
    
    Requires: Admin or Academic Affairs role
    """
    try:
        report_data = await ReportModel.get_class_utilization_report()
        return {
            "success": True,
            "data": report_data,
            "message": "Class utilization report retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve class utilization report",
                "details": str(e)
            }
        )

