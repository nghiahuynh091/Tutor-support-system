from pydantic import BaseModel
from uuid import UUID
from typing import Optional, List
from datetime import datetime

# =================================================================
# 1. Progress Records (Header/Master Table)
# =================================================================
class ProgressRecordCreate(BaseModel):
    """
    Input schema for creating a new report header.
    JSON payload only needs class_id and title.
    """
    class_id: int
    title: str

class ProgressRecordResponse(BaseModel):
    """Output schema for the report header."""
    id: int
    tutor_id: UUID
    class_id: int
    title: str
    progress_date: datetime 
    
    class Config:
        from_attributes = True

# =================================================================
# 2. Progress (Detail/Score Table)
# =================================================================
class ProgressScoreCreate(BaseModel):
    """
    Input schema for creating a new score line item.
    report_id comes from URL, created_at is generated server-side.
    """
    mentee_id: UUID
    points: Optional[int] = None
    comments: Optional[str] = None

class ProgressScoreResponse(BaseModel):
    """Output schema for the score line item."""
    id: int
    report_id: int 
    mentee_id: UUID
    points: Optional[int]
    comments: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProgressScoreUpdate(BaseModel):
    """Input schema for updating an existing score line item."""
    points: Optional[int] = None
    comments: Optional[str] = None
    
    class Config:
        # Prevents update of fields if they are explicitly sent as None
        # but allows skipping fields in the payload if they are None in the DB
        # This is for partial updates (PATCH)
        extra = "forbid"