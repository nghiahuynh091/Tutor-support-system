from typing import Dict, Any, List
from models.subjectModel import SubjectModel

class SubjectController:
    @staticmethod
    async def get_all_subjects() -> Dict[str, Any]:
        """Get all subjects"""
        try:
            subjects = await SubjectModel.get_all_subjects()
            return {
                "success": True,
                "subjects": subjects,
                "count": len(subjects),
                "message": "Subjects retrieved successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to fetch subjects: {str(e)}",
                "subjects": []
            }

    @staticmethod
    async def get_subject_by_id(subject_id: int) -> Dict[str, Any]:
        """Get a subject by ID"""
        try:
            subject = await SubjectModel.get_subject_by_id(subject_id)
            if subject:
                return {
                    "success": True,
                    "subject": subject,
                    "message": "Subject retrieved successfully"
                }
            else:
                return {
                    "success": False,
                    "error": "Subject not found"
                }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to fetch subject: {str(e)}"
            }

    @staticmethod
    async def create_subject(subject_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new subject"""
        try:
            subject = await SubjectModel.create_subject(subject_data)
            return {
                "success": True,
                "subject": subject,
                "message": "Subject created successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to create subject: {str(e)}"
            }