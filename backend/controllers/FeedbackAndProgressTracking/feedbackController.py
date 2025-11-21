from uuid import UUID
from typing import List, Optional
from models.FeedbackAndProgressTracking.feedbackModel import FeedbackCreate, FeedbackUpdate
# IMPORT YOUR DB INSTANCE HERE. Assuming the file provided is named 'database.py'
from db.database import db

class FeedbackController:
    
    @staticmethod
    async def get_feedback(mentee_id: UUID, class_id: int, session_id: int):
        query = """
            SELECT mentee_id, class_id, session_id, rating_scale, comments, created_at
            FROM public.feedback
            WHERE mentee_id = $1 AND class_id = $2 AND session_id = $3;
        """
        return await db.execute_single(query, mentee_id, class_id, session_id)

    @staticmethod
    async def get_feedbacks_by_class(class_id: int):
        query = """
            SELECT mentee_id, class_id, session_id, rating_scale, comments, created_at
            FROM public.feedback
            WHERE class_id = $1
            ORDER BY created_at DESC;
        """
        return await db.execute_query(query, class_id)

    @staticmethod
    async def create_feedback(feedback: FeedbackCreate):
        query = """
            INSERT INTO public.feedback (mentee_id, class_id, session_id, rating_scale, comments)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        """
        # asyncpg executes this and returns the inserted row
        result = await db.execute_single(
            query, 
            feedback.mentee_id, 
            feedback.class_id, 
            feedback.session_id, 
            feedback.rating_scale, 
            feedback.comments
        )
        return result

    @staticmethod
    async def update_feedback(mentee_id: UUID, class_id: int, session_id: int, feedback: FeedbackUpdate):
        # Dynamic Query Construction to only update fields that are not None
        set_clauses = []
        values = []
        counter = 1

        if feedback.rating_scale is not None:
            set_clauses.append(f"rating_scale = ${counter}")
            values.append(feedback.rating_scale)
            counter += 1
        
        if feedback.comments is not None:
            set_clauses.append(f"comments = ${counter}")
            values.append(feedback.comments)
            counter += 1

        if not set_clauses:
            # Nothing to update, return existing record
            return await FeedbackController.get_feedback(mentee_id, class_id, session_id)

        # Add WHERE clause parameters
        values.extend([mentee_id, class_id, session_id])
        
        query = f"""
            UPDATE public.feedback
            SET {", ".join(set_clauses)}
            WHERE mentee_id = ${counter} AND class_id = ${counter + 1} AND session_id = ${counter + 2}
            RETURNING *;
        """

        return await db.execute_single(query, *values)

    @staticmethod
    async def delete_feedback(mentee_id: UUID, class_id: int, session_id: int):
        query = """
            DELETE FROM public.feedback
            WHERE mentee_id = $1 AND class_id = $2 AND session_id = $3;
        """
        # execute_command returns a string like "DELETE 1"
        result = await db.execute_command(query, mentee_id, class_id, session_id)
        return result