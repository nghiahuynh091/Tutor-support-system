from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from middleware.auth import authorize

# Import Schemas
from models.FeedbackAndProgressTracking.progressModel import (
    ProgressRecordCreate, ProgressRecordResponse, 
    ProgressScoreCreate, ProgressScoreResponse,
    ProgressScoreUpdate
)
# Import Controller
from controllers.FeedbackAndProgressTracking.progressController import ProgressController

router = APIRouter(
    prefix="/progress",
    tags=["Progress Tracking"]
)

# Helper Dependency
async def get_current_tutor_uuid(
    current_user_payload: dict = Depends(authorize(["tutor", "coordinator"])) 
) -> UUID:
    user_id_str = current_user_payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=500, detail="User ID ('sub') not found in token.")
    try:
        return UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=500, detail="Invalid format for user ID in token.")

# =================================================================
# 1. CREATE PROGRESS RECORD (HEADER)
# =================================================================
@router.post("/record", response_model=ProgressRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_progress_record_header_endpoint(
    record: ProgressRecordCreate,
    current_tutor_id: UUID = Depends(get_current_tutor_uuid) 
):
    """
    Creates a new report header. 
    Tutor ID is taken from Token. Date is set to Now.
    """
    try:
        # Pass tutor_id separately to the controller
        new_record = await ProgressController.create_record(
            tutor_id=current_tutor_id, 
            record=record
        )
        
        if not new_record:
            raise HTTPException(status_code=500, detail="Failed to create progress record header.")
        return new_record
    except ValueError as e:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# =================================================================
# 2. CREATE PROGRESS SCORE (DETAIL LINE ITEM)
# =================================================================
@router.post("/record/{report_id}/score", response_model=ProgressScoreResponse, status_code=status.HTTP_201_CREATED)
async def create_progress_score_endpoint(
    report_id: int,
    score: ProgressScoreCreate,
    # We keep auth here to ensure only tutors can add scores, 
    # even if we don't use the ID in the INSERT statement explicitly.
    current_tutor_id: UUID = Depends(get_current_tutor_uuid) 
):
    """
    Creates a single score line item linked to an existing report_id.
    """
    try:
        new_score = await ProgressController.create_score(report_id, score)
        if not new_score:
            raise HTTPException(status_code=500, detail="Failed to add score line item.")
        return new_score
    except ValueError as e:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) 


# =================================================================
# 3. READ OPERATIONS (Unchanged logic)
# =================================================================
@router.get("/class/{class_id}/notes", response_model=List[ProgressRecordResponse])
async def list_progress_records_by_class_endpoint(class_id: int):
    records = await ProgressController.get_records_by_class(class_id)
    return records

@router.get("/record/{report_id}/scores", response_model=List[ProgressScoreResponse])
async def list_progress_scores_by_record_endpoint(report_id: int):
    scores = await ProgressController.get_scores_by_record_id(report_id)
    return scores

# =================================================================
# 5. UPDATE PROGRESS SCORE (DETAIL LINE ITEM)
# Route: PATCH /progress/score/{score_id}
# =================================================================
@router.patch("/score/{score_id}", response_model=ProgressScoreResponse)
async def update_progress_score_endpoint(
    score_id: int,
    score_update: ProgressScoreUpdate,
    # Authorization check: Ensures the user updating the score has the tutor/coordinator role
    current_tutor_id: UUID = Depends(get_current_tutor_uuid) 
):
    """Updates an existing score line item using its primary key ID."""
    
    try:
        updated_score = await ProgressController.update_score(score_id, score_update)
        
        if updated_score is None:
            # Check if nothing was updated (no data sent or ID not found)
            
            # Check if the score exists first to differentiate between 404 and 200 (No Content)
            # This requires another controller method, but for simplicity, we check if fields were sent:
            if not score_update.model_dump(exclude_unset=True):
                 # If the payload was empty, return 400
                 raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided for update.")

            # Assume 404 if data was provided but controller returned None (ID not found)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Progress score with ID {score_id} not found.")
            
        return updated_score
    except HTTPException:
        raise # Re-raise 400/404 explicitly
    except Exception as e:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))