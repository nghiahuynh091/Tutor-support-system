# db/feedbackTable.py
from db.database import db as sql

# optional alias
fetch_one = sql.execute_single
fetch_all = sql.execute_query
execute = sql.execute_command

async def init_feedback_table():
    query = """
    CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        session_id INT NOT NULL,
        mentee_id INT NOT NULL,
        rating INT CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        timestamp TIMESTAMP DEFAULT NOW()
    );
    """
    await execute(query)


# 🟢 CREATE
async def insert_feedback(session_id: int, mentee_id: int, rating: int, comment: str = None):
    query = """
        INSERT INTO feedback (session_id, mentee_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    """
    return await fetch_one(query, session_id, mentee_id, rating, comment)


# 🔵 READ
async def select_feedback_by_id(feedback_id: int):
    query = "SELECT * FROM feedback WHERE id = $1;"
    return await fetch_one(query, feedback_id)


async def select_feedback_by_session(session_id: int):
    query = "SELECT * FROM feedback WHERE session_id = $1;"
    return await fetch_all(query, session_id)


async def select_feedback_by_mentee(mentee_id: int):
    query = "SELECT * FROM feedback WHERE mentee_id = $1;"
    return await fetch_all(query, mentee_id)


# 🟠 UPDATE
async def update_feedback(feedback_id: int, rating: int, comment: str):
    query = """
        UPDATE feedback
        SET rating = $1,
            comment = $2,
            timestamp = NOW()
        WHERE id = $3
        RETURNING *;
    """
    return await fetch_one(query, rating, comment, feedback_id)


# 🔴 DELETE
async def delete_feedback(feedback_id: int):
    await execute("DELETE FROM feedback WHERE id = $1;", feedback_id)
