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
async def register_for_class(request: Optional[dict] = Body(...,
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