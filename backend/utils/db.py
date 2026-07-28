"""SQLite access helpers shared by the API endpoints."""
import os
import sqlite3
from contextlib import contextmanager

DB_PATH = os.environ.get('DATABASE_PATH', 'maternal_health.db')


@contextmanager
def get_connection():
    """Yield a SQLite connection, committing on success and always closing."""
    conn = sqlite3.connect(DB_PATH)
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def execute(query, params=()):
    """Run a write statement and return the inserted row id."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        return cursor.lastrowid


def query_one(query, params=()):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        return cursor.fetchone()


def query_all(query, params=()):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        return cursor.fetchall()
