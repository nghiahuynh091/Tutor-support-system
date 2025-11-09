# db/progressTable.py
from db.database import db as sql

# optional alias
fetch_one = sql.execute_single
fetch_all = sql.execute_query
execute = sql.execute_command

async def init_progress_table():
    query = """
    CREATE TABLE IF NOT EXISTS progress (
        id SERIAL PRIMARY KEY,
        session_id INT NOT NULL,
        mentee_id INT NOT NULL,
        progress FLOAT CHECK (progress >= 0 AND progress <= 100),
        private_notes TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );
    """
    await execute(query)


# 🟢 CREATE
async def insert_progress(session_id: int, mentee_id: int, progress: float = 0.0):
    query = """
        INSERT INTO progress (session_id, mentee_id, progress)
        VALUES ($1, $2, $3)
        RETURNING *;
    """
    return await fetch_one(query, session_id, mentee_id, progress)


# 🔵 READ
async def select_progress_by_student(student_id: int):
    query = "SELECT * FROM progress WHERE mentee_id = $1;"
    return await fetch_all(query, student_id)


async def select_progress(progress_id: int):
    query = "SELECT * FROM progress WHERE id = $1;"
    return await fetch_one(query, progress_id)


# 🟠 UPDATE
async def update_progress(progress_id: int, progress: float, private_notes: list):
    query = """
        UPDATE progress
        SET progress = $1,
            private_notes = $2,
            updated_at = NOW()
        WHERE id = $3
        RETURNING *;
    """
    return await fetch_one(query, progress, private_notes, progress_id)


# 🔴 DELETE (nếu cần)
async def delete_progress(progress_id: int):
    await execute("DELETE FROM progress WHERE id = $1;", progress_id)
