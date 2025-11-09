# models/progressModel.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ProgressBase(BaseModel):
    session_id: int
    mentee_id: int
    progress: Optional[float] = None  # % tổng điểm trung bình
    private_notes: Optional[List[str]] = []


class ProgressCreate(ProgressBase):
    pass


class ProgressResponse(ProgressBase):
    id: int
    created_at: datetime
    updated_at: datetime
