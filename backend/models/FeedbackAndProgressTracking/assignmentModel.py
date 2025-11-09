# models/assignmentModel.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class AssignmentBase(BaseModel):
    session_id: int
    type: str  # "homework" or "quiz"
    title: str
    description: Optional[str] = None
    due_date: datetime
    questions: Optional[List[dict]] = None  # For quiz type only
    answers: Optional[List[str]] = None


class AssignmentCreate(AssignmentBase):
    pass


class AssignmentResponse(AssignmentBase):
    id: int
    timestamp: datetime

class AssignmentUpdate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: datetime
    questions: Optional[List[dict]] = None # or list[QuestionModel]
    answers: Optional[List[str]] = None