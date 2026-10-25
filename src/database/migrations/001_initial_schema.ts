import type * as SQLite from "expo-sqlite";

/**
 * Migration 001 – Clean schema based on the new architecture.
 *
 * Tables:
 *   1. roadmaps
 *   2. roadmap_topics
 *   3. topic_lessons
 *   4. lesson
 *   5. lesson_messages
 */

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS roadmaps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    progress TEXT DEFAULT '0%',
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS roadmap_topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roadmap_id INTEGER NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS topic_lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL REFERENCES roadmap_topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lesson (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_lesson_id INTEGER NOT NULL UNIQUE REFERENCES topic_lessons(id) ON DELETE CASCADE,
    is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
    language TEXT NOT NULL DEFAULT 'ar',
    content_version TEXT NOT NULL DEFAULT 'lesson-v1-ar',
    lesson_json TEXT NOT NULL,
    quiz_answer INTEGER,
    quiz_correct INTEGER NOT NULL DEFAULT 0 CHECK (quiz_correct IN (0, 1)),
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lesson_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER NOT NULL REFERENCES lesson(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_topics_roadmap
    ON roadmap_topics (roadmap_id, order_index);
  CREATE INDEX IF NOT EXISTS idx_lessons_topic
    ON topic_lessons (topic_id, order_index);
  CREATE INDEX IF NOT EXISTS idx_messages_lesson
    ON lesson_messages (lesson_id);
`;

export async function migrateInitialSchema(
  db: SQLite.SQLiteDatabase,
): Promise<void> {
  await db.execAsync(SCHEMA);
}
