from models.attendanceModel import AttendanceModel
from typing import List, Dict, Any

class AttendanceController:
    @staticmethod
    async def get_attendance(session_id: int, class_id: int) -> Dict[str, Any]:
        """
        Controller to get attendance for a session.
        """
        try:
            attendance_data = await AttendanceModel.get_attendance_by_session(session_id, class_id)
            return {
                "success": True,
                "attendance": attendance_data
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    async def update_attendance(session_id: int, class_id: int, attendance_payload: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Controller to update attendance for a session.
        """
        try:
            for record in attendance_payload:
                mentee_id = record.get("mentee_id")
                attended = record.get("attended")
                if mentee_id is not None and attended is not None:
                    await AttendanceModel.upsert_attendance(session_id, class_id, mentee_id, attended)
            return {"success": True, "message": "Attendance updated successfully."}
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
