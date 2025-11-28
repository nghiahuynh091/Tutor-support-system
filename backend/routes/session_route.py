from fastapi import APIRouter, HTTPException, Depends
from controllers.sessionController import SessionController
from middleware.auth import authorize


# Create router
router = APIRouter(
    prefix="/sessions",
    tags=["sessions"],
    responses={404: {"description": "Not found"}}
)


# ==================== MENTEE ENDPOINTS ====================

@router.get("/mentee/all")
async def get_sessions_by_mentee(
    current_user: dict = Depends(authorize(["mentee"]))
):
    """
    Get all sessions for current mentee (from registered classes)
    """
    mentee_id = current_user.get("sub")
    result = await SessionController.get_sessions_by_mentee(mentee_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])


@router.get("/mentee/class/{class_id}")
async def get_sessions_by_mentee_and_class(
    class_id: int,
    current_user: dict = Depends(authorize(["mentee"]))
):
    """
    Get all sessions for current mentee in a specific class
    """
    mentee_id = current_user.get("sub")
    result = await SessionController.get_sessions_by_mentee_and_class(mentee_id, class_id)
    
    if result["success"]:
        return result
    else:
        if "not registered" in result["error"].lower():
            raise HTTPException(status_code=403, detail=result["error"])
        raise HTTPException(status_code=500, detail=result["error"])


# ==================== TUTOR ENDPOINTS ====================

@router.get("/tutor/all")
async def get_sessions_by_tutor(
    current_user: dict = Depends(authorize(["tutor"]))
):
    """
    Get all sessions for current tutor (from classes they teach)
    """
    tutor_id = current_user.get("sub")
    result = await SessionController.get_sessions_by_tutor(tutor_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])


@router.get("/tutor/class/{class_id}")
async def get_sessions_by_tutor_and_class(
    class_id: int,
    current_user: dict = Depends(authorize(["tutor"]))
):
    """
    Get all sessions for current tutor in a specific class
    """
    tutor_id = current_user.get("sub")
    result = await SessionController.get_sessions_by_tutor_and_class(tutor_id, class_id)
    
    if result["success"]:
        return result
    else:
        if "permission" in result["error"].lower():
            raise HTTPException(status_code=403, detail=result["error"])
        raise HTTPException(status_code=500, detail=result["error"])


@router.patch("/{class_id}/{session_id}/cancel")
async def cancel_session(
    class_id: int,
    session_id: int,
    current_user: dict = Depends(authorize(["tutor"]))
):
    """
    Cancel a session (tutor only)
    """
    tutor_id = current_user.get("sub")
    result = await SessionController.cancel_session(tutor_id, class_id, session_id)
    
    if result["success"]:
        return result
    else:
        if "permission" in result["error"].lower():
            raise HTTPException(status_code=403, detail=result["error"])
        if "not found" in result["error"].lower():
            raise HTTPException(status_code=404, detail=result["error"])
        raise HTTPException(status_code=400, detail=result["error"])


# ==================== COMMON ENDPOINTS ====================
# Note: This route must be placed LAST because it uses path parameters
# that could match other routes like /mentee/all or /tutor/all

@router.get("/{class_id}/{session_id}")
async def get_session_by_id(
    class_id: int,
    session_id: int,
    current_user: dict = Depends(authorize(["tutor", "mentee", "admin"]))
):
    """
    Get a specific session by class_id and session_id (all roles)
    """
    result = await SessionController.get_session_by_id(class_id, session_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=404, detail=result["error"])