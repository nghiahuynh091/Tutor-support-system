from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Dict
from uuid import UUID
from datetime import datetime
import os
from models.learningResourceModel import LearningResource
from supabase import create_client

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

router = APIRouter(prefix="/materials", tags=["Materials"])

# POST /materials/session/{session_id}
@router.post("/session/{session_id}")
async def uploadResource(
    session_id: int, 
    tutor_id: UUID = Form(...), 
    file: UploadFile = File(...)
):
    try:
        # Read file content
        file_content = await file.read()
        
        # Create unique file path for Supabase storage
        file_extension = os.path.splitext(file.filename)[1]
        storage_path = f"session_{session_id}/{tutor_id}_{int(datetime.utcnow().timestamp())}{file_extension}"
        
        # Upload to Supabase storage
        upload_response = supabase.storage.from_("learning-resources").upload(
            storage_path, 
            file_content,
            file_options={"content-type": file.content_type}
        )
        
        # Check if upload was successful
        if not upload_response:
            raise HTTPException(status_code=500, detail="Failed to upload file to storage")
        
        # store storage_path in resource_source column
        resource_id = await LearningResource.createResource(
            tutor_id=tutor_id,
            file_type=file.content_type,
            resource_source=storage_path,  
            title=file.filename
        )
        
        if not resource_id:
            # If database insert fails, try to delete the uploaded file
            try:
                supabase.storage.from_("learning-resources").remove([storage_path])
            except:
                pass
            raise HTTPException(status_code=500, detail="Failed to create resource in database")
            
        # Link resource to class/session
        await LearningResource.linkResource(session_id, resource_id)
        
        return {
            "message": "success", 
            "resource_id": resource_id,
            "file_url": supabase.storage.from_("learning-resources").get_public_url(storage_path)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

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
    
    if not resource.get('file_url'):
        raise HTTPException(status_code=404, detail="File not available for download")
    
    return {"file_url": resource['file_url'], "filename": resource["title"]}

# PUT /materials/{material_id}
@router.put("/{material_id}") 
async def updateMaterial(material_id: int, data: Dict):
    await LearningResource.updateResource(
        material_id,
        data["file_type"],
        data["resource_source"],
        data["title"]
    )
    return {"message": "Update success"}

# DELETE /materials/{material_id}
@router.delete("/{material_id}") 
async def deleteMaterial(material_id: int):
    await LearningResource.deleteResource(material_id)
    return {"message": "Delete success"}