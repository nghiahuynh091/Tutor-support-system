from typing import Dict, Any, Optional, List
from models.classModel import ClassModel


class ClassController:
    @staticmethod
    async def get_all_classes(
        status: Optional[str] = None,
        tutor_id: Optional[str] = None,
        subject_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get all classes with optional filters"""
        try:
            classes = await ClassModel.get_all_classes(status, tutor_id, subject_id)
            
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