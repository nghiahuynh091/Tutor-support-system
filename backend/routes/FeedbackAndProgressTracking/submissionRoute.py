from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from middleware.auth import authorize 

from models.FeedbackAndProgressTracking.submissionModel import (
    SubmissionCreate, SubmissionResponse
)
from controllers.FeedbackAndProgressTracking.submissionController import SubmissionController

router = APIRouter(
    prefix="/submission",
    tags=["Submission"]
)

# Helper để lấy ID từ token (giả sử bạn dùng chung logic auth cũ)
async def get_current_user_uuid(
    current_user_payload: dict = Depends(authorize(["mentee", "tutor", "coordinator"])) 
) -> UUID:
    user_id_str = current_user_payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=500, detail="User ID not found in token.")
    return UUID(user_id_str)


# =================================================================
# 1. CREATE SUBMISSION
# =================================================================
@router.post("/", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
async def create_submission_endpoint(
    data: SubmissionCreate,
    # Chỉ Mentee mới được nộp bài
    current_user: dict = Depends(authorize(["mentee"])) 
):
    """
    Mentee nộp bài. Hệ thống tự động chấm điểm nếu Assignment có đáp án.
    """
    mentee_id = UUID(current_user.get("sub"))
    
    try:
        new_submission = await SubmissionController.create_submission(mentee_id, data)
        if not new_submission:
            raise HTTPException(status_code=500, detail="Failed to create submission.")
        return new_submission
    except ValueError as e:
        # Lỗi nếu class_id/session_id không tồn tại
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =================================================================
# 2. GET SUBMISSION BY ID
# =================================================================
@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission_detail_endpoint(
    submission_id: int,
    current_user_payload: dict = Depends(authorize(["mentee", "tutor", "coordinator"]))
):
    submission = await SubmissionController.get_submission_by_id(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # TODO: Thêm logic kiểm tra quyền sở hữu (Mentee chỉ xem bài mình, Tutor xem bài lớp mình)
    return submission


# =================================================================
# 3. GET SUBMISSIONS BY SESSION (History)
# =================================================================
@router.get("/history/{class_id}/{session_id}", response_model=List[SubmissionResponse])
async def get_submission_history_endpoint(
    class_id: int,
    session_id: int,
    current_user: dict = Depends(authorize(["mentee", "tutor"]))
):
    """
    - Mentee: Xem lịch sử nộp bài của chính mình trong session đó.
    - Tutor: Xem toàn bộ bài nộp của lớp trong session đó.
    """
    role = current_user.get("role")
    user_id = UUID(current_user.get("sub"))

    if role == "mentee":
        # Mentee chỉ xem bài của mình
        return await SubmissionController.get_submissions_by_session(class_id, session_id, mentee_id=user_id)
    else:
        # Tutor xem tất cả (tham số mentee_id=None)
        return await SubmissionController.get_submissions_by_session(class_id, session_id)