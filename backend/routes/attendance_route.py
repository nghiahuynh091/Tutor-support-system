from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from controllers.attendanceController import AttendanceController
from middleware.auth import authorize

router = APIRouter(
    prefix="/attendance",
    tags=["attendance"],
    responses={404: {"description": "Not found"}}
)

@router.get("/session/{class_id}/{session_id}")
async def get_attendance_for_session(
    class_id: int,
    session_id: int,
    current_user: dict = Depends(authorize(["tutor", "admin"]))
):
    """
    Get attendance data for a specific session.
    """
    result = await AttendanceController.get_attendance(session_id, class_id)
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])

@router.post("/session/{class_id}/{session_id}")
async def update_attendance_for_session(
    class_id: int,
    session_id: int,
    attendance_data: List[Dict[str, Any]],
    current_user: dict = Depends(authorize(["tutor"]))
):
    """
    Update attendance data for a specific session.
    Expects a list of dictionaries, e.g., [{"mentee_id": "...", "attended": true}, ...]
    """
    result = await AttendanceController.update_attendance(session_id, class_id, attendance_data)
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])
