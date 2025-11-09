# controllers/feedbackController.py
from db.FeedbackAndProgressTracking.feedbackTable import *
from models.FeedbackAndProgressTracking.feedbackModel import FeedbackCreate


async def create_feedback_controller(data: FeedbackCreate):
    return await insert_feedback(
        data.session_id, data.mentee_id, data.rating, data.comment
    )


async def get_feedback_controller(feedback_id: int):
    return await select_feedback_by_id(feedback_id)


async def get_feedback_by_session_controller(session_id: int):
    return await select_feedback_by_session(session_id)


async def get_feedback_by_mentee_controller(mentee_id: int):
    return await select_feedback_by_mentee(mentee_id)


async def update_feedback_controller(feedback_id: int, rating: int, comment: str):
    return await update_feedback(feedback_id, rating, comment)


async def delete_feedback_controller(feedback_id: int):
    await delete_feedback(feedback_id)
