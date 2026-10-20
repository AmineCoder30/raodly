import type * as SQLite from "expo-sqlite";

type TableInfoRow = { name: string };

const LEARNING_SCHEMA = `
  CREATE TABLE IF NOT EXISTS roadmaps (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    language TEXT NOT NULL,
    created_by TEXT,
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS roadmap_topics (
    id TEXT PRIMARY KEY NOT NULL,
    roadmap_id TEXT NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    estimated_minutes INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS user_roadmaps (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    roadmap_id TEXT NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    started_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (user_id, roadmap_id)
  );

  CREATE TABLE IF NOT EXISTS topic_progress (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    topic_id TEXT NOT NULL REFERENCES roadmap_topics(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('locked', 'active', 'completed')),
    completed_at TEXT,
    updated_at TEXT NOT NULL,
    quiz_answer INTEGER,
    quiz_correct INTEGER NOT NULL DEFAULT 0 CHECK (quiz_correct IN (0, 1)),
    UNIQUE (user_id, topic_id)
  );

  CREATE INDEX IF NOT EXISTS idx_roadmaps_visibility_updated
    ON roadmaps (visibility, updated_at);
  CREATE INDEX IF NOT EXISTS idx_roadmaps_category
    ON roadmaps (category);
  CREATE INDEX IF NOT EXISTS idx_roadmap_topics_roadmap_order
    ON roadmap_topics (roadmap_id, order_index);
  CREATE INDEX IF NOT EXISTS idx_user_roadmaps_user
    ON user_roadmaps (user_id, updated_at);
  CREATE INDEX IF NOT EXISTS idx_topic_progress_user_status
    ON topic_progress (user_id, status, updated_at);
`;

export async function migrateLearningSchema(
  db: SQLite.SQLiteDatabase,
): Promise<void> {
  const existingProgressColumns = await db.getAllAsync<TableInfoRow>(
    "PRAGMA table_info(topic_progress)",
  );
  const hasLegacyProgress =
    existingProgressColumns.length > 0 &&
    !existingProgressColumns.some((column) => column.name === "user_id");

  if (hasLegacyProgress) {
    await db.execAsync(
      "ALTER TABLE topic_progress RENAME TO topic_progress_legacy_v1;",
    );
  }

  await db.execAsync(LEARNING_SCHEMA);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS legacy_topic_progress (
      topic_id TEXT PRIMARY KEY NOT NULL,
      completed INTEGER NOT NULL,
      quiz_answer INTEGER,
      quiz_correct INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  if (hasLegacyProgress) {
    await db.execAsync(`
      INSERT OR REPLACE INTO legacy_topic_progress
        (topic_id, completed, quiz_answer, quiz_correct, updated_at)
      SELECT topic_id, completed, quiz_answer, quiz_correct, updated_at
      FROM topic_progress_legacy_v1;
      DROP TABLE topic_progress_legacy_v1;
    `);
  }
}
