from fastapi import APIRouter, HTTPException, status
from typing import List
from uuid import UUID
import asyncpg

from models.FeedbackAndProgressTracking.feedbackModel import FeedbackCreate, FeedbackResponse, FeedbackUpdate
from controllers.FeedbackAndProgressTracking.feedbackController import FeedbackController

router = APIRouter(
    prefix="/feedback",
    tags=["Feedback"]
)

@router.post("/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def create_feedback(feedback: FeedbackCreate):
    try:
        new_feedback = await FeedbackController.create_feedback(feedback)
        return new_feedback
    except asyncpg.UniqueViolationError:
        # Handled automatically by asyncpg if unique constraint fails
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Feedback for this session already exists."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{class_id}", response_model=List[FeedbackResponse])
async def get_class_feedbacks(class_id: int):
    feedbacks = await FeedbackController.get_feedbacks_by_class(class_id)
    return feedbacks

@router.get("/{mentee_id}/{class_id}/{session_id}", response_model=FeedbackResponse)
async def get_feedback_detail(mentee_id: UUID, class_id: int, session_id: int):
    feedback = await FeedbackController.get_feedback(mentee_id, class_id, session_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return feedback

@router.put("/{mentee_id}/{class_id}/{session_id}", response_model=FeedbackResponse)
async def update_feedback(mentee_id: UUID, class_id: int, session_id: int, feedback_update: FeedbackUpdate):
    # Check if exists first
    existing = await FeedbackController.get_feedback(mentee_id, class_id, session_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    updated_feedback = await FeedbackController.update_feedback(mentee_id, class_id, session_id, feedback_update)
    return updated_feedback

@router.delete("/{mentee_id}/{class_id}/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feedback(mentee_id: UUID, class_id: int, session_id: int):
    # Check if exists first
    existing = await FeedbackController.get_feedback(mentee_id, class_id, session_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Feedback not found")
        
    await FeedbackController.delete_feedback(mentee_id, class_id, session_id)
    return None