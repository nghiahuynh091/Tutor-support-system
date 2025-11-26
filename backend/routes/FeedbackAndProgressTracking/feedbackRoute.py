from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from uuid import UUID
import asyncpg

from models.FeedbackAndProgressTracking.feedbackModel import FeedbackInput, FeedbackCreate, FeedbackResponse, FeedbackUpdate
from controllers.FeedbackAndProgressTracking.feedbackController import FeedbackController
from middleware.auth import verify_token, authorize

router = APIRouter(
    prefix="/feedback",
    tags=["Feedback"]
)

@router.post("/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def create_feedback(
    # 🛑 Use FeedbackInput here! This tells FastAPI not to expect mentee_id in the body.
    feedback: FeedbackInput, 
    current_user: dict = Depends(verify_token) 
):
    try:
        # 1. Extract mentee_id (user_id) from the token payload
        mentee_id_str = current_user.get("sub")
        if not mentee_id_str:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: User ID missing or invalid")
        
        # 2. Reconstruct the Full Model using the data from the token and the body
        # 🟢 Use FeedbackCreate here! This is the model the controller expects.
        feedback_for_controller = FeedbackCreate(
            mentee_id=UUID(mentee_id_str), # Injected from token
            class_id=feedback.class_id,
            session_id=feedback.session_id,
            rating_scale=feedback.rating_scale,
            comments=feedback.comments
        )
        
        # 3. Call the controller
        new_feedback = await FeedbackController.create_feedback(feedback_for_controller)
        return new_feedback
        
    except asyncpg.UniqueViolationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Feedback for this session already exists."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create feedback: {str(e)}")

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