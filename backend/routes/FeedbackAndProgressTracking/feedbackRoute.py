# routes/feedbackRoute.py
from fastapi import APIRouter, HTTPException
from controllers.FeedbackAndProgressTracking.feedbackController import *
from models.FeedbackAndProgressTracking.feedbackModel import FeedbackCreate, FeedbackResponse

router = APIRouter(prefix="/feedback", tags=["Feedback"])


# 🟢 Create
@router.post("/", response_model=FeedbackResponse)
async def create_feedback(data: FeedbackCreate):
    result = await create_feedback_controller(data)
    if not result:
        raise HTTPException(status_code=400, detail="Cannot create feedback")
    return result


# 🔵 Get by ID
@router.get("/{feedback_id}", response_model=FeedbackResponse)
async def get_feedback(feedback_id: int):
    result = await get_feedback_controller(feedback_id)
    if not result:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return result


# 🔵 Get all feedback for session
@router.get("/session/{session_id}")
async def get_feedback_by_session(session_id: int):
    return await get_feedback_by_session_controller(session_id)


# 🔵 Get all feedback from mentee
@router.get("/mentee/{mentee_id}")
async def get_feedback_by_mentee(mentee_id: int):
    return await get_feedback_by_mentee_controller(mentee_id)


# 🟠 Update
@router.put("/{feedback_id}", response_model=FeedbackResponse)
async def update_feedback(feedback_id: int, rating: int, comment: str):
    result = await update_feedback_controller(feedback_id, rating, comment)
    if not result:
        raise HTTPException(status_code=404, detail="Cannot update feedback")
    return result


# 🔴 Delete
@router.delete("/{feedback_id}")
async def delete_feedback(feedback_id: int):
    await delete_feedback_controller(feedback_id)
    return {"message": "Feedback deleted"}
