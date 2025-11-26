from pydantic import BaseModel, Field
from typing import List, Optional


class TimeSlot(BaseModel):
    dayOfWeek: int = Field(..., description="1=Monday .. 7=Sunday")
    startPeriod: int = Field(..., description="Start period index (frontend mapping)")
    endPeriod: int = Field(..., description="End period index (frontend mapping)")


class CreateClassSchema(BaseModel):
    subject_id: int = Field(...)
    subject_name: Optional[str] = Field(None)
    subject_code: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    max_students: int = Field(...)
    number_of_weeks: int = Field(..., ge=1)
    meeting_link: Optional[str] = Field(None)
    time_slots: List[TimeSlot] = Field(..., min_items=1)
