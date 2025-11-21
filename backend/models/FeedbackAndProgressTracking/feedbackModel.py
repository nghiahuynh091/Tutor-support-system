from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime

# Base schema
class FeedbackBase(BaseModel):
    rating_scale: Optional[int] = Field(None, ge=1, le=5, description="Rating between 1 and 5")
    comments: Optional[str] = None

# Schema for creating data (Input)
class FeedbackCreate(FeedbackBase):
    mentee_id: UUID
    class_id: int
    session_id: int

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
        # This allows Pydantic to read from the asyncpg Record object (which acts like a dict)
        from_attributes = True