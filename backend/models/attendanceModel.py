from db.database import db
from typing import List, Dict, Any

class AttendanceModel:
    @staticmethod
    async def get_attendance_by_session(session_id: int, class_id: int) -> List[Dict[str, Any]]:
        """
        Gets the attendance records for all mentees in a specific session.
        """
        query = """
            SELECT mentee_id, attendance_mark
            FROM attendance
            WHERE session_id = $1 AND class_id = $2;
        """
        return await db.execute_query(query, session_id, class_id)

    @staticmethod
    async def upsert_attendance(session_id: int, class_id: int, mentee_id: str, attended: bool) -> None:
        """
        Inserts or updates an attendance record for a single mentee.
        """
        query = """
            INSERT INTO attendance (session_id, class_id, mentee_id, attendance_mark)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (mentee_id, class_id, session_id)
            DO UPDATE SET attendance_mark = $4;
        """
        await db.execute_command(query, session_id, class_id, mentee_id, attended)
