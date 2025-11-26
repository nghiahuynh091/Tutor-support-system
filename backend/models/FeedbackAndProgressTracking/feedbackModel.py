# models/FeedbackAndProgressTracking/feedbackModel.py

from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime

# Base schema
class FeedbackBase(BaseModel):
    rating_scale: Optional[int] = Field(None, ge=1, le=5, description="Rating between 1 and 5")
    comments: Optional[str] = None

# 🌟 1. FeedbackInput: THE MODEL FOR THE REQUEST BODY (NO mentee_id)
# This is what FastAPI uses for body validation.
class FeedbackInput(FeedbackBase):
    class_id: int
    session_id: int

# 🌟 2. FeedbackCreate: THE MODEL FOR THE CONTROLLER/DB (YES mentee_id)
# The route handler will construct this internally.
class FeedbackCreate(FeedbackInput):
    mentee_id: UUID

# Schema for updating data (Input)
class FeedbackUpdate(FeedbackBase):
    pass

# Schema for returning data (Output)
class FeedbackResponse(FeedbackBase):
    mentee_id: UUID
    class_id: int
    session_id: int
    created_at: datetime

    class Config:
        from_attributes = True