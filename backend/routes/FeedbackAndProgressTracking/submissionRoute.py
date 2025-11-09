# routes/submissionRoute.py
from fastapi import APIRouter, HTTPException
from models.FeedbackAndProgressTracking.submissionModel import SubmissionCreate, SubmissionResponse
from controllers.FeedbackAndProgressTracking.submissionController import *

router = APIRouter(prefix="/submission", tags=["Submission"])


# 🟢 Create
@router.post("/", response_model=SubmissionCreate)
async def create_submission(data: SubmissionCreate):
    result = await create_submission_controller(data)
    if not result:
        raise HTTPException(status_code=400, detail="Cannot create submission")
    return result


# 🔵 Get one
@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission(submission_id: int):
    result = await get_submission_controller(submission_id)
    if not result:
        raise HTTPException(status_code=404, detail="Submission not found")
    return result


# 🔵 Get all of mentee in session
@router.get("/session/{session_id}/mentee/{mentee_id}")
async def get_submissions(session_id: int, mentee_id: int):
    return await get_submissions_by_session_controller(session_id, mentee_id)

# 🔴 Delete
@router.delete("/{submission_id}")
async def delete_submission(submission_id: int):
    await delete_submission_controller(submission_id)
    return {"message": "Submission deleted"}
