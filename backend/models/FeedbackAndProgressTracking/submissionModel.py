# models/submissionModel.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class SubmissionBase(BaseModel):
    id: Optional[int] = None
    session_id: int
    mentee_id: int
    quiz_id: int
    chosen_options: List[str]  # list các lựa chọn ["A", "C", ...]
    score: Optional[float] = None  # điểm tính theo %
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionResponse(SubmissionBase):
    id: int
    chosen_options: List[str]