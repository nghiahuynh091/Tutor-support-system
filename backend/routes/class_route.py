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
