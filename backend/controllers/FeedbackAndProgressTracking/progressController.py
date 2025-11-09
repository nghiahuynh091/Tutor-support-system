# controllers/progressController.py
from db.FeedbackAndProgressTracking.progressTable import *
from models.FeedbackAndProgressTracking.progressModel import ProgressCreate
from typing import List


async def create_progress_controller(session_id: int, mentee_id: int):
    # Mặc định progress ban đầu = 0%
    return await insert_progress(session_id, mentee_id, 0.0)


async def get_student_progress_controller(student_id: int):
    return await select_progress_by_student(student_id)


async def get_progress_controller(progress_id: int):
    return await select_progress(progress_id)


async def update_progress_controller(progress_id: int, progress: float, notes: List[str]):
    return await update_progress(progress_id, progress, notes)


async def delete_progress_controller(progress_id: int):
    return await delete_progress(progress_id)