import { getDatabase } from "@/database";
import { createUuid } from "@/utils/uuid";
import type {
  Roadmap,
  RoadmapDifficulty,
  RoadmapSection,
  RoadmapTopic,
  RoadmapTopicWithProgress,
  RoadmapVisibility,
  RoadmapWithSections,
  TopicLesson,
  TopicProgress,
  TopicProgressStatus,
} from "@/types/roadmap";

export const LOCAL_USER_ID = "local-user";

export type UpsertRoadmapInput = Omit<
  Roadmap,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
> & { id?: string; createdAt?: string; updatedAt?: string; deletedAt?: string | null };
export type UpsertSectionInput = Omit<
  RoadmapSection,
  "topics" | "createdAt" | "updatedAt" | "deletedAt"
> & { id?: string; createdAt?: string; updatedAt?: string; deletedAt?: string | null };
export type UpsertTopicInput = Omit<
  RoadmapTopic,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
> & { id?: string; createdAt?: string; updatedAt?: string; deletedAt?: string | null };
export type UpsertLessonInput = Omit<
  TopicLesson,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
> & { id?: string; createdAt?: string; updatedAt?: string; deletedAt?: string | null };

type RoadmapRow = {
  id: string; title: string; description: string | null; category: string | null;
  difficulty: RoadmapDifficulty; language: string; created_by: string | null;
  visibility: RoadmapVisibility; created_at: string; updated_at: string; deleted_at: string | null;
};
type SectionRow = {
  id: string; roadmap_id: string; title: string; order_index: number;
  created_at: string; updated_at: string; deleted_at: string | null;
};
type TopicRow = {
  id: string; section_id: string; title: string; description: string | null;
  order_index: number; estimated_minutes: number | null; created_at: string;
  updated_at: string; deleted_at: string | null;
};
type LessonRow = {
  id: string; topic_id: string; title: string; order_index: number;
  created_at: string; updated_at: string; deleted_at: string | null;
};
type ProgressRow = {
  id: string; user_id: string; topic_id: string; status: TopicProgressStatus;
  completed_at: string | null; updated_at: string; quiz_answer: number | null;
  quiz_correct: number;
};

const now = () => new Date().toISOString();

function assertDifficulty(value: string): asserts value is RoadmapDifficulty {
  if (!["beginner", "intermediate", "advanced"].includes(value)) {
    throw new Error(`Invalid roadmap difficulty: ${value}`);
  }
}

function assertStatus(value: string): asserts value is TopicProgressStatus {
  if (!["locked", "active", "completed"].includes(value)) {
    throw new Error(`Invalid topic progress status: ${value}`);
  }
}

function mapRoadmap(row: RoadmapRow): Roadmap {
  return {
    id: row.id, title: row.title, description: row.description, category: row.category,
    difficulty: row.difficulty, language: row.language, createdBy: row.created_by,
    visibility: row.visibility, createdAt: row.created_at, updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function mapSection(row: SectionRow): RoadmapSection {
  return {
    id: row.id, roadmapId: row.roadmap_id, title: row.title,
    orderIndex: row.order_index, createdAt: row.created_at,
    updatedAt: row.updated_at, deletedAt: row.deleted_at, topics: [],
  };
}

function mapTopic(row: TopicRow): RoadmapTopic {
  return {
    id: row.id, sectionId: row.section_id, title: row.title,
    description: row.description, orderIndex: row.order_index,
    estimatedMinutes: row.estimated_minutes, createdAt: row.created_at,
    updatedAt: row.updated_at, deletedAt: row.deleted_at,
  };
}

function mapProgress(row: ProgressRow): TopicProgress {
  return {
    id: row.id, userId: row.user_id, topicId: row.topic_id,
    status: row.status, completedAt: row.completed_at, updatedAt: row.updated_at,
    quizAnswer: row.quiz_answer, quizCorrect: row.quiz_correct === 1,
  };
}

function mapLesson(row: LessonRow): TopicLesson {
  return {
    id: row.id, topicId: row.topic_id, title: row.title,
    orderIndex: row.order_index, createdAt: row.created_at,
    updatedAt: row.updated_at, deletedAt: row.deleted_at,
  };
}

export async function upsertRoadmap(input: UpsertRoadmapInput): Promise<string> {
  assertDifficulty(input.difficulty);
  const db = await getDatabase();
  const id = input.id ?? createUuid();
  const updatedAt = input.updatedAt ?? now();
  await db.runAsync(
    `INSERT INTO roadmaps
      (id, title, description, category, difficulty, language, created_by, visibility,
       created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title, description = excluded.description, category = excluded.category,
       difficulty = excluded.difficulty, language = excluded.language,
       created_by = excluded.created_by, visibility = excluded.visibility,
       updated_at = excluded.updated_at, deleted_at = excluded.deleted_at`,
    id, input.title, input.description, input.category, input.difficulty, input.language,
    input.createdBy, input.visibility, input.createdAt ?? updatedAt, updatedAt,
    input.deletedAt ?? null,
  );
  return id;
}

export async function getRoadmap(id: string): Promise<Roadmap | null> {
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
    "SELECT * FROM roadmaps WHERE deleted_at IS NULL ORDER BY updated_at DESC",
  );
  return rows.map(mapRoadmap);
}

export async function upsertSection(input: UpsertSectionInput): Promise<string> {
  const db = await getDatabase();
  const id = input.id ?? createUuid();
  const updatedAt = input.updatedAt ?? now();
  await db.runAsync(
    `INSERT INTO roadmap_sections
      (id, roadmap_id, title, order_index, created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       roadmap_id = excluded.roadmap_id, title = excluded.title,
       order_index = excluded.order_index, updated_at = excluded.updated_at,
       deleted_at = excluded.deleted_at`,
    id, input.roadmapId, input.title, input.orderIndex,
    input.createdAt ?? updatedAt, updatedAt, input.deletedAt ?? null,
  );
  return id;
}

export async function upsertTopic(input: UpsertTopicInput): Promise<string> {
  const db = await getDatabase();
  const id = input.id ?? createUuid();
  const updatedAt = input.updatedAt ?? now();
  await db.runAsync(
    `INSERT INTO roadmap_topics
      (id, section_id, title, description, order_index, estimated_minutes,
       created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       section_id = excluded.section_id, title = excluded.title,
       description = excluded.description, order_index = excluded.order_index,
       estimated_minutes = excluded.estimated_minutes, updated_at = excluded.updated_at,
       deleted_at = excluded.deleted_at`,
    id, input.sectionId, input.title, input.description, input.orderIndex,
    input.estimatedMinutes, input.createdAt ?? updatedAt, updatedAt,
    input.deletedAt ?? null,
  );
  return id;
}

export async function upsertTopicLesson(input: UpsertLessonInput): Promise<string> {
  const db = await getDatabase();
  const id = input.id ?? createUuid();
  const updatedAt = input.updatedAt ?? now();
  await db.runAsync(
    `INSERT INTO topic_lessons
      (id, topic_id, title, order_index, created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       topic_id = excluded.topic_id, title = excluded.title,
       order_index = excluded.order_index, updated_at = excluded.updated_at,
       deleted_at = excluded.deleted_at`,
    id, input.topicId, input.title, input.orderIndex,
    input.createdAt ?? updatedAt, updatedAt, input.deletedAt ?? null,
  );
  return id;
}

export async function getTopicLessons(topicId: string): Promise<TopicLesson[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<LessonRow>(
    `SELECT * FROM topic_lessons
     WHERE topic_id = ? AND deleted_at IS NULL
     ORDER BY order_index ASC, id ASC`,
    topicId,
  );
  return rows.map(mapLesson);
}

export async function getRoadmapWithSections(
  roadmapId: string,
  userId = LOCAL_USER_ID,
): Promise<RoadmapWithSections | null> {
  const roadmap = await getRoadmap(roadmapId);
  if (!roadmap) return null;

  const db = await getDatabase();
  const sections = (
    await db.getAllAsync<SectionRow>(
      `SELECT * FROM roadmap_sections
       WHERE roadmap_id = ? AND deleted_at IS NULL
       ORDER BY order_index ASC, id ASC`,
      roadmapId,
    )
  ).map(mapSection);
  const topics = await db.getAllAsync<TopicRow>(
    `SELECT topics.* FROM roadmap_topics AS topics
     INNER JOIN roadmap_sections AS sections ON sections.id = topics.section_id
     WHERE sections.roadmap_id = ? AND topics.deleted_at IS NULL
       AND sections.deleted_at IS NULL
     ORDER BY topics.section_id ASC, topics.order_index ASC, topics.id ASC`,
    roadmapId,
  );
  const topicIds = topics.map((topic) => topic.id);
  const progress = await listTopicProgress(userId, topicIds);
  const progressByTopicId = new Map(progress.map((item) => [item.topicId, item]));

  const topicsBySection = new Map<string, RoadmapTopicWithProgress[]>();
  for (const row of topics) {
    const topic = mapTopic(row);
    const topicProgress = progressByTopicId.get(topic.id) ?? null;
    const sectionTopics = topicsBySection.get(topic.sectionId) ?? [];
    sectionTopics.push({
      ...topic,
      completed: topicProgress?.status === "completed",
      progress: topicProgress,
    });
    topicsBySection.set(topic.sectionId, sectionTopics);
  }

  return {
    ...roadmap,
    sections: sections.map((section) => ({
      ...section,
      topics: topicsBySection.get(section.id) ?? [],
    })),
  };
}

/** Compatibility alias for callers that have not moved to sections yet. */
export const getRoadmapWithTopics = getRoadmapWithSections;

export async function selectRoadmap(userId: string, roadmapId: string): Promise<string> {
  const db = await getDatabase();
  const id = createUuid();
  const timestamp = now();
  let selectedId = id;
  await db.withTransactionAsync(async () => {
    const existing = await db.getFirstAsync<{ id: string }>(
      "SELECT id FROM user_roadmaps WHERE user_id = ? AND roadmap_id = ?",
      userId, roadmapId,
    );
    selectedId = existing?.id ?? id;
    await db.runAsync(
      `INSERT INTO user_roadmaps
        (id, user_id, roadmap_id, started_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, roadmap_id) DO UPDATE SET updated_at = excluded.updated_at`,
      selectedId, userId, roadmapId, timestamp, timestamp, timestamp,
    );
  });
  return selectedId;
}

export async function updateTopicProgress(
  userId: string,
  topicId: string,
  status: TopicProgressStatus,
  quizAnswer: number | null = null,
  quizCorrect = false,
): Promise<void> {
  assertStatus(status);
  const db = await getDatabase();
  const timestamp = now();
  await db.runAsync(
    `INSERT INTO topic_progress
      (id, user_id, topic_id, status, completed_at, updated_at, quiz_answer, quiz_correct)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, topic_id) DO UPDATE SET
       status = excluded.status, completed_at = excluded.completed_at,
       updated_at = excluded.updated_at, quiz_answer = excluded.quiz_answer,
       quiz_correct = excluded.quiz_correct`,
    createUuid(), userId, topicId, status,
    status === "completed" ? timestamp : null, timestamp, quizAnswer,
    quizCorrect ? 1 : 0,
  );
}

export async function listTopicProgress(
  userId: string,
  topicIds?: string[],
): Promise<TopicProgress[]> {
  const db = await getDatabase();
  const conditions = ["user_id = ?"];
  const parameters: (string | number)[] = [userId];
  if (topicIds && topicIds.length > 0) {
    conditions.push(`topic_id IN (${topicIds.map(() => "?").join(", ")})`);
    parameters.push(...topicIds);
  }
  const rows = await db.getAllAsync<ProgressRow>(
    `SELECT * FROM topic_progress
     WHERE ${conditions.join(" AND ")}
     ORDER BY updated_at DESC`,
    parameters,
  );
  return rows.map(mapProgress);
}

export async function getTopicProgress(
  userId: string,
  topicId: string,
): Promise<TopicProgress | null> {
  const rows = await listTopicProgress(userId, [topicId]);
  return rows[0] ?? null;
}
