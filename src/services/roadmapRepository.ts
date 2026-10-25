import { getDatabase } from "@/database";
import type {
  Lesson,
  LessonMessage,
  Roadmap,
  RoadmapDifficulty,
  RoadmapTopic,
  RoadmapTopicWithLessons,
  RoadmapWithTopics,
  TopicLesson,
} from "@/types/roadmap";

export const LOCAL_USER_ID = "local-user";

// ── Row types (match SQLite column names) ────────────────────────────

type RoadmapRow = {
  id: number;
  title: string;
  description: string | null;
  progress: string;
  difficulty: RoadmapDifficulty;
  created_at: string;
};

type TopicRow = {
  id: number;
  roadmap_id: number;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
};

type TopicLessonRow = {
  id: number;
  topic_id: number;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
};

type LessonRow = {
  id: number;
  topic_lesson_id: number;
  is_completed: number;
  language: string;
  content_version: string;
  lesson_json: string;
  quiz_answer: number | null;
  quiz_correct: number;
  updated_at: number;
};

type LessonMessageRow = {
  id: number;
  lesson_id: number;
  question: string;
  answer_json: string;
  created_at: string;
};

// ── Mappers ──────────────────────────────────────────────────────────

function mapRoadmap(row: RoadmapRow): Roadmap {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    progress: row.progress,
    difficulty: row.difficulty,
    createdAt: row.created_at,
  };
}

function mapTopic(row: TopicRow): RoadmapTopic {
  return {
    id: row.id,
    roadmapId: row.roadmap_id,
    title: row.title,
    description: row.description,
    orderIndex: row.order_index,
    createdAt: row.created_at,
  };
}

function mapTopicLesson(row: TopicLessonRow): TopicLesson {
  return {
    id: row.id,
    topicId: row.topic_id,
    title: row.title,
    description: row.description,
    orderIndex: row.order_index,
    createdAt: row.created_at,
  };
}

function mapLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    topicLessonId: row.topic_lesson_id,
    isCompleted: row.is_completed === 1,
    language: row.language,
    contentVersion: row.content_version,
    lessonJson: row.lesson_json,
    quizAnswer: row.quiz_answer,
    quizCorrect: row.quiz_correct === 1,
    updatedAt: row.updated_at,
  };
}

function mapLessonMessage(row: LessonMessageRow): LessonMessage {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    question: row.question,
    answerJson: row.answer_json,
    createdAt: row.created_at,
  };
}

// ── Validators ───────────────────────────────────────────────────────

function assertDifficulty(value: string): asserts value is RoadmapDifficulty {
  if (!["beginner", "intermediate", "advanced"].includes(value)) {
    throw new Error(`Invalid roadmap difficulty: ${value}`);
  }
}

// ── Input types ──────────────────────────────────────────────────────

export type UpsertRoadmapInput = {
  id?: number;
  title: string;
  description?: string | null;
  progress?: string;
  difficulty: RoadmapDifficulty;
};

export type UpsertTopicInput = {
  id?: number;
  roadmapId: number;
  title: string;
  description?: string | null;
  orderIndex: number;
};

export type UpsertTopicLessonInput = {
  id?: number;
  topicId: number;
  title: string;
  description?: string | null;
  orderIndex: number;
};

// ═══════════════════════════════════════════════════════════════════════
// ROADMAPS
// ═══════════════════════════════════════════════════════════════════════

export async function upsertRoadmap(input: UpsertRoadmapInput): Promise<number> {
  assertDifficulty(input.difficulty);
  const db = await getDatabase();

  if (input.id != null) {
    const existing = await db.getFirstAsync<{ id: number; progress: string }>(
      "SELECT id, progress FROM roadmaps WHERE id = ?",
      input.id,
    );
    if (existing) {
      await db.runAsync(
        `UPDATE roadmaps
         SET title = ?, description = ?, progress = ?, difficulty = ?
         WHERE id = ?`,
        input.title,
        input.description ?? null,
        input.progress ?? existing.progress,
        input.difficulty,
        input.id,
      );
      return input.id;
    }

    await db.runAsync(
      `INSERT INTO roadmaps (id, title, description, progress, difficulty)
       VALUES (?, ?, ?, ?, ?)`,
      input.id,
      input.title,
      input.description ?? null,
      input.progress ?? "0%",
      input.difficulty,
    );
    return input.id;
  }

  const result = await db.runAsync(
    `INSERT INTO roadmaps (title, description, progress, difficulty)
     VALUES (?, ?, ?, ?)`,
    input.title,
    input.description ?? null,
    input.progress ?? "0%",
    input.difficulty,
  );
  return result.lastInsertRowId;
}

export async function getRoadmap(id: number): Promise<Roadmap | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RoadmapRow>(
    "SELECT * FROM roadmaps WHERE id = ?",
    id,
  );
  return row ? mapRoadmap(row) : null;
}

export async function listRoadmaps(): Promise<Roadmap[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RoadmapRow>(
    "SELECT * FROM roadmaps ORDER BY created_at DESC",
  );
  return rows.map(mapRoadmap);
}

// ═══════════════════════════════════════════════════════════════════════
// ROADMAP TOPICS
// ═══════════════════════════════════════════════════════════════════════

export async function upsertTopic(input: UpsertTopicInput): Promise<number> {
  const db = await getDatabase();

  if (input.id != null) {
    const existing = await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM roadmap_topics WHERE id = ?",
      input.id,
    );
    if (existing) {
      await db.runAsync(
        `UPDATE roadmap_topics
         SET roadmap_id = ?, title = ?, description = ?, order_index = ?
         WHERE id = ?`,
        input.roadmapId,
        input.title,
        input.description ?? null,
        input.orderIndex,
        input.id,
      );
      return input.id;
    }

    await db.runAsync(
      `INSERT INTO roadmap_topics (id, roadmap_id, title, description, order_index)
       VALUES (?, ?, ?, ?, ?)`,
      input.id,
      input.roadmapId,
      input.title,
      input.description ?? null,
      input.orderIndex,
    );
    return input.id;
  }

  const result = await db.runAsync(
    `INSERT INTO roadmap_topics (roadmap_id, title, description, order_index)
     VALUES (?, ?, ?, ?)`,
    input.roadmapId,
    input.title,
    input.description ?? null,
    input.orderIndex,
  );
  return result.lastInsertRowId;
}

export async function getTopicsByRoadmap(roadmapId: number): Promise<RoadmapTopic[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TopicRow>(
    `SELECT * FROM roadmap_topics
     WHERE roadmap_id = ?
     ORDER BY order_index ASC, id ASC`,
    roadmapId,
  );
  return rows.map(mapTopic);
}

// ═══════════════════════════════════════════════════════════════════════
// TOPIC LESSONS (sub-lesson outlines)
// ═══════════════════════════════════════════════════════════════════════

export async function upsertTopicLesson(
  input: UpsertTopicLessonInput,
): Promise<number> {
  const db = await getDatabase();

  if (input.id != null) {
    const existing = await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM topic_lessons WHERE id = ?",
      input.id,
    );
    if (existing) {
      await db.runAsync(
        `UPDATE topic_lessons
         SET topic_id = ?, title = ?, description = ?, order_index = ?
         WHERE id = ?`,
        input.topicId,
        input.title,
        input.description ?? null,
        input.orderIndex,
        input.id,
      );
      return input.id;
    }

    await db.runAsync(
      `INSERT INTO topic_lessons (id, topic_id, title, description, order_index)
       VALUES (?, ?, ?, ?, ?)`,
      input.id,
      input.topicId,
      input.title,
      input.description ?? null,
      input.orderIndex,
    );
    return input.id;
  }

  const result = await db.runAsync(
    `INSERT INTO topic_lessons (topic_id, title, description, order_index)
     VALUES (?, ?, ?, ?)`,
    input.topicId,
    input.title,
    input.description ?? null,
    input.orderIndex,
  );
  return result.lastInsertRowId;
}

export async function getTopicLessons(topicId: number): Promise<TopicLesson[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TopicLessonRow>(
    `SELECT * FROM topic_lessons
     WHERE topic_id = ?
     ORDER BY order_index ASC, id ASC`,
    topicId,
  );
  return rows.map(mapTopicLesson);
}

// ═══════════════════════════════════════════════════════════════════════
// LESSON (content + progress for a topic_lesson)
// ═══════════════════════════════════════════════════════════════════════

export async function upsertLesson(
  topicLessonId: number,
  lessonJson: string,
  language = "ar",
  contentVersion = "lesson-v1-ar",
  updatedAt = Date.now(),
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO lesson (topic_lesson_id, lesson_json, language, content_version, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(topic_lesson_id) DO UPDATE SET
       lesson_json = excluded.lesson_json,
       language = excluded.language,
       content_version = excluded.content_version,
       updated_at = excluded.updated_at`,
    topicLessonId,
    lessonJson,
    language,
    contentVersion,
    updatedAt,
  );
  return result.lastInsertRowId;
}

export async function getLesson(topicLessonId: number): Promise<Lesson | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<LessonRow>(
    "SELECT * FROM lesson WHERE topic_lesson_id = ?",
    topicLessonId,
  );
  return row ? mapLesson(row) : null;
}

export async function updateLessonProgress(
  topicLessonId: number,
  isCompleted: boolean,
  quizAnswer: number | null = null,
  quizCorrect = false,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE lesson
     SET is_completed = ?, quiz_answer = ?, quiz_correct = ?, updated_at = ?
     WHERE topic_lesson_id = ?`,
    isCompleted ? 1 : 0,
    quizAnswer,
    quizCorrect ? 1 : 0,
    Date.now(),
    topicLessonId,
  );
}

/** Compatibility helper for callers or tests expecting updateTopicProgress */
export async function updateTopicProgress(
  _userId: string,
  topicLessonId: number | string,
  status: string,
  quizAnswer: number | null = null,
  quizCorrect = false,
): Promise<void> {
  const rawId =
    typeof topicLessonId === "number"
      ? topicLessonId
      : parseInt(String(topicLessonId).replace(/\D/g, ""), 10) || 1;
  await updateLessonProgress(
    rawId,
    status === "completed",
    quizAnswer,
    quizCorrect,
  );
}

// ═══════════════════════════════════════════════════════════════════════
// LESSON MESSAGES (follow-up Q&A)
// ═══════════════════════════════════════════════════════════════════════

export async function addLessonMessage(
  lessonId: number,
  question: string,
  answerJson: string,
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO lesson_messages (lesson_id, question, answer_json)
     VALUES (?, ?, ?)`,
    lessonId,
    question,
    answerJson,
  );
  return result.lastInsertRowId;
}

export async function getLessonMessages(
  lessonId: number,
): Promise<LessonMessage[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<LessonMessageRow>(
    `SELECT * FROM lesson_messages
     WHERE lesson_id = ?
     ORDER BY created_at ASC`,
    lessonId,
  );
  return rows.map(mapLessonMessage);
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSITE QUERIES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Load a roadmap with all its topics, each topic's lessons, and their
 * completion status from the `lesson` table.
 */
export async function getRoadmapWithTopics(
  roadmapId: number,
): Promise<RoadmapWithTopics | null> {
  const roadmap = await getRoadmap(roadmapId);
  if (!roadmap) return null;

  const db = await getDatabase();

  const topicRows = await db.getAllAsync<TopicRow>(
    `SELECT * FROM roadmap_topics
     WHERE roadmap_id = ?
     ORDER BY order_index ASC, id ASC`,
    roadmapId,
  );

  const topics: RoadmapTopicWithLessons[] = [];

  for (const topicRow of topicRows) {
    const topic = mapTopic(topicRow);

    const lessonRows = await db.getAllAsync<
      TopicLessonRow & { is_completed: number | null }
    >(
      `SELECT tl.*, l.is_completed
       FROM topic_lessons tl
       LEFT JOIN lesson l ON l.topic_lesson_id = tl.id
       WHERE tl.topic_id = ?
       ORDER BY tl.order_index ASC, tl.id ASC`,
      topic.id,
    );

    topics.push({
      ...topic,
      lessons: lessonRows.map((row) => ({
        ...mapTopicLesson(row),
        completed: row.is_completed === 1,
      })),
    });
  }

  return { ...roadmap, topics };
}
