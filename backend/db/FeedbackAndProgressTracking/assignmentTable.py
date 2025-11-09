# db/assignmentTable.py
from db.database import db as sql
import json

# optional alias
fetch_one = sql.execute_single
fetch_all = sql.execute_query
execute = sql.execute_command

# --- ENUM Type Definition (NEW) ---
ASSIGNMENT_TYPES = ('homework', 'quiz')

async def init_assignment_table():
    # 1. Create the ENUM type first if it doesn't exist
    await execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assignment_type') THEN CREATE TYPE assignment_type AS ENUM ('homework', 'quiz'); END IF; END $$;")
    
    query = """
    CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        session_id INT NOT NULL,
        -- 2. Use the new ENUM type instead of TEXT/CHECK
        type assignment_type NOT NULL, 
        title TEXT NOT NULL,
        description TEXT,
        due_date TIMESTAMP NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        questions JSONB,
        answers TEXT[]
    );
    """
    await execute(query)
    # NOTE: You must also run the SQL commands from the previous answer 
    # (CREATE TYPE, ALTER TABLE) to migrate existing data before running this new schema.


# Helper function to deserialize JSONB data after fetching
def process_assignment_row(row):
    """Parses JSONB column data and converts the row tuple/dict to a dictionary."""
    if row is None:
        return None
        
    # Assuming row is a dictionary or an object that behaves like one. 
    # If it's a tuple, you'd need to map columns manually. 
    # Assuming your fetch functions return a dictionary:
    
    # Check if 'questions' is a string (due to raw driver output) and needs parsing
    if isinstance(row.get('questions'), str):
        try:
            row['questions'] = json.loads(row['questions'])
        except (json.JSONDecodeError, TypeError):
            # Handle case where it might be NULL or malformed
            row['questions'] = None
    
    return row


# 🟢 CREATE
async def insert_assignment(session_id: int, type_: str, title: str, description: str, due_date, questions: list[dict] = None, answers: list[str] = None):
    query = """
        INSERT INTO assignments (session_id, type, title, description, due_date, questions, answers)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    """
    # NO CHANGE HERE: json.dumps() is correct for inserting Python object into JSONB column.
    questions_json = json.dumps(questions) if questions is not None else None
    
    result = await fetch_one(query, session_id, type_, title, description, due_date, questions_json, answers)
    return process_assignment_row(result) # Apply deserialization on return


# 🔵 READ
async def select_assignment_by_id(assignment_id: int):
    query = "SELECT * FROM assignments WHERE id = $1;"
    result = await fetch_one(query, assignment_id)
    return process_assignment_row(result) # Apply deserialization


async def select_assignments_by_session(session_id: int):
    query = "SELECT * FROM assignments WHERE session_id = $1;"
    results = await fetch_all(query, session_id)
    
    # Iterate and deserialize for all rows
    return [process_assignment_row(row) for row in results] if results else []


# 🟠 UPDATE
async def update_assignment(assignment_id: int, title: str, description: str, due_date, questions: list[dict], answers: list[str]):
    query = """
        UPDATE assignments
        SET title = $1,
            description = $2,
            due_date = $3,
            questions = $4,
            timestamp = NOW(),
            answers = $5
        WHERE id = $6
        RETURNING *;
    """
    # NO CHANGE HERE: json.dumps() is correct for updating JSONB column.
    questions_json = json.dumps(questions) if questions is not None else None
    
    result = await fetch_one(query, title, description, due_date, questions_json, answers, assignment_id)
    return process_assignment_row(result) # Apply deserialization on return


# 🔴 DELETE
async def delete_assignment(assignment_id: int):
    await execute("DELETE FROM assignments WHERE id = $1;", assignment_id)