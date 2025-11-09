# controllers/assignmentController.py
from db.FeedbackAndProgressTracking import assignmentTable
from models.FeedbackAndProgressTracking.assignmentModel import AssignmentCreate


async def create_assignment_controller(data: AssignmentCreate):
    return await assignmentTable.insert_assignment(
        data.session_id,
        data.type,
        data.title,
        data.description,
        data.due_date,
        data.questions,
        data.answers
    )


async def get_assignment_controller(assignment_id: int):
    return await assignmentTable.select_assignment_by_id(assignment_id)


async def get_assignments_by_session_controller(session_id: int):
    return await assignmentTable.select_assignments_by_session(session_id)


async def update_assignment_controller(assignment_id: int, title: str, description: str, due_date, questions: list[dict], answers: list[str]):
    return await assignmentTable.update_assignment(assignment_id, title, description, due_date, questions, answers)


async def delete_assignment_controller(assignment_id: int):
    await assignmentTable.delete_assignment(assignment_id)
