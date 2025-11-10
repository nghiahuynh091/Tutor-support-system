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