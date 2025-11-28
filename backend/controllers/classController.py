from typing import Dict, Any, Optional, List
from models.classModel import ClassModel


class ClassController:
    @staticmethod
    async def get_all_classes() -> Dict[str, Any]:
        """Get all classes with optional filters"""
        try:
            classes = await ClassModel.get_all_classes()

            return {
                "success": True,
                "classes": classes,
                "count": len(classes),
                "message": "Classes retrieved successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to fetch classes: {str(e)}",
                "classes": []
            }
        
    @staticmethod
    async def get_class_by_id(class_id: int) -> Dict[str, Any]:
        """Get a class by its ID"""
        try:
            class_data = await ClassModel.get_class_by_id(class_id)
            
            if class_data:
                return {
                    "success": True,
                    "class": class_data,
                    "message": "Class retrieved successfully"
                }
            else:
                return {
                    "success": False,
                    "error": "Class not found"
                }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to fetch class: {str(e)}"
            }
        
    @staticmethod
    async def get_class_by_subject(subject_id: int) -> Dict[str, Any]:
        """Get classes by subject ID"""
        try:
            classes = await ClassModel.get_class_by_subject(subject_id)
            
            return {
                "success": True,
                "classes": classes,
                "count": len(classes),
                "message": "Classes retrieved successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to fetch classes: {str(e)}",
                "classes": []
            }

    @staticmethod
    async def create_class(tutor_id: str, class_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a class."""
        try:
            # Validate time range
            start_time = class_data.get("start_time")
            end_time = class_data.get("end_time")
            
            if start_time >= end_time:
                return {
                    "success": False, 
                    "error": "Start time must be before end time"
                }
            
            result = await ClassModel.create_class(tutor_id, class_data)
            return {
                "success": True, 
                "class": {"id": result.get("id")}, 
                "message": "Class created successfully"
            }
        except ValueError as ve:
            # Handle time overlap error
            return {
                "success": False, 
                "error": str(ve)
            }
        except Exception as e:
            return {
                "success": False, 
                "error": f"Failed to create class: {str(e)}"
            }
        
    @staticmethod
    async def get_classes_by_tutor(tutor_id: str) -> Dict[str, Any]:
        """Get classes by tutor ID"""
        try:
            classes = await ClassModel.get_classes_by_tutor(tutor_id)
            return {
                "success": True,
                "classes": classes,
                "count": len(classes),
                "message": "Classes retrieved successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to fetch classes: {str(e)}",
                "classes": []
            }

    @staticmethod
    async def update_class_status(class_id: int) -> Dict[str, Any]:
        """
        Update class status based on registration deadline and enrollment.
        - If deadline has passed and current_enrolled >= capacity/2: status = 'confirmed'
        - If deadline has passed and current_enrolled < capacity/2: status = 'cancelled'
        """
        try:
            result = await ClassModel.update_class_status(class_id)
            
            if result is None:
                return {
                    "success": False,
                    "error": "Class not found"
                }
            
            if result.get("updated"):
                return {
                    "success": True,
                    "class": result,
                    "message": f"Class status updated to '{result.get('status')}'"
                }
            else:
                return {
                    "success": True,
                    "class": result,
                    "message": result.get("message", "No update needed")
                }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to update class status: {str(e)}"
            }

    @staticmethod
    async def update_all_classes_status() -> Dict[str, Any]:
        """
        Update status for all classes based on registration deadline and enrollment.
        - If deadline has passed and current_enrolled >= capacity/2: status = 'confirmed'
        - If deadline has passed and current_enrolled < capacity/2: status = 'cancelled'
        """
        try:
            result = await ClassModel.update_all_classes_status()
            
            return {
                "success": True,
                "data": result,
                "message": result.get("message", "Classes status updated successfully")
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to update classes status: {str(e)}"
            }

    @staticmethod
    async def create_sessions_for_confirmed_classes() -> Dict[str, Any]:
        """
        Create sessions for all confirmed classes that don't have sessions yet.
        For each confirmed class, create num_of_weeks sessions.
        """
        try:
            result = await ClassModel.create_sessions_for_confirmed_classes()
            
            return {
                "success": True,
                "data": result,
                "message": result.get("message", "Sessions created successfully")
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to create sessions: {str(e)}"
            }

    @staticmethod
    async def confirm_class(class_id: int) -> Dict[str, Any]:
        """
        Confirm a class by updating its status and creating sessions.
        This combines update_class_status and create_sessions into one operation.
        
        Steps:
        1. Update class status based on deadline and enrollment
        2. If class is confirmed, create sessions for the class
        """
        try:
            # Step 1: Update class status
            status_result = await ClassModel.update_class_status(class_id)
            
            if status_result is None:
                return {
                    "success": False,
                    "error": "Class not found"
                }
            
            # If deadline hasn't passed, return early
            if not status_result.get("updated"):
                return {
                    "success": True,
                    "status_update": status_result,
                    "sessions": None,
                    "message": status_result.get("message", "No update needed")
                }
            
            # If class was cancelled, no need to create sessions
            if status_result.get("status") == "cancelled":
                return {
                    "success": True,
                    "status_update": status_result,
                    "sessions": None,
                    "message": f"Class status updated to 'cancelled'. No sessions created due to insufficient enrollment ({status_result.get('current_enrolled')}/{status_result.get('capacity')})"
                }
            
            # Step 2: Class is confirmed, create sessions
            sessions_result = await ClassModel.create_sessions_for_class(class_id)
            
            if sessions_result is None:
                return {
                    "success": False,
                    "error": "Failed to create sessions: Class not found"
                }
            
            if sessions_result.get("error"):
                return {
                    "success": True,
                    "status_update": status_result,
                    "sessions": sessions_result,
                    "message": f"Class confirmed but sessions not created: {sessions_result.get('error')}"
                }
            
            return {
                "success": True,
                "status_update": status_result,
                "sessions": sessions_result,
                "message": f"Class confirmed successfully. Created {sessions_result.get('sessions_created')} sessions."
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to confirm class: {str(e)}"
            }

    @staticmethod
    async def confirm_all_classes() -> Dict[str, Any]:
        """
        Confirm all classes by updating their status and creating sessions.
        This combines update_all_classes_status and create_sessions_for_confirmed_classes.
        
        Steps:
        1. Update all classes status based on deadline and enrollment
        2. Create sessions for all confirmed classes
        """
        try:
            # Step 1: Update all classes status
            status_result = await ClassModel.update_all_classes_status()
            
            # Step 2: Create sessions for all confirmed classes
            sessions_result = await ClassModel.create_sessions_for_confirmed_classes()
            
            return {
                "success": True,
                "status_update": status_result,
                "sessions": sessions_result,
                "message": f"Processed {status_result.get('classes_processed', 0)} classes. "
                          f"Confirmed: {status_result.get('confirmed_count', 0)}, "
                          f"Cancelled: {status_result.get('cancelled_count', 0)}. "
                          f"Created {sessions_result.get('sessions_created', 0)} sessions."
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to confirm classes: {str(e)}"
            }