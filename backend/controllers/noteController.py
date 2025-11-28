from typing import Dict, Any, List
from models.noteModel import NoteModel


class NoteController:
    @staticmethod
    async def create_note(tutor_id: str, note_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new note (tutor only)
        """
        try:
            class_id = note_data.get("class_id")
            
            # Verify tutor owns the class
            is_owner = await NoteModel.verify_tutor_owns_class(tutor_id, class_id)
            if not is_owner:
                return {
                    "success": False,
                    "error": "You don't have permission to create notes for this class"
                }
            
            result = await NoteModel.create_note(note_data)
            
            if result is None:
                return {
                    "success": False,
                    "error": "Session not found"
                }
            
            return {
                "success": True,
                "note": result,
                "message": "Note created successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to create note: {str(e)}"
            }

    @staticmethod
    async def get_note_by_id(note_id: int) -> Dict[str, Any]:
        """
        Get a note by ID (all roles)
        """
        try:
            note = await NoteModel.get_note_by_id(note_id)
            
            if note is None:
                return {
                    "success": False,
                    "error": "Note not found"
                }
            
            return {
                "success": True,
                "note": note,
                "message": "Note retrieved successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get note: {str(e)}"
            }

    @staticmethod
    async def get_notes_by_session(class_id: int, session_id: int) -> Dict[str, Any]:
        """
        Get all notes for a session (all roles)
        """
        try:
            notes = await NoteModel.get_notes_by_session(class_id, session_id)
            
            return {
                "success": True,
                "notes": notes,
                "count": len(notes),
                "message": "Notes retrieved successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get notes: {str(e)}",
                "notes": []
            }

    @staticmethod
    async def get_notes_by_class(class_id: int) -> Dict[str, Any]:
        """
        Get all notes for a class (all roles)
        """
        try:
            notes = await NoteModel.get_notes_by_class(class_id)
            
            return {
                "success": True,
                "notes": notes,
                "count": len(notes),
                "message": "Notes retrieved successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get notes: {str(e)}",
                "notes": []
            }

    @staticmethod
    async def update_note(tutor_id: str, note_id: int, note_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update a note (tutor only)
        """
        try:
            # Get class_id from note to verify ownership
            class_id = await NoteModel.get_class_id_by_note(note_id)
            
            if class_id is None:
                return {
                    "success": False,
                    "error": "Note not found"
                }
            
            # Verify tutor owns the class
            is_owner = await NoteModel.verify_tutor_owns_class(tutor_id, class_id)
            if not is_owner:
                return {
                    "success": False,
                    "error": "You don't have permission to update this note"
                }
            
            result = await NoteModel.update_note(note_id, note_data)
            
            if result is None:
                return {
                    "success": False,
                    "error": "Note not found"
                }
            
            return {
                "success": True,
                "note": result,
                "message": "Note updated successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to update note: {str(e)}"
            }

    @staticmethod
    async def delete_note(tutor_id: str, note_id: int) -> Dict[str, Any]:
        """
        Delete a note (tutor only)
        """
        try:
            # Get class_id from note to verify ownership
            class_id = await NoteModel.get_class_id_by_note(note_id)
            
            if class_id is None:
                return {
                    "success": False,
                    "error": "Note not found"
                }
            
            # Verify tutor owns the class
            is_owner = await NoteModel.verify_tutor_owns_class(tutor_id, class_id)
            if not is_owner:
                return {
                    "success": False,
                    "error": "You don't have permission to delete this note"
                }
            
            result = await NoteModel.delete_note(note_id)
            
            if result is None:
                return {
                    "success": False,
                    "error": "Note not found"
                }
            
            return {
                "success": True,
                "note": result,
                "message": "Note deleted successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to delete note: {str(e)}"
            }
