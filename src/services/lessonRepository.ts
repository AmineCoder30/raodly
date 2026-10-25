import { getDatabase } from "@/database";
import type { GeneratedLesson } from "@/types/lesson";

const CONTENT_VERSION = "lesson-v1-ar";

/**
 * Resolves or creates a topic_lesson record for any topic reference
 * (numeric ID or string key from static constants/UI navigation).
 */
export async function getOrCreateTopicLessonId(
  topicRef: string | number,
  title?: string,
): Promise<number> {
  const db = await getDatabase();
  const rawNum =
    typeof topicRef === "number"
      ? topicRef
      : parseInt(topicRef.replace(/\D/g, ""), 10);

  // If a valid positive number, check if topic_lessons row exists with this ID
  if (!isNaN(rawNum) && rawNum > 0) {
    const existing = await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM topic_lessons WHERE id = ?",
      rawNum,
    );
    if (existing) return existing.id;
  }

  // Check by title or string reference match
  const stringRef = String(topicRef);
  const byTitle = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM topic_lessons WHERE title = ? LIMIT 1",
    stringRef,
  );
  if (byTitle) return byTitle.id;

  // Ensure default parent roadmap and topic exist so foreign key constraints are met
  await db.runAsync(
    `INSERT OR IGNORE INTO roadmaps (id, title, description, progress, difficulty)
     VALUES (1, 'مسار افتراضي', 'مسار تعليمي عام', '0%', 'beginner')`,
  );
  await db.runAsync(
    `INSERT OR IGNORE INTO roadmap_topics (id, roadmap_id, title, description, order_index)
     VALUES (1, 1, 'المواضيع العامة', NULL, 1)`,
  );

  // If we had a positive numeric ID, keep that explicit ID
  if (!isNaN(rawNum) && rawNum > 0) {
    await db.runAsync(
      `INSERT OR IGNORE INTO topic_lessons (id, topic_id, title, description, order_index)
       VALUES (?, 1, ?, NULL, ?)`,
      rawNum,
      title ?? stringRef,
      rawNum,
    );
    return rawNum;
  }

  const result = await db.runAsync(
    `INSERT INTO topic_lessons (topic_id, title, description, order_index)
     VALUES (1, ?, NULL, 1)`,
    title ?? stringRef,
  );
  return result.lastInsertRowId;
}

export async function getCachedLesson(
  topicRef: string | number,
  language = "ar",
  contentVersion?: string,
): Promise<GeneratedLesson | null> {
  const db = await getDatabase();
  const topicLessonId = await getOrCreateTopicLessonId(topicRef);
  const row = contentVersion
    ? await db.getFirstAsync<{ lesson_json: string }>(
        "SELECT lesson_json FROM lesson WHERE topic_lesson_id = ? AND language = ? AND content_version = ?",
        topicLessonId,
        language,
        contentVersion,
      )
    : await db.getFirstAsync<{ lesson_json: string }>(
        "SELECT lesson_json FROM lesson WHERE topic_lesson_id = ? AND language = ? ORDER BY updated_at DESC LIMIT 1",
        topicLessonId,
        language,
      );
  return row ? (JSON.parse(row.lesson_json) as GeneratedLesson) : null;
}

export async function saveLesson(
  topicRef: string | number,
  language: string,
  lesson: GeneratedLesson,
  contentVersion = CONTENT_VERSION,
  updatedAt = Date.now(),
): Promise<void> {
  const db = await getDatabase();
  const topicLessonId = await getOrCreateTopicLessonId(topicRef);
  await db.runAsync(
    `INSERT INTO lesson (topic_lesson_id, language, content_version, lesson_json, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(topic_lesson_id) DO UPDATE SET
       lesson_json = excluded.lesson_json,
       language = excluded.language,
       content_version = excluded.content_version,
       updated_at = excluded.updated_at`,
    topicLessonId,
    language,
    contentVersion,
    JSON.stringify(lesson),
    updatedAt,
  );
}

export async function saveTopicProgress(
  topicRef: string | number,
  completed: boolean,
  quizAnswer: number | null,
  quizCorrect: boolean,
): Promise<void> {
  const db = await getDatabase();
  const topicLessonId = await getOrCreateTopicLessonId(topicRef);
  await db.runAsync(
    `INSERT INTO lesson (topic_lesson_id, language, content_version, lesson_json, is_completed, quiz_answer, quiz_correct, updated_at)
     VALUES (?, 'ar', ?, '{}', ?, ?, ?, ?)
     ON CONFLICT(topic_lesson_id) DO UPDATE SET
       is_completed = excluded.is_completed,
       quiz_answer = excluded.quiz_answer,
       quiz_correct = excluded.quiz_correct,
       updated_at = excluded.updated_at`,
    topicLessonId,
    CONTENT_VERSION,
    completed ? 1 : 0,
    quizAnswer,
    quizCorrect ? 1 : 0,
    Date.now(),
  );
}

export async function getTopicProgress(topicRef: string | number) {
  const db = await getDatabase();
  const topicLessonId = await getOrCreateTopicLessonId(topicRef);
  const row = await db.getFirstAsync<{
    is_completed: number;
    quiz_answer: number | null;
    quiz_correct: number;
  }>(
    "SELECT is_completed, quiz_answer, quiz_correct FROM lesson WHERE topic_lesson_id = ?",
    topicLessonId,
  );
  if (!row) return null;
  return {
    completed: row.is_completed === 1 ? 1 : 0,
    quiz_answer: row.quiz_answer,
    quiz_correct: row.quiz_correct,
  };
}

export async function saveLessonMessage(
  topicRef: string | number,
  question: string,
  answer: string,
): Promise<number | null> {
  const db = await getDatabase();
  const topicLessonId = await getOrCreateTopicLessonId(topicRef);
  const lesson = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM lesson WHERE topic_lesson_id = ?",
    topicLessonId,
  );
  if (!lesson) return null;

  const result = await db.runAsync(
    `INSERT INTO lesson_messages (lesson_id, question, answer_json)
     VALUES (?, ?, ?)`,
    lesson.id,
    question,
    JSON.stringify({ answer }),
  );
  return result.lastInsertRowId;
}

export async function getLessonMessages(topicRef: string | number) {
  const db = await getDatabase();
  const topicLessonId = await getOrCreateTopicLessonId(topicRef);
  return db.getAllAsync<{
    id: number;
    question: string;
    answer_json: string;
    created_at: string;
  }>(
    `SELECT lm.id, lm.question, lm.answer_json, lm.created_at
     FROM lesson_messages lm
     INNER JOIN lesson l ON l.id = lm.lesson_id
     WHERE l.topic_lesson_id = ?
     ORDER BY lm.created_at ASC`,
    topicLessonId,
  );
}
