# controllers/submissionController.py
from db.FeedbackAndProgressTracking.submissionTable import *
from db.FeedbackAndProgressTracking.assignmentTable import select_assignment_by_id
from models.FeedbackAndProgressTracking.submissionModel import SubmissionCreate
from typing import List
from fastapi import HTTPException

async def create_submission_controller(data: SubmissionCreate):
    # Trong thực tế, bạn sẽ tính score dựa trên quiz đúng sai
    assignment_record = await select_assignment_by_id(data.quiz_id)

    score = None
    if assignment_record:
        score = grading(chosen_options=data.chosen_options, quiz_data=assignment_record.get('answers'))

    return await insert_submission(
        data.session_id, data.mentee_id, data.quiz_id, data.chosen_options, score
    )


async def get_submission_controller(submission_id: int):
    return await select_submission_by_id(submission_id)


async def get_submissions_by_session_controller(session_id: int, mentee_id: int):
    return await select_submissions_by_session(session_id, mentee_id)

async def delete_submission_controller(submission_id: int):
    return await delete_submission(submission_id)

def grading(chosen_options: List[str], quiz_data:List[str]):
    if len(chosen_options) != len(quiz_data):
        return -1.0
    score = 0
    for opt, ans in zip(chosen_options, quiz_data):
        opt_clean = str(opt).strip()
        ans_clean = str(ans).strip()

        if opt_clean == ans_clean:
            score += 1
    return score