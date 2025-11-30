from typing import Dict, Any, List
from models.sessionModel import SessionModel


class SessionController:
    # ==================== MENTEE ENDPOINTS ====================
    
    @staticmethod
    async def get_sessions_by_mentee(mentee_id: str) -> Dict[str, Any]:
        """
        Get all sessions for a mentee
        """
        try:
            sessions = await SessionModel.get_sessions_by_mentee(mentee_id)
            
            return {
                "success": True,
                "sessions": sessions,
                "count": len(sessions),
                "message": "Sessions retrieved successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get sessions: {str(e)}",
                "sessions": []
            }

    @staticmethod
    async def get_sessions_by_mentee_and_class(mentee_id: str, class_id: int) -> Dict[str, Any]:
        """
        Get all sessions for a mentee in a specific class
        """
        try:
            sessions = await SessionModel.get_sessions_by_mentee_and_class(mentee_id, class_id)
            
            if sessions is None:
                return {
                    "success": False,
                    "error": "You are not registered for this class"
                }
            
            return {
                "success": True,
                "sessions": sessions,
                "count": len(sessions),
                "message": "Sessions retrieved successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get sessions: {str(e)}",
                "sessions": []
            }

    # ==================== TUTOR ENDPOINTS ====================
    
    @staticmethod
    async def get_sessions_by_tutor(tutor_id: str) -> Dict[str, Any]:
        """
        Get all sessions for a tutor
        """
        try:
            sessions = await SessionModel.get_sessions_by_tutor(tutor_id)
            
            return {
                "success": True,
                "sessions": sessions,
                "count": len(sessions),
                "message": "Sessions retrieved successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get sessions: {str(e)}",
                "sessions": []
            }

    @staticmethod
    async def get_sessions_by_tutor_and_class(tutor_id: str, class_id: int) -> Dict[str, Any]:
        """
        Get all sessions for a tutor in a specific class
        """
        try:
            sessions = await SessionModel.get_sessions_by_tutor_and_class(tutor_id, class_id)
            
            if sessions is None:
                return {
                    "success": False,
                    "error": "You don't have permission to view sessions for this class"
                }
            
            return {
                "success": True,
                "sessions": sessions,
                "count": len(sessions),
                "message": "Sessions retrieved successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get sessions: {str(e)}",
                "sessions": []
            }

    @staticmethod
    async def cancel_session(tutor_id: str, class_id: int, session_id: int) -> Dict[str, Any]:
        """
        Cancel a session (tutor only)
        """
        try:
            # Verify tutor owns the class
            is_owner = await SessionModel.verify_tutor_owns_class(tutor_id, class_id)
            if not is_owner:
                return {
                    "success": False,
                    "error": "You don't have permission to cancel this session"
                }
            
            # Get current session to check status
            session = await SessionModel.get_session_by_id(class_id, session_id)
            if session is None:
                return {
                    "success": False,
                    "error": "Session not found"
                }
            
            # Check if session is already cancelled
            if session['session_status'] == 'cancelled':
                return {
                    "success": False,
                    "error": "Session is already cancelled"
                }
            
            # Update session status to cancelled
            result = await SessionModel.update_session_status(class_id, session_id, 'cancelled')
            
            if result is None:
                return {
                    "success": False,
                    "error": "Failed to cancel session"
                }
            
            return {
                "success": True,
                "session": result,
                "message": "Session cancelled successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to cancel session: {str(e)}"
            }

    @staticmethod
    async def complete_session(tutor_id: str, class_id: int, session_id: int) -> Dict[str, Any]:
        """
        Mark a session as completed (tutor only)
        """
        try:
            # Verify tutor owns the class
            is_owner = await SessionModel.verify_tutor_owns_class(tutor_id, class_id)
            if not is_owner:
                return {
                    "success": False,
                    "error": "You don't have permission to complete this session"
                }
            
            # Get current session to check status
            session = await SessionModel.get_session_by_id(class_id, session_id)
            if session is None:
                return {
                    "success": False,
                    "error": "Session not found"
                }
            
            # Check if session is already completed
            if session['session_status'] == 'completed':
                return {
                    "success": False,
                    "error": "Session is already completed"
                }
            
            # Update session status to completed
            result = await SessionModel.update_session_status(class_id, session_id, 'completed')
            
            if result is None:
                return {
                    "success": False,
                    "error": "Failed to complete session"
                }
            
            return {
                "success": True,
                "session": result,
                "message": "Session completed successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to complete session: {str(e)}"
            }


    # ==================== COMMON ENDPOINTS ====================
    
    @staticmethod
    async def get_session_by_id(class_id: int, session_id: int) -> Dict[str, Any]:
        """
        Get a specific session by class_id and session_id
        """
        try:
            session = await SessionModel.get_session_by_id(class_id, session_id)
            
            if session is None:
                return {
                    "success": False,
                    "error": "Session not found"
                }
            
            return {
                "success": True,
                "session": session,
                "message": "Session retrieved successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get session: {str(e)}"
            }
