import type * as SQLite from "expo-sqlite";

type RoadmapIdRow = { id: string };
type ColumnRow = { name: string };

export async function migrateSectionsAndLessons(
  db: SQLite.SQLiteDatabase,
): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS roadmap_sections (
      id TEXT PRIMARY KEY NOT NULL,
      roadmap_id TEXT NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_roadmap_sections_roadmap_order
      ON roadmap_sections (roadmap_id, order_index);

  `);

  const columns = await db.getAllAsync<ColumnRow>(
    "PRAGMA table_info(roadmap_topics)",
  );
  if (columns.some((column) => column.name === "section_id")) return;

  const roadmaps = await db.getAllAsync<RoadmapIdRow>(
    "SELECT id FROM roadmaps ORDER BY id ASC",
  );
  const timestamp = new Date().toISOString();

  for (const roadmap of roadmaps) {
    await db.runAsync(
      `INSERT OR IGNORE INTO roadmap_sections
        (id, roadmap_id, title, order_index, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      `migration-section-${roadmap.id}`,
      roadmap.id,
      "Imported topics",
      0,
      timestamp,
      timestamp,
    );
  }

  await db.execAsync(`
    ALTER TABLE topic_progress RENAME TO topic_progress_v1;
    ALTER TABLE roadmap_topics RENAME TO roadmap_topics_v1;

    CREATE TABLE roadmap_topics (
      id TEXT PRIMARY KEY NOT NULL,
      section_id TEXT NOT NULL REFERENCES roadmap_sections(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL,
      estimated_minutes INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    INSERT INTO roadmap_topics
      (id, section_id, title, description, order_index, estimated_minutes,
       created_at, updated_at, deleted_at)
    SELECT
      topics.id,
      'migration-section-' || topics.roadmap_id,
      topics.title,
      topics.description,
      topics.order_index,
      topics.estimated_minutes,
      topics.created_at,
      topics.updated_at,
      topics.deleted_at
    FROM roadmap_topics_v1 AS topics;

    CREATE INDEX idx_roadmap_topics_section_order
      ON roadmap_topics (section_id, order_index);

    CREATE TABLE topic_progress_new (
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

    INSERT INTO topic_progress_new
      (id, user_id, topic_id, status, completed_at, updated_at, quiz_answer, quiz_correct)
    SELECT id, user_id, topic_id, status, completed_at, updated_at, quiz_answer, quiz_correct
    FROM topic_progress_v1;

    DROP TABLE topic_progress_v1;
    DROP TABLE roadmap_topics_v1;
    ALTER TABLE topic_progress_new RENAME TO topic_progress;

    CREATE INDEX idx_topic_progress_user_status
      ON topic_progress (user_id, status, updated_at);

    CREATE TABLE IF NOT EXISTS topic_lessons (
      id TEXT PRIMARY KEY NOT NULL,
      topic_id TEXT NOT NULL REFERENCES roadmap_topics(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_topic_lessons_topic_order
      ON topic_lessons (topic_id, order_index);
  `);
}
