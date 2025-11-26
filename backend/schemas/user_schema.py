from pydantic import BaseModel, Field, EmailStr
from typing import Optional

# --- Schema cho việc Đăng ký ---
class UserRegisterSchema(BaseModel):
    email: EmailStr = Field(..., example="newuser@example.com")
    password: str = Field(..., min_length=8, example="strongpassword123")
    full_name: str = Field(..., example="New User Name")
    role: str = Field(..., example="mentee") 
    

# --- Schema cho việc Login ---
class UserLoginSchema(BaseModel):
    email: EmailStr = Field(..., example="admin@example.com")
    password: str = Field(..., example="password5")
    # email: EmailStr = Field(..., example="nghiaadmin@example.com")
    # password: str = Field(..., example="nghiaadmin")


# --- Schema cho việc cập nhật hồ sơ cá nhân (mentees / tutors) ---
class UserUpdateSchema(BaseModel):
    learning_needs: Optional[str] = Field(None, example="I need help with calculus and algorithms")
    expertise_areas: Optional[str] = Field(None, example="Data Structures, Algorithms")