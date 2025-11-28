from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
from controllers.classController import ClassController
from middleware.auth import verify_token, authorize
from schemas.class_schema import CreateClassSchema


# Create router
router = APIRouter(
    prefix="/classes",
    tags=["classes"],
    responses={404: {"description": "Not found"}}
)


@router.get("/")
async def get_all_classes():
    """
    Get all classes
    """
    result = await ClassController.get_all_classes()
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])
    
@router.get("/{class_id}")
async def get_class_by_id(class_id: int):
    """
    Get a class by its ID
    """
    result = await ClassController.get_class_by_id(class_id)
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=404, detail=result["error"])
    
@router.get("/subject/{subject_id}")
async def get_class_by_subject(subject_id: int):
    """
    Get classes by subject ID
    """
    result = await ClassController.get_class_by_subject(subject_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])


@router.post("/")
async def create_class(class_payload: CreateClassSchema, current_user: dict = Depends(authorize(["tutor"]))):
    """Create a new class and recurring sessions (tutor only)."""
    tutor_id = current_user.get("sub")
    # Convert payload to dict and pass to controller
    result = await ClassController.create_class(tutor_id, class_payload.model_dump())
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])
    
@router.get("/tutor/{tutor_id}")
async def get_classes_by_tutor(
    tutor_id: str,
    current_user: dict = Depends(authorize(["tutor", "admin"]))
):
    """Get classes by tutor ID"""
    # Ensure tutor can only access their own classes (unless admin)
    if current_user.get("role") != "admin" and current_user.get("sub") != tutor_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await ClassController.get_classes_by_tutor(tutor_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])


@router.patch("/{class_id}/status")
async def update_class_status(
    class_id: int,
    current_user: dict = Depends(authorize(["admin"]))
):
    """
    Update a single class status based on registration deadline and enrollment (admin only).
    - If deadline has passed and current_enrolled >= capacity/2: status = 'confirmed'
    - If deadline has passed and current_enrolled < capacity/2: status = 'cancelled'
    """
    result = await ClassController.update_class_status(class_id)
    
    if result["success"]:
        return result
    else:
        if result["error"] == "Class not found":
            raise HTTPException(status_code=404, detail=result["error"])
        raise HTTPException(status_code=400, detail=result["error"])


@router.patch("/status/all")
async def update_all_classes_status(
    current_user: dict = Depends(authorize(["admin"]))
):
    """
    Update status for ALL scheduled classes based on registration deadline and enrollment (admin only).
    - If deadline has passed and current_enrolled >= capacity/2: status = 'confirmed'
    - If deadline has passed and current_enrolled < capacity/2: status = 'cancelled'
    """
    result = await ClassController.update_all_classes_status()
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])


@router.post("/sessions/create")
async def create_sessions_for_confirmed_classes(
    current_user: dict = Depends(authorize(["admin"]))
):
    """
    Create sessions for all confirmed classes that don't have sessions yet (admin only).
    For each confirmed class, creates num_of_weeks sessions starting from
    the first occurrence of week_day after registration_deadline.
    """
    result = await ClassController.create_sessions_for_confirmed_classes()
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])


@router.post("/{class_id}/confirm")
async def confirm_class(
    class_id: int,
    current_user: dict = Depends(authorize(["admin"]))
):
    """
    Confirm a single class by updating its status and creating sessions (admin only).
    
    This endpoint combines two operations:
    1. Update class status based on registration deadline and enrollment
       - If current_enrolled >= capacity/2: status = 'confirmed'
       - If current_enrolled < capacity/2: status = 'cancelled'
    2. If class is confirmed, automatically create sessions (num_of_weeks sessions)
    """
    result = await ClassController.confirm_class(class_id)
    
    if result["success"]:
        return result
    else:
        if result["error"] == "Class not found":
            raise HTTPException(status_code=404, detail=result["error"])
        raise HTTPException(status_code=400, detail=result["error"])


@router.post("/confirm/all")
async def confirm_all_classes(
    current_user: dict = Depends(authorize(["admin"]))
):
    """
    Confirm ALL classes by updating their status and creating sessions (admin only).
    
    This endpoint combines two operations for all scheduled classes:
    1. Update all classes status based on registration deadline and enrollment
       - If current_enrolled >= capacity/2: status = 'confirmed'
       - If current_enrolled < capacity/2: status = 'cancelled'
    2. Create sessions for all newly confirmed classes
    """
    result = await ClassController.confirm_all_classes()
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])
