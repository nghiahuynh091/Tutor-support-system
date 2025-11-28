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