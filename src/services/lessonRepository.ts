import { getDatabase } from "@/database";
import {
  getTopicProgress as getStoredTopicProgress,
  LOCAL_USER_ID,
  updateTopicProgress,
} from "@/services/roadmapRepository";
import type { GeneratedLesson } from "@/types/lesson";

const CONTENT_VERSION = "lesson-v1-ar";

export async function getCachedLesson(
  topicId: string,
  language: string,
): Promise<GeneratedLesson | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ lesson_json: string }>(
    "SELECT lesson_json FROM lessons WHERE topic_id = ? AND language = ? AND content_version = ?",
    topicId, language, CONTENT_VERSION,
  );
  return row ? (JSON.parse(row.lesson_json) as GeneratedLesson) : null;
}

export async function saveLesson(
  topicId: string,
  language: string,
  lesson: GeneratedLesson,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO lessons
      (topic_id, language, content_version, lesson_json, updated_at)
      VALUES (?, ?, ?, ?, ?)`,
    topicId, language, CONTENT_VERSION, JSON.stringify(lesson), Date.now(),
  );
}

export async function saveTopicProgress(
  topicId: string,
  completed: boolean,
  quizAnswer: number | null,
  quizCorrect: boolean,
): Promise<void> {
  await updateTopicProgressIfKnownTopic(
    topicId,
    completed,
    quizAnswer,
    quizCorrect,
  );
}

async function updateTopicProgressIfKnownTopic(
  topicId: string,
  completed: boolean,
  quizAnswer: number | null,
  quizCorrect: boolean,
): Promise<void> {
  const db = await getDatabase();
  const topic = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM roadmap_topics WHERE id = ?",
    topicId,
  );
  if (topic) {
    await updateTopicProgress(
      LOCAL_USER_ID,
      topicId,
      completed ? "completed" : "active",
      quizAnswer,
      quizCorrect,
    );
    return;
  }

  await db.runAsync(
    `INSERT OR REPLACE INTO legacy_topic_progress
      (topic_id, completed, quiz_answer, quiz_correct, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    topicId,
    completed ? 1 : 0,
    quizAnswer,
    quizCorrect ? 1 : 0,
    Date.now(),
  );
}

export async function getTopicProgress(topicId: string) {
  const progress = await getStoredTopicProgress(LOCAL_USER_ID, topicId);
  if (progress) {
    return {
      completed: progress.status === "completed" ? 1 : 0,
      quiz_answer: progress.quizAnswer,
      quiz_correct: progress.quizCorrect ? 1 : 0,
    };
  }

  const db = await getDatabase();
  return db.getFirstAsync<{
    completed: number;
    quiz_answer: number | null;
    quiz_correct: number;
  }>(
    `SELECT completed, quiz_answer, quiz_correct
     FROM legacy_topic_progress WHERE topic_id = ?`,
    topicId,
  );
}
