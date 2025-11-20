from fastapi import APIRouter, HTTPException, Body
from typing import Optional
from controllers.registrationController import RegistrationController

# Create router
router = APIRouter(
    prefix="/registrations",
    tags=["registrations"],
    responses={404: {"description": "Not found"}}
)

@router.post("/register")
async def register_for_class(
    request: Optional[dict] = Body(...,
    example={
        "class_id": 1,
        "mentee_id": "uuid-of-mentee"
    })):
    """
    Register a mentee for a class
    """
    result = await RegistrationController.register_for_class(
        request.get("class_id"), 
        request.get("mentee_id")
    )   
    
    if result["success"]:
        return result
    else:
        raise HTTPException(
            status_code=400 if "conflict" in result.get("error", "").lower() else 500,
            detail=result.get("error", "Registration failed")
        )
@router.post("/cancel")
async def cancel_registration(
    request: Optional[dict] = Body(...,
    example={
        "class_id": 1,
        "mentee_id": "uuid-of-mentee"
    })):
    """
    Cancel a class registration
    """
    result = await RegistrationController.cancel_registration(
        request.get("class_id"), 
        request.get("mentee_id")
    )   
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])
    
@router.post("/reschedule")
async def reschedule_class(
    request: Optional[dict] = Body(...,
    example={
        "old_class_id": 1,
        "new_class_id": 2,
        "mentee_id": "uuid-of-mentee"
    })):
    """
    Reschedule from old class to new class
    """
    old_class_id = request.get("old_class_id")
    new_class_id = request.get("new_class_id")
    mentee_id = request.get("mentee_id")
    
    if not all([old_class_id, new_class_id, mentee_id]):
        raise HTTPException(
            status_code=400,
            detail="old_class_id, new_class_id, and mentee_id are all required"
        )
    
    if old_class_id == new_class_id:
        raise HTTPException(
            status_code=400,
            detail="Old class and new class cannot be the same"
        )
    
    result = await RegistrationController.reschedule_class(
        old_class_id,
        new_class_id,
        mentee_id
    )
    
    if result["success"]:
        return result
    else:
        raise HTTPException(
            status_code=400,
            detail=result.get("error", "Reschedule failed")
        )
    

@router.get("/check-conflict")
async def check_time_conflict(mentee_id: str, class_id: int):
    """
    Check if registering for a class would create a time conflict
    """
    result = await RegistrationController.check_time_conflict(mentee_id, class_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])

@router.get("/mentee/{mentee_id}")
async def get_registrations_by_mentee(mentee_id: str):
    """
    Get all class registrations for a mentee
    """
    result = await RegistrationController.get_registrations_by_mentee(mentee_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])