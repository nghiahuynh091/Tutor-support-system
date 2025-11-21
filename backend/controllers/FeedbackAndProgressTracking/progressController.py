from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
import asyncpg # Used for error handling

from models.FeedbackAndProgressTracking.progressModel import ProgressRecordCreate, ProgressScoreCreate, ProgressScoreUpdate
from db.database import db 

class ProgressController:
    # ----------------------------------------------------
    # PROGRESS RECORDS (HEADER/MASTER)
    # ----------------------------------------------------
    @staticmethod
    async def create_record(tutor_id: UUID, record: ProgressRecordCreate) -> Optional[Dict[str, Any]]:
        """
        Create progress_records.
        - tutor_id: Passed from Auth (JWT)
        - progress_date: Sets to NOW()
        """
        query = """
            INSERT INTO public.progress_records (tutor_id, class_id, title, progress_date)
            VALUES ($1, $2, $3, $4)
            RETURNING id, tutor_id, class_id, title, progress_date;
        """
        return await db.execute_single(
            query, 
            tutor_id,           # $1
            record.class_id,    # $2
            record.title,       # $3
            datetime.now()      # $4 (Sets progress_date to now)
        )

    @staticmethod
    async def get_records_by_class(class_id: int) -> List[Dict[str, Any]]:
        query = "SELECT * FROM public.progress_records WHERE class_id = $1 ORDER BY progress_date DESC;"
        return await db.execute_query(query, class_id)


    # ----------------------------------------------------
    # PROGRESS (DETAIL/SCORE)
    # ----------------------------------------------------
    @staticmethod
    async def create_score(report_id: int, score: ProgressScoreCreate) -> Optional[Dict[str, Any]]:
        """
        Create progress detail.
        - report_id: From URL
        - created_at: Sets to NOW()
        """
        query = """
            INSERT INTO public.progress (report_id, mentee_id, points, comments, created_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        """
        try:
            return await db.execute_single(
                query,
                report_id,          # $1
                score.mentee_id,    # $2
                score.points,       # $3
                score.comments,     # $4
                datetime.now()      # $5 (Sets created_at to now)
            )
        except asyncpg.ForeignKeyViolationError:
             raise ValueError("Invalid report_id, mentee_id, or other foreign key dependency.")

    @staticmethod
    async def get_scores_by_record_id(report_id: int) -> List[Dict[str, Any]]:
        query = "SELECT * FROM public.progress WHERE report_id = $1 ORDER BY mentee_id;"
        return await db.execute_query(query, report_id)
    
    # ----------------------------------------------------
    # NEW: UPDATE PROGRESS (DETAIL/SCORE)
    # ----------------------------------------------------
    @staticmethod
    async def update_score(score_id: int, score_update: ProgressScoreUpdate) -> Optional[Dict[str, Any]]:
        """Updates a single progress score line item by ID."""
        
        # Prepare dynamic set clauses
        updates = []
        values = []
        param_counter = 1

        if score_update.points is not None:
            updates.append(f"points = ${param_counter}")
            values.append(score_update.points)
            param_counter += 1
        
        if score_update.comments is not None:
            updates.append(f"comments = ${param_counter}")
            values.append(score_update.comments)
            param_counter += 1

        if not updates:
            # Nothing to update, return the existing record or None
            return None 

        set_clause = ", ".join(updates)
        
        # Add score_id to values list for the WHERE clause
        values.append(score_id)
        id_param = param_counter
        
        query = f"""
            UPDATE public.progress 
            SET {set_clause}
            WHERE id = ${id_param}
            RETURNING *;
        """
        
        try:
            return await db.execute_single(query, *values)
        except Exception as e:
            # Handle potential DB errors (like missing ID)
            print(f"Update error: {e}")
            return None