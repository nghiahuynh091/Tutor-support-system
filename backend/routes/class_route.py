from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from controllers.classController import ClassController


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
