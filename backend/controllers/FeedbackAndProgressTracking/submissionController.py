from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID
from datetime import datetime
import json

from db.database import db
from models.FeedbackAndProgressTracking.submissionModel import SubmissionCreate

class SubmissionController:

    # =================================================================
    # HELPER: SCORING LOGIC
    # =================================================================
    @staticmethod
    def calculate_grading(chosen_options: List[str], correct_answers_data: List[Dict[str, Any]]) -> Tuple[float, float]:
        """
        Calculates the earned score and the maximum possible score.
        
        Args:
            chosen_options: List of strings submitted by the user (e.g., ["Pydantic", "201 Created"])
            correct_answers_data: List of dicts from DB (e.g., [{"correct_answer": "Pydantic", "score_value": 3.0}, ...])
            
        Returns:
            Tuple containing (earned_score, max_possible_score)
        """
        if not correct_answers_data:
            return 0.0, 0.0
            
        earned_score = 0.0
        max_possible_score = 0.0
        
        # Loop through the official answer key
        for i, ans_item in enumerate(correct_answers_data):
            # 1. Accumulate Max Score (Add points regardless of user answer)
            points = float(ans_item.get("score_value", 0.0))
            max_possible_score += points

            # 2. Calculate Earned Score
            # Ensure user provided an answer at this index to avoid index errors
            if chosen_options and i < len(chosen_options):
                # Normalize strings (strip whitespace, lowercase) for comparison
                user_ans = str(chosen_options[i]).strip().lower()
                correct_text = str(ans_item.get("correct_answer", "")).strip().lower()
                
                if user_ans == correct_text:
                    earned_score += points
        
        return earned_score, max_possible_score

    # =================================================================
    # 1. CREATE SUBMISSION
    # =================================================================
    @staticmethod
    async def create_submission(mentee_id: UUID, data: SubmissionCreate) -> Optional[Dict[str, Any]]:
        """
        Fetches assignment answers, grades the submission, and saves it.
        """
        # A. Fetch assignment answers to grade against
        query_assign = """
            SELECT answers 
            FROM public.assignments 
            WHERE class_id = $1 AND session_id = $2;
        """
        assignment = await db.execute_single(query_assign, data.class_id, data.session_id)
        
        if not assignment:
            raise ValueError("Assignment not found for this class and session.")

        # B. Parse JSON answers from DB
        # Asyncpg might return JSONB as a String or a List depending on configuration
        db_answers_raw = assignment.get('answers')
        db_answers_list = []

        if db_answers_raw:
            if isinstance(db_answers_raw, str):
                try:
                    db_answers_list = json.loads(db_answers_raw)
                except json.JSONDecodeError:
                    db_answers_list = [] # Handle corrupt JSON gracefully
            elif isinstance(db_answers_raw, list):
                db_answers_list = db_answers_raw
        
        # C. Calculate Scores
        score = 0.0
        max_score = 0.0

        # Only calculate if there are answers (i.e., it's a Quiz, not Homework)
        if db_answers_list:
            current_choices = data.choices if data.choices else []
            score, max_score = SubmissionController.calculate_grading(current_choices, db_answers_list)
        
        # D. Insert into Database
        # We insert score, max_score and the raw choices
        query_insert = """
            INSERT INTO public.submission (class_id, session_id, mentee_id, choices, score, max_score, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, class_id, session_id, mentee_id, choices, score, max_score, created_at;
        """
        
        return await db.execute_single(
            query_insert,
            data.class_id,
            data.session_id,
            mentee_id,
            data.choices, # asyncpg converts Python List -> Postgres Array/JSON automatically
            score,
            max_score,
            datetime.now()
        )

    # =================================================================
    # 2. READ SUBMISSION (Single)
    # =================================================================
    @staticmethod
    async def get_submission_by_id(submission_id: int) -> Optional[Dict[str, Any]]:
        query = "SELECT * FROM public.submission WHERE id = $1;"
        return await db.execute_single(query, submission_id)

    # =================================================================
    # 3. READ SUBMISSIONS (History/List)
    # =================================================================
    @staticmethod
    async def get_submissions_by_session(class_id: int, session_id: int, mentee_id: Optional[UUID] = None) -> List[Dict[str, Any]]:
        """
        Get submissions for a specific session.
        - If mentee_id is provided: Returns history for that specific student.
        - If mentee_id is None: Returns all submissions for that class session (for Tutors).
        """
        if mentee_id:
            query = """
                SELECT * FROM public.submission 
                WHERE class_id = $1 AND session_id = $2 AND mentee_id = $3
                ORDER BY created_at DESC;
            """
            return await db.execute_query(query, class_id, session_id, mentee_id)
        else:
            query = """
                SELECT * FROM public.submission 
                WHERE class_id = $1 AND session_id = $2
                ORDER BY created_at DESC;
            """
            return await db.execute_query(query, class_id, session_id)