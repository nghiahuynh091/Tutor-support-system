from typing import List, Dict, Any, Optional
from db.database import db


class NoteModel:
    @staticmethod
    async def create_note(note_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Create a new note for a session
        """
        note_title = note_data.get("note_title")
        note_information = note_data.get("note_information")
        class_id = note_data.get("class_id")
        session_id = note_data.get("session_id")
        
        # Check if session exists
        check_session_query = """
            SELECT class_id, session_id FROM sessions
            WHERE class_id = $1 AND session_id = $2
        """
        session_exists = await db.execute_query(check_session_query, class_id, session_id)
        
        if not session_exists:
            return None
        
        # Insert note
        insert_query = """
            INSERT INTO note (note_title, note_information, class_id, session_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING id, note_title, note_information, class_id, session_id, created_at, updated_at
        """
        result = await db.execute_query(
            insert_query,
            note_title,
            note_information,
            class_id,
            session_id
        )
        
        return result[0] if result else None

    @staticmethod
    async def get_note_by_id(note_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a note by its ID
        """
        query = """
            SELECT 
                n.id,
                n.note_title,
                n.note_information,
                n.class_id,
                n.session_id,
                n.created_at,
                n.updated_at,
                s.session_date,
                s.session_status
            FROM note n
            JOIN sessions s ON n.class_id = s.class_id AND n.session_id = s.session_id
            WHERE n.id = $1
        """
        result = await db.execute_query(query, note_id)
        return result[0] if result else None

    @staticmethod
    async def get_notes_by_session(class_id: int, session_id: int) -> List[Dict[str, Any]]:
        """
        Get all notes for a specific session
        """
        query = """
            SELECT 
                n.id,
                n.note_title,
                n.note_information,
                n.class_id,
                n.session_id,
                n.created_at,
                n.updated_at,
                s.session_date,
                s.session_status
            FROM note n
            JOIN sessions s ON n.class_id = s.class_id AND n.session_id = s.session_id
            WHERE n.class_id = $1 AND n.session_id = $2
            ORDER BY n.id DESC
        """
        return await db.execute_query(query, class_id, session_id)

    @staticmethod
    async def get_notes_by_class(class_id: int) -> List[Dict[str, Any]]:
        """
        Get all notes for a specific class
        """
        query = """
            SELECT 
                n.id,
                n.note_title,
                n.note_information,
                n.class_id,
                n.session_id,
                n.created_at,
                n.updated_at,
                s.session_date,
                s.session_status
            FROM note n
            JOIN sessions s ON n.class_id = s.class_id AND n.session_id = s.session_id
            WHERE n.class_id = $1
            ORDER BY n.session_id ASC, n.id DESC
        """
        return await db.execute_query(query, class_id)

    @staticmethod
    async def update_note(note_id: int, note_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update a note
        """
        note_title = note_data.get("note_title")
        note_information = note_data.get("note_information")
        
        # Check if note exists
        check_query = """
            SELECT id FROM note WHERE id = $1
        """
        existing = await db.execute_query(check_query, note_id)
        
        if not existing:
            return None
        
        # Update note
        update_query = """
            UPDATE note
            SET note_title = $1, note_information = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING id, note_title, note_information, class_id, session_id, created_at, updated_at
        """
        result = await db.execute_query(
            update_query,
            note_title,
            note_information,
            note_id
        )
        
        return result[0] if result else None

    @staticmethod
    async def delete_note(note_id: int) -> Optional[Dict[str, Any]]:
        """
        Delete a note
        """
        # Check if note exists
        check_query = """
            SELECT id, note_title, class_id, session_id FROM note WHERE id = $1
        """
        existing = await db.execute_query(check_query, note_id)
        
        if not existing:
            return None
        
        # Delete note
        delete_query = """
            DELETE FROM note
            WHERE id = $1
            RETURNING id, note_title, note_information, class_id, session_id, created_at, updated_at
        """
        result = await db.execute_query(delete_query, note_id)
        
        return result[0] if result else None

    @staticmethod
    async def verify_tutor_owns_class(tutor_id: str, class_id: int) -> bool:
        """
        Verify that a tutor owns a specific class
        """
        query = """
            SELECT id FROM classes
            WHERE id = $1 AND tutor_id = $2
        """
        result = await db.execute_query(query, class_id, tutor_id)
        return len(result) > 0

    @staticmethod
    async def get_class_id_by_note(note_id: int) -> Optional[int]:
        """
        Get the class_id associated with a note
        """
        query = """
            SELECT class_id FROM note WHERE id = $1
        """
        result = await db.execute_query(query, note_id)
        return result[0]['class_id'] if result else None
