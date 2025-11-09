# db/submissionTable.py
from db.database import db as sql
# optional alias
fetch_one = sql.execute_single
fetch_all = sql.execute_query
execute = sql.execute_command

async def init_submission_table():
    query = """
    CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        session_id INT NOT NULL,
        mentee_id INT NOT NULL,
        quiz_id INT NOT NULL,
        chosen_options TEXT[] NOT NULL,
        score FLOAT CHECK (score >= 0 AND score <= 100),
        timestamp TIMESTAMP DEFAULT NOW()
    );
    """
    await execute(query)


# 🟢 CREATE
async def insert_submission(session_id: int, mentee_id: int, quiz_id: int, chosen_options: list, score: float):
    query = """
        INSERT INTO submissions (session_id, mentee_id, quiz_id, chosen_options, score)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    """
    return await fetch_one(query, session_id, mentee_id, quiz_id, chosen_options, score)


# 🔵 READ
async def select_submission_by_id(submission_id: int):
    query = "SELECT * FROM submissions WHERE id = $1;"
    return await fetch_one(query, submission_id)


async def select_submissions_by_session(session_id: int, mentee_id: int):
    query = "SELECT * FROM submissions WHERE session_id = $1 AND mentee_id = $2;"
    return await fetch_all(query, session_id, mentee_id)

# 🔴 DELETE
async def delete_submission(submission_id: int):
    await execute("DELETE FROM submissions WHERE id = $1;", submission_id)
