from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CreateClassSchema(BaseModel):
    subject_id: int = Field(..., description="Subject ID")
    week_day: str = Field(..., description="Day of week (enum: monday, tuesday, etc.)")
    class_status: Optional[str] = Field("scheduled", description="Class status")
    location: str = Field(..., description="Class location or meeting link")
    capacity: int = Field(..., ge=1, description="Maximum number of students")
    start_time: int = Field(..., ge=2, le=16, description="Start period (2-16)")
    end_time: int = Field(..., ge=2, le=16, description="End period (2-16)")
    num_of_weeks: int = Field(..., ge=1, description="Number of weeks")
    registration_deadline: datetime = Field(..., description="Registration deadline")
    semester: int = Field(..., description="Semester number")
