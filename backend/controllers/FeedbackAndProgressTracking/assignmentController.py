from typing import List, Optional, Dict, Any
from asyncpg import UniqueViolationError
import json 

from models.FeedbackAndProgressTracking.assignmentModel import AssignmentCreate
from db.database import db

class AssignmentController:

    @staticmethod
    def _serialize_json(data: Any) -> Optional[str]:
        """Helper: Chuyển Python List -> JSON String (Dùng cho INSERT/DB Write)"""
        if data is None:
            return None
        if isinstance(data, list):
            # Chuyển các Pydantic models thành dict nếu cần
            return json.dumps([item.model_dump() if hasattr(item, 'model_dump') else item for item in data])
        return json.dumps(data)

    @staticmethod
    def _parse_row(row: Any) -> Dict[str, Any]:
        """
        Helper: Chuyển Record DB -> Python Dict (Dùng cho SELECT/DB Read).
        Tự động parse chuỗi JSON trong cột 'questions' và 'answers' thành List.
        """
        if not row:
            return None
        
        # Chuyển asyncpg.Record thành dict để có thể sửa đổi dữ liệu
        data = dict(row)
        
        # Parse 'questions' nếu nó là string
        if isinstance(data.get('questions'), str):
            try:
                data['questions'] = json.loads(data['questions'])
            except json.JSONDecodeError:
                data['questions'] = []

        # Parse 'answers' nếu nó là string
        if isinstance(data.get('answers'), str):
            try:
                data['answers'] = json.loads(data['answers'])
            except json.JSONDecodeError:
                data['answers'] = []
                
        return data

    @staticmethod
    async def get_assignment(class_id: int, session_id: int) -> Optional[Dict[str, Any]]:
        query = """
            SELECT class_id, session_id, type, title, description, due_date, questions, answers, created_at
            FROM public.assignments
            WHERE class_id = $1 AND session_id = $2;
        """
        row = await db.execute_single(query, class_id, session_id)
        # Gọi hàm helper để parse JSON string thành List
        return AssignmentController._parse_row(row)

    @staticmethod
    async def get_assignments_by_class(class_id: int) -> List[Dict[str, Any]]:
        query = """
            SELECT class_id, session_id, type, title, description, due_date, questions, answers, created_at
            FROM public.assignments
            WHERE class_id = $1
            ORDER BY due_date ASC;
        """
        rows = await db.execute_query(query, class_id)
        # Duyệt qua từng dòng và parse JSON
        return [AssignmentController._parse_row(row) for row in rows]

    @staticmethod
    async def create_assignment(assignment: AssignmentCreate) -> Optional[Dict[str, Any]]:
        # Serialize dữ liệu trước khi lưu vào DB
        questions_json = AssignmentController._serialize_json(assignment.questions)
        answers_json = AssignmentController._serialize_json(assignment.answers)

        query = """
            INSERT INTO public.assignments
            (class_id, session_id, type, title, description, due_date, questions, answers)
            VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb)
            RETURNING *;
        """
        try:
            row = await db.execute_single(
                query,
                assignment.class_id,
                assignment.session_id,
                assignment.type,
                assignment.title,
                assignment.description,
                assignment.due_date,
                questions_json,
                answers_json
            )
            # Parse lại kết quả trả về từ INSERT để trả về cho API Response
            return AssignmentController._parse_row(row)
            
        except UniqueViolationError:
            raise

    @staticmethod
    async def delete_assignment(class_id: int, session_id: int) -> bool:
        query = """
            DELETE FROM public.assignments
            WHERE class_id = $1 AND session_id = $2;
        """
        result = await db.execute_command(query, class_id, session_id)
        if result and "DELETE 0" not in str(result):
             return True
        return False