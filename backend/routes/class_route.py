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
async def get_all_classes(
    status: Optional[str] = Query(None, description="Filter by status: pending, approved, scheduled, cancelled, completed"),
    tutor_id: Optional[str] = Query(None, description="Filter by tutor ID"),
    subject_id: Optional[int] = Query(None, description="Filter by subject ID")
):
    """
    Get all classes with optional filters
    
    - **status**: Filter by class status
    - **tutor_id**: Get classes for specific tutor
    - **subject_id**: Get classes for specific subject
    """
    result = await ClassController.get_all_classes(status, tutor_id, subject_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])
