from pydantic import BaseModel, Field
from typing import Optional


class CreateNoteSchema(BaseModel):
    note_title: str = Field(..., min_length=1, description="Title of the note")
    note_information: str = Field(..., min_length=1, description="Content of the note")
    class_id: int = Field(..., ge=1, description="Class ID")
    session_id: int = Field(..., ge=1, description="Session ID")


class UpdateNoteSchema(BaseModel):
    note_title: str = Field(..., min_length=1, description="Title of the note")
    note_information: str = Field(..., min_length=1, description="Content of the note")
