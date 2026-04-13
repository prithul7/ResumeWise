import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'resumewise.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()

    # Users table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            name      TEXT    NOT NULL,
            email     TEXT    NOT NULL UNIQUE,
            password  TEXT    NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Resume analyses table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS resume_analyses (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL,
            resume_text TEXT    NOT NULL,
            result_json TEXT    NOT NULL,
            score       INTEGER,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    # Cover letters table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS cover_letters (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id      INTEGER NOT NULL,
            resume_text  TEXT    NOT NULL,
            job_title    TEXT,
            company      TEXT,
            letter_text  TEXT    NOT NULL,
            created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    conn.commit()
    conn.close()
    print("Database initialised at", DB_PATH)
