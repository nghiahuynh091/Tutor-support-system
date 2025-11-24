from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Dict
from uuid import UUID
from models.learningResourceModel import LearningResource

router = APIRouter(prefix="/materials", tags=["Materials"])


# POST /materials/session/{session_id}
@router.post("/session/{session_id}")
async def uploadResource(session_id: int, tutor_id: UUID, file: UploadFile = File(...)):
    resource_id = await LearningResource.createResource(
        tutor_id=tutor_id,
        file_type=file.content_type,
        resource_source=file.filename,  
        title=file.filename,
    )
    await LearningResource.linkResource(session_id, resource_id)
    return {"message": "success", "resource_id": resource_id}


# GET /materials/session/{session_id}
@router.get("/session/{session_id}")
async def getSessionResource(session_id: int):
    return await LearningResource.getSessionResources(session_id)


# GET /materials/{material_id}/download
@router.get("/{material_id}/download") 
async def downloadMaterial(material_id: int):
    resource = await LearningResource.getMaterial(material_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"file": resource["resource_source"]}


# PUT /materials/{material_id}
@router.put("/{material_id}") 
async def updateMaterial(material_id: int, data: Dict):
    await LearningResource.updateResource(
        material_id,
        data["file_type"],
        data["resource_source"],
        data["title"],
    )
    return {"message": "Update success"}


# DELETE /materials/{material_id}
@router.delete("/{material_id}") 
async def deleteMaterial(material_id: int):
    await LearningResource.deleteResource(material_id)
    return {"message": "Delete success"}
