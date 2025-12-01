from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controllers.registrationController import RegistrationController

# Request schemas
class RegisterRequest(BaseModel):
    class_id: int
    mentee_id: str

class CancelRequest(BaseModel):
    class_id: int
    mentee_id: str

class RescheduleRequest(BaseModel):
    old_class_id: int
    new_class_id: int
    mentee_id: str

# Create router
router = APIRouter(
    prefix="/registrations",
    tags=["registrations"],
    responses={404: {"description": "Not found"}}
)

@router.post("/register")
async def register_for_class(request: RegisterRequest):
    """
    Register a mentee for a class
    """
    result = await RegistrationController.register_for_class(
        request.class_id, 
        request.mentee_id
    )   
    
    if result["success"]:
        return result
    else:
        raise HTTPException(
            status_code=400 if "conflict" in result.get("error", "").lower() else 500,
            detail=result.get("error", "Registration failed")
        )

@router.post("/cancel")
async def cancel_registration(request: CancelRequest):
    """
    Cancel a class registration
    """
    result = await RegistrationController.cancel_registration(
        request.class_id, 
        request.mentee_id
    )   
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])
    
@router.post("/reschedule")
async def reschedule_class(request: RescheduleRequest):
    """
    Reschedule from old class to new class
    """
    if request.old_class_id == request.new_class_id:
        raise HTTPException(
            status_code=400,
            detail="Old class and new class cannot be the same"
        )
    
    result = await RegistrationController.reschedule_class(
        request.old_class_id,
        request.new_class_id,
        request.mentee_id
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

@router.get("/class/{class_id}/mentees")
async def get_mentees_by_class(class_id: int):
    """
    Get all mentees registered in a specific class
    """
    result = await RegistrationController.get_mentees_by_class(class_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])