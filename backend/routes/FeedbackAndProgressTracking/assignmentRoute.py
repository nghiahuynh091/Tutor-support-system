# routes/assignmentRoute.py
from fastapi import APIRouter, HTTPException
from models.FeedbackAndProgressTracking.assignmentModel import *
from controllers.FeedbackAndProgressTracking.assignmentController import *

router = APIRouter(prefix="/assignment", tags=["Assignment"])


# 🟢 Create assignment
@router.post("/", response_model=AssignmentResponse)
async def create_assignment(data: AssignmentCreate):
    result = await create_assignment_controller(data)
    if not result:
        raise HTTPException(status_code=400, detail="Cannot create assignment")
    return result


# 🔵 Get assignment by ID
@router.get("/{assignment_id}", response_model=AssignmentResponse)
async def get_assignment(assignment_id: int):
    result = await get_assignment_controller(assignment_id)
    if not result:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return result


# 🔵 Get all assignments in a session
@router.get("/session/{session_id}")
async def get_assignments(session_id: int):
    return await get_assignments_by_session_controller(session_id)


# 🟠 Update assignment
@router.put("/{assignment_id}", response_model=AssignmentResponse) # Changed response_model
async def update_assignment(
    assignment_id: int, 
    assignment_data: AssignmentUpdate # <-- Reads the entire JSON body using the Pydantic model
):
    # Pass the data from the Pydantic model object to the controller
    result = await update_assignment_controller(
        assignment_id,
        assignment_data.title,
        assignment_data.description,
        assignment_data.due_date,
        assignment_data.questions,
        assignment_data.answers
    )
    
    if not result:
        raise HTTPException(status_code=404, detail=f"Assignment with ID {assignment_id} not found or cannot be updated.")
        
    return result


# 🔴 Delete assignment
@router.delete("/{assignment_id}")
async def delete_assignment(assignment_id: int):
    await delete_assignment_controller(assignment_id)
    return {"message": "Assignment deleted"}
