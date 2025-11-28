from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CreateSubjectSchema(BaseModel):
    subject_name: str = Field(..., description="Subject name")
    subject_code: str = Field(..., description="Subject code")

class SubjectResponseSchema(BaseModel):
    id: int
    subject_name: str
    subject_code: str
    created_at: datetime
