from fastapi import APIRouter, HTTPException, Depends
from controllers.subjectController import SubjectController
from schemas.subject_schema import CreateSubjectSchema
from middleware.auth import authorize

router = APIRouter(
    prefix="/subjects",
    tags=["subjects"],
    responses={404: {"description": "Not found"}}
)

@router.get("/")
async def get_all_subjects():
    """Get all subjects"""
    result = await SubjectController.get_all_subjects()
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])

@router.get("/{subject_id}")
async def get_subject_by_id(subject_id: int):
    """Get a subject by ID"""
    result = await SubjectController.get_subject_by_id(subject_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=404, detail=result["error"])

@router.post("/")
async def create_subject(
    subject_data: CreateSubjectSchema,
    current_user: dict = Depends(authorize(["admin"]))  # Only admin can create subjects
):
    """Create a new subject (admin only)"""
    result = await SubjectController.create_subject(subject_data.model_dump())
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])