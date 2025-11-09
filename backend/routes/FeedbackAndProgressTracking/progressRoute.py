# routes/progressRoute.py
from fastapi import APIRouter, HTTPException, Body
from controllers.FeedbackAndProgressTracking.progressController import *
from models.FeedbackAndProgressTracking.progressModel import ProgressResponse

router = APIRouter(prefix="/progress", tags=["Progress"])


# 🟢 Tạo progress record cho session
@router.post("/session/{session_id}/mentee/{mentee_id}", response_model=ProgressResponse)
async def create_progress(session_id: int, mentee_id: int):
    result = await create_progress_controller(session_id, mentee_id)
    if not result:
        raise HTTPException(status_code=400, detail="Cannot create progress")
    return result


# 🔵 Lấy tiến độ của 1 học viên
@router.get("/student/{student_id}")
async def get_student_progress(student_id: int):
    return await get_student_progress_controller(student_id)


# 🟠 Cập nhật tiến độ
@router.put("/{progress_id}", response_model=ProgressResponse)
async def update_progress(
    progress_id: int,
    data: dict = Body(...)
):
    progress = data.get("progress")
    private_notes = data.get("private_notes")
    result = await update_progress_controller(progress_id, progress, private_notes)
    if not result:
        raise HTTPException(status_code=404, detail="Progress not found or not updated")
    return result