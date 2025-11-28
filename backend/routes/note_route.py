from fastapi import APIRouter, HTTPException, Depends
from controllers.noteController import NoteController
from middleware.auth import authorize
from schemas.note_schema import CreateNoteSchema, UpdateNoteSchema


# Create router
router = APIRouter(
    prefix="/notes",
    tags=["notes"],
    responses={404: {"description": "Not found"}}
)


@router.post("/")
async def create_note(
    note_payload: CreateNoteSchema,
    current_user: dict = Depends(authorize(["tutor"]))
):
    """
    Create a new note for a session (tutor only)
    """
    tutor_id = current_user.get("sub")
    result = await NoteController.create_note(tutor_id, note_payload.model_dump())
    
    if result["success"]:
        return result
    else:
        if "permission" in result["error"].lower():
            raise HTTPException(status_code=403, detail=result["error"])
        if "not found" in result["error"].lower():
            raise HTTPException(status_code=404, detail=result["error"])
        raise HTTPException(status_code=400, detail=result["error"])


@router.get("/{note_id}")
async def get_note_by_id(
    note_id: int,
    current_user: dict = Depends(authorize(["tutor", "mentee", "admin"]))
):
    """
    Get a note by ID (all roles)
    """
    result = await NoteController.get_note_by_id(note_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=404, detail=result["error"])


@router.get("/session/{class_id}/{session_id}")
async def get_notes_by_session(
    class_id: int,
    session_id: int,
    current_user: dict = Depends(authorize(["tutor", "mentee", "admin"]))
):
    """
    Get all notes for a specific session (all roles)
    """
    result = await NoteController.get_notes_by_session(class_id, session_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])


@router.get("/class/{class_id}")
async def get_notes_by_class(
    class_id: int,
    current_user: dict = Depends(authorize(["tutor", "mentee", "admin"]))
):
    """
    Get all notes for a specific class (all roles)
    """
    result = await NoteController.get_notes_by_class(class_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["error"])


@router.put("/{note_id}")
async def update_note(
    note_id: int,
    note_payload: UpdateNoteSchema,
    current_user: dict = Depends(authorize(["tutor"]))
):
    """
    Update a note (tutor only)
    """
    tutor_id = current_user.get("sub")
    result = await NoteController.update_note(tutor_id, note_id, note_payload.model_dump())
    
    if result["success"]:
        return result
    else:
        if "permission" in result["error"].lower():
            raise HTTPException(status_code=403, detail=result["error"])
        if "not found" in result["error"].lower():
            raise HTTPException(status_code=404, detail=result["error"])
        raise HTTPException(status_code=400, detail=result["error"])


@router.delete("/{note_id}")
async def delete_note(
    note_id: int,
    current_user: dict = Depends(authorize(["tutor"]))
):
    """
    Delete a note (tutor only)
    """
    tutor_id = current_user.get("sub")
    result = await NoteController.delete_note(tutor_id, note_id)
    
    if result["success"]:
        return result
    else:
        if "permission" in result["error"].lower():
            raise HTTPException(status_code=403, detail=result["error"])
        if "not found" in result["error"].lower():
            raise HTTPException(status_code=404, detail=result["error"])
        raise HTTPException(status_code=400, detail=result["error"])
