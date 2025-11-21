from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class SubmissionBase(BaseModel):
    class_id: int
    session_id: int
    choices: Optional[List[str]] = None # List các lựa chọn ["A", "B"] hoặc nội dung trả lời

class SubmissionCreate(SubmissionBase):
    """Input payload từ Mentee, không cần gửi score hay mentee_id"""
    pass

class SubmissionResponse(SubmissionBase):
    id: int
    mentee_id: UUID
    score: Optional[float] = None
    max_score: Optional[float] = None  # <--- NEW FIELD
    created_at: datetime

    class Config:
        from_attributes = True