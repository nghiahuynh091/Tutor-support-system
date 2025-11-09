# models/feedbackModel.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FeedbackBase(BaseModel):
    session_id: int
    mentee_id: int
    rating: int = Field(..., ge=1, le=5)  # rating 1–5
    comment: Optional[str] = None


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackResponse(FeedbackBase):
    id: int
    timestamp: datetime
