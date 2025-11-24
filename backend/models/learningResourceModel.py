from typing import List, Dict, Any, Optional
from db.database import db
from uuid import UUID
from datetime import datetime

class LearningResource:
    @staticmethod
    async def getSessionResources(class_id: int) -> List[Dict[str, Any]]:
        query = """
            SELECT lr.id, lr.tutor_id, lr.file_type, lr.resource_source, lr.title, lr.created_at
            FROM learning_resources lr
            JOIN class_resources cr ON lr.id = cr.resource_id 
            WHERE cr.class_id = $1
            ORDER BY lr.id DESC
        """
        return await db.execute_query(query, class_id)

    @staticmethod
    async def createResource(tutor_id: UUID, file_type: str, resource_source: str, title: str) -> Optional[int]:
        query = """
            INSERT INTO learning_resources(tutor_id, file_type, resource_source, title, created_at)
            VALUES($1, $2, $3, $4, $5)
            RETURNING id
        """
        result = await db.execute_single(query, tutor_id, file_type, resource_source, title, datetime.utcnow())
        return result['id'] if result else None
    
    @staticmethod
    async def linkResource(class_id: int, resource_id: int):
        query = """
            INSERT INTO class_resources(class_id, resource_id, created_at)
            VALUES($1, $2, $3)
        """
        await db.execute_command(query, class_id, resource_id, datetime.utcnow())
    
    @staticmethod
    async def getMaterial(learning_resource_id: int) -> Optional[Dict[str, Any]]:
        query = """
            SELECT * FROM learning_resources WHERE id = $1
        """
        return await db.execute_single(query, learning_resource_id)
    
    @staticmethod
    async def updateResource(resource_id: int, file_type: str, resource_source: str, title: str ):
        query = """
            UPDATE learning_resources
            SET file_type = $1, resource_source = $2, title = $3
            WHERE id = $4        
        """
        await db.execute_command(query, file_type, resource_source, title, resource_id)
    @staticmethod
    async def deleteResource(resource_id: int):
        await db.execute_command("DELETE FROM class_resources WHERE resource_id = $1", resource_id)
        await db.execute_command("DELETE FROM learning_resources WHERE id = $1", resource_id)
