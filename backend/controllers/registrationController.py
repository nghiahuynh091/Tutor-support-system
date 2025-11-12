from models.registrationModel import RegistrationModel
from typing import Dict, Any

class RegistrationController:
    @staticmethod
    async def register_for_class(class_id: int, mentee_id: str) -> Dict[str, Any]:
        """
        Register a mentee for a class
        body: {
            "class_id": 1,
            "mentee_id": "uuid-of-mentee"
            }
        """
        try:
            # Check for time conflicts first
            conflict_check = await RegistrationModel.check_time_conflict(mentee_id, class_id)
            
            if conflict_check["has_conflict"]:
                return {
                    "success": False,
                    "error": "Time conflict detected",
                    "conflicts": conflict_check["conflicts"]
                }
            
            # Proceed with registration
            result = await RegistrationModel.register_for_class(class_id, mentee_id)
            return result
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
        
    @staticmethod
    async def cancel_registration(class_id: int, mentee_id: str) -> Dict[str, Any]:
        """
        Cancel a class registration
        """
        try:
            result = await RegistrationModel.cancel_registration(class_id, mentee_id)
            return result
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
        
    @staticmethod
    async def reschedule_class(
        old_class_id: int, 
        new_class_id: int, 
        mentee_id: str
    ) -> Dict[str, Any]:
        """
        Reschedule from old class to new class
        Validates:
        - Old registration exists
        - Both deadlines haven't passed
        - New class has space
        - No time conflicts
        """
        try:
            result = await RegistrationModel.reschedule_class(
                old_class_id, 
                new_class_id, 
                mentee_id
            )
            return result
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    async def get_registrations_by_mentee(mentee_id: str) -> Dict[str, Any]:
        """
        Get all class registrations for a mentee
        """
        try:
            registrations = await RegistrationModel.get_registrations_by_mentee(mentee_id)
            return {
                "success": True,
                "registrations": registrations,
                "count": len(registrations),
                "message": "Registrations retrieved successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    async def check_time_conflict(mentee_id: str, class_id: int) -> Dict[str, Any]:
        """
        Check for time conflicts
        """
        try:
            result = await RegistrationModel.check_time_conflict(mentee_id, class_id)
            return {
                "success": True,
                "data": result
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }