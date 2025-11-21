from fastapi import APIRouter, HTTPException, status
from typing import List
import asyncpg 

from models.FeedbackAndProgressTracking.assignmentModel import AssignmentCreate, AssignmentResponse
from controllers.FeedbackAndProgressTracking.assignmentController import AssignmentController
# from middleware.auth import authorize # Uncomment when needed

router = APIRouter(
    prefix="/assignments",
    tags=["Assignments"]
)

# =================================================================
# 1. CREATE ASSIGNMENT
# =================================================================
@router.post("/", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assignment_endpoint(
    assignment: AssignmentCreate,
    # current_user: dict = Depends(authorize(["tutor", "coordinator"]))
):
    try:
        new_assignment = await AssignmentController.create_assignment(assignment)
        if not new_assignment:
             raise HTTPException(status_code=500, detail="Assignment creation failed unexpectedly.")
        return new_assignment
    except asyncpg.UniqueViolationError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Assignment already exists for this class/session ID combination."
        )
    except Exception as e:
        # Log the actual error for debugging
        print(f"Error creating assignment: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# =================================================================
# 2. GET ASSIGNMENTS BY CLASS
# =================================================================
@router.get("/class/{class_id}", response_model=List[AssignmentResponse])
async def get_assignments_for_class_endpoint(
    class_id: int,
    # current_user: dict = Depends(authorize(["mentee", "tutor", "coordinator"]))
):
    assignments = await AssignmentController.get_assignments_by_class(class_id)
    return assignments

# =================================================================
# 3. GET SINGLE ASSIGNMENT
# =================================================================
@router.get("/{class_id}/{session_id}", response_model=AssignmentResponse)
async def get_assignment_detail_endpoint(class_id: int, session_id: int):
    assignment = await AssignmentController.get_assignment(class_id, session_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")
    return assignment

# =================================================================
# 4. DELETE ASSIGNMENT
# =================================================================
@router.delete("/{class_id}/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assignment_endpoint(
    class_id: int,
    session_id: int,
    # current_user: dict = Depends(authorize(["tutor", "coordinator"]))
):
    # Check if it exists first
    existing = await AssignmentController.get_assignment(class_id, session_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Assignment not found.")

    success = await AssignmentController.delete_assignment(class_id, session_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete assignment.")
    
    return None