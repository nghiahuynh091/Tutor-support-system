from pydantic import BaseModel, Field, validator
from typing import Optional, List, Any
from datetime import datetime

# 1. Structure for a single Question
class QuestionItem(BaseModel):
    title: str
    # Options are required for Multiple Choice
    options: List[str] 

# 2. Structure for a single Answer
class AnswerItem(BaseModel):
    correct_answer: str
    score_value: float

# 3. Base Assignment Model
class AssignmentBase(BaseModel):
    type: str = Field(..., pattern="^(homework|quiz)$", description="Must be 'homework' or 'quiz'")
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    
    # Use the specific sub-models here
    questions: Optional[List[QuestionItem]] = None
    answers: Optional[List[AnswerItem]] = None

    @validator('questions', always=True)
    def validate_structure(cls, v, values):
        # Basic validation logic
        if 'type' in values:
            assignment_type = values['type']
            if assignment_type == 'homework':
                if v is not None and len(v) > 0:
                    raise ValueError('Homework assignments must not contain questions.')
            elif assignment_type == 'quiz':
                # You can enforce that quizzes MUST have questions here if desired
                pass 
        return v

# 4. Create Schema (Input)
class AssignmentCreate(AssignmentBase):
    class_id: int
    session_id: int

# 5. Response Schema (Output)
class AssignmentResponse(AssignmentBase):
    class_id: int
    session_id: int
    created_at: datetime

    class Config:
        from_attributes = True