import {
  getRoadmap,
  getTopicsByRoadmap,
  getTopicLessons,
  getLesson,
  listRoadmaps,
  upsertRoadmap,
  upsertTopic,
  upsertTopicLesson,
  upsertLesson,
} from "./roadmapRepository";
import { getCachedLesson, getOrCreateTopicLessonId, saveLesson } from "./lessonRepository";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import type {
  Roadmap,
  RoadmapDifficulty,
  RoadmapTopic,
  TopicLesson,
} from "@/types/roadmap";
import type { GeneratedLesson } from "@/types/lesson";

// ── In-Flight Request Deduplication ──────────────────────────────────
const inFlightRequests = new Map<string, Promise<unknown>>();

function deduplicate<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fn().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
}

// ── Helper Validators & Normalizers ──────────────────────────────────
function normalizeDifficulty(value: unknown): RoadmapDifficulty {
  const normalized = String(value).toLowerCase();
  if (normalized === "intermediate") return "intermediate";
  if (normalized === "advanced") return "advanced";
  return "beginner";
}

function parseLessonJson(data: unknown): GeneratedLesson | null {
  if (!data) return null;
  if (typeof data === "object") return data as GeneratedLesson;
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as GeneratedLesson;
    } catch {
      return null;
    }
  }
  return null;
}

function parseTimestamp(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!isNaN(parsed)) return parsed;
    const num = Number(value);
    if (!isNaN(num)) return num;
  }
  return Date.now();
}

// ── Remote Types ─────────────────────────────────────────────────────
export type RemoteRoadmap = {
  id: number;
  title: string;
  description?: string | null;
  progress?: string | null;
  difficulty?: string;
  created_at?: string;
};

export type RemoteRoadmapTopic = {
  id: number;
  roadmap_id: number;
  title: string;
  description?: string | null;
  order_index: number;
  created_at?: string;
};

export type RemoteTopicLesson = {
  id: number;
  topic_id: number;
  title: string;
  description?: string | null;
  order_index: number;
  created_at?: string;
  lesson_json?: string | Record<string, unknown> | null;
  content_version?: string | null;
  updated_at?: number | string | null;
  language?: string | null;
};

export type RemoteLesson = {
  id?: number;
  topic_lesson_id: number;
  language?: string;
  content_version?: string;
  lesson_json: string | Record<string, unknown>;
  updated_at?: number | string;
};

// ═══════════════════════════════════════════════════════════════════════
// 1. ROADMAPS SYNC (Startup)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Sync roadmaps from Supabase into local SQLite database.
 * - Compares fetched roadmaps with local roadmaps.
 * - Inserts missing roadmaps.
 * - Updates metadata for existing roadmaps without creating duplicates.
 * - Preserves existing local data and user progress.
 * - Reuses cached local roadmaps if network fails.
 */
export async function syncRoadmaps(): Promise<Roadmap[]> {
  return deduplicate("sync:roadmaps", async () => {
    const localRoadmaps = await listRoadmaps();

    if (!isSupabaseConfigured()) {
      return localRoadmaps;
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from<RemoteRoadmap>("roadmaps")
        .select("id, title, description, progress, difficulty, created_at")
        .order("id", { ascending: true });

      if (error) {
        console.warn("[syncRoadmaps] Supabase fetch error, using local:", error.message);
        return localRoadmaps;
      }

      if (!data || data.length === 0) {
        return localRoadmaps;
      }

      const localById = new Map(localRoadmaps.map((r) => [r.id, r]));
      const localByTitle = new Map(
        localRoadmaps.map((r) => [r.title.trim().toLowerCase(), r]),
      );

      for (const remote of data) {
        const existing =
          localById.get(remote.id) ??
          localByTitle.get(remote.title.trim().toLowerCase());

        if (!existing) {
          // Missing locally — insert into SQLite
          await upsertRoadmap({
            id: remote.id,
            title: remote.title,
            description: remote.description ?? null,
            progress: remote.progress ?? "0%",
            difficulty: normalizeDifficulty(remote.difficulty),
          });
        } else {
          // Exists locally — update metadata while preserving user progress
          await upsertRoadmap({
            id: existing.id,
            title: remote.title,
            description: remote.description ?? existing.description,
            progress: existing.progress, // PRESERVE local user progress!
            difficulty: normalizeDifficulty(remote.difficulty ?? existing.difficulty),
          });
        }
      }

      return await listRoadmaps();
    } catch (cause) {
      console.warn("[syncRoadmaps] Network or sync error, using local cache:", cause);
      return localRoadmaps;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 2. ROADMAP TOPICS SYNC (When Opening a Roadmap)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Fetch and sync roadmap_topics for a roadmap on demand.
 * - Compares fetched topics with topics stored in SQLite.
 * - Inserts any missing topics into SQLite.
 * - Avoids duplicate records.
 * - Preserves correct topic ordering and metadata.
 * - Uses locally stored topics when appropriate / offline.
 */
export async function syncRoadmapTopics(
  roadmapId: number,
): Promise<RoadmapTopic[]> {
  const cacheKey = `sync:topics:${roadmapId}`;

  return deduplicate(cacheKey, async () => {
    const localTopics = await getTopicsByRoadmap(roadmapId);

    if (!isSupabaseConfigured()) {
      return localTopics;
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from<RemoteRoadmapTopic>("roadmap_topics")
        .select("id, roadmap_id, title, description, order_index, created_at")
        .eq("roadmap_id", roadmapId)
        .order("order_index", { ascending: true });

      if (error) {
        console.warn(`[syncRoadmapTopics] Supabase error for roadmap ${roadmapId}:`, error.message);
        if (localTopics.length > 0) return localTopics;
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        return localTopics;
      }

      const localById = new Map(localTopics.map((t) => [t.id, t]));
      const localByTitle = new Map(
        localTopics.map((t) => [t.title.trim().toLowerCase(), t]),
      );

      for (const remote of data) {
        const existing =
          localById.get(remote.id) ??
          localByTitle.get(remote.title.trim().toLowerCase());

        if (!existing) {
          // Missing locally — insert into SQLite
          await upsertTopic({
            id: remote.id,
            roadmapId: remote.roadmap_id ?? roadmapId,
            title: remote.title,
            description: remote.description ?? null,
            orderIndex: remote.order_index ?? 0,
          });
        } else {
          // Avoid duplicate: update metadata preserving local id and relations
          await upsertTopic({
            id: existing.id,
            roadmapId: existing.roadmapId,
            title: remote.title,
            description: remote.description ?? existing.description,
            orderIndex: remote.order_index ?? existing.orderIndex,
          });
        }
      }

      return await getTopicsByRoadmap(roadmapId);
    } catch (cause) {
      if (localTopics.length > 0) {
        console.warn(`[syncRoadmapTopics] Using cached topics for roadmap ${roadmapId} after error`);
        return localTopics;
      }
      throw cause;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 3. TOPIC LESSONS SYNC (When Opening a Topic)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Fetch and sync topic_lessons and lesson content for a topic.
 * - Downloads lesson content only when opened.
 * - Checks whether lesson already exists in SQLite.
 * - If not existing, inserts into SQLite.
 * - If up to date, uses local version.
 * - If remote lesson has been updated, refreshes local cached content
 *   without creating duplicates and preserving user progress.
 */
export async function syncTopicLessons(
  topicId: number,
): Promise<TopicLesson[]> {
  const cacheKey = `sync:topic_lessons:${topicId}`;

  return deduplicate(cacheKey, async () => {
    const localLessons = await getTopicLessons(topicId);

    if (!isSupabaseConfigured()) {
      return localLessons;
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from<RemoteTopicLesson>("topic_lessons")
        .select("*")
        .eq("topic_id", topicId)
        .order("order_index", { ascending: true });

      if (error) {
        console.warn(`[syncTopicLessons] Supabase error for topic ${topicId}:`, error.message);
        if (localLessons.length > 0) return localLessons;
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        return localLessons;
      }

      const localById = new Map(localLessons.map((l) => [l.id, l]));
      const localByTitle = new Map(
        localLessons.map((l) => [l.title.trim().toLowerCase(), l]),
      );

      for (const remote of data) {
        const existing =
          localById.get(remote.id) ??
          localByTitle.get(remote.title.trim().toLowerCase());

        let effectiveLessonId = remote.id;

        if (!existing) {
          // Missing topic_lesson outline — insert into SQLite
          effectiveLessonId = await upsertTopicLesson({
            id: remote.id,
            topicId: remote.topic_id ?? topicId,
            title: remote.title,
            description: remote.description ?? null,
            orderIndex: remote.order_index ?? 0,
          });
        } else {
          effectiveLessonId = existing.id;
          await upsertTopicLesson({
            id: existing.id,
            topicId: existing.topicId,
            title: remote.title,
            description: remote.description ?? existing.description,
            orderIndex: remote.order_index ?? existing.orderIndex,
          });
        }

        // Check if remote topic_lesson contains lesson content directly
        if (remote.lesson_json) {
          await syncLessonContent(
            effectiveLessonId,
            remote.lesson_json,
            remote.content_version ?? "lesson-v1-ar",
            remote.language ?? "ar",
            parseTimestamp(remote.updated_at),
          );
        }
      }

      // Check if there is a separate remote 'lesson' table for these topic_lessons
      const topicLessonIds = data.map((d) => d.id);
      if (topicLessonIds.length > 0) {
        try {
          const { data: lessonRows } = await client
            .from<RemoteLesson>("lesson")
            .select("*")
            .in("topic_lesson_id", topicLessonIds);

          if (lessonRows && lessonRows.length > 0) {
            for (const remoteLesson of lessonRows) {
              if (remoteLesson.lesson_json) {
                await syncLessonContent(
                  remoteLesson.topic_lesson_id,
                  remoteLesson.lesson_json,
                  remoteLesson.content_version ?? "lesson-v1-ar",
                  remoteLesson.language ?? "ar",
                  parseTimestamp(remoteLesson.updated_at),
                );
              }
            }
          }
        } catch {
          // If 'lesson' table doesn't exist separately on Supabase, that's fine
        }
      }

      return await getTopicLessons(topicId);
    } catch (cause) {
      if (localLessons.length > 0) {
        console.warn(`[syncTopicLessons] Using cached topic_lessons for topic ${topicId}`);
        return localLessons;
      }
      throw cause;
    }
  });
}

/**
 * Synchronizes single lesson content for a topicLessonId.
 * Checks version & timestamp to determine if local content needs updating.
 * Preserves user progress (`is_completed`, `quiz_answer`, `quiz_correct`).
 */
export async function syncLessonContent(
  topicLessonId: number,
  remoteLessonJson: unknown,
  remoteVersion = "lesson-v1-ar",
  language = "ar",
  remoteUpdatedAt = Date.now(),
): Promise<GeneratedLesson | null> {
  const parsedLesson = parseLessonJson(remoteLessonJson);
  if (!parsedLesson) return null;

  const localLesson = await getLesson(topicLessonId);

  if (!localLesson) {
    // Doesn't exist locally — insert into SQLite
    await upsertLesson(
      topicLessonId,
      JSON.stringify(parsedLesson),
      language,
      remoteVersion,
      remoteUpdatedAt,
    );
    return parsedLesson;
  }

  // Check if remote lesson has been updated
  const isRemoteNewer =
    remoteUpdatedAt > localLesson.updatedAt ||
    remoteVersion !== localLesson.contentVersion;

  if (isRemoteNewer) {
    // Update cached content — upsertLesson preserves progress fields!
    await upsertLesson(
      topicLessonId,
      JSON.stringify(parsedLesson),
      language,
      remoteVersion,
      remoteUpdatedAt,
    );
    return parsedLesson;
  }

  // Already up to date locally
  return JSON.parse(localLesson.lessonJson) as GeneratedLesson;
}

/**
 * Unified helper for opening a topic lesson:
 * 1. Checks local cache first (instant display).
 * 2. Fetches from Supabase if online.
 * 3. Updates local cache if remote is newer, preserving progress.
 * 4. Falls back gracefully to local cache when offline.
 */
export async function fetchTopicLessonContent(
  topicRef: string | number,
  language = "ar",
): Promise<{
  lesson: GeneratedLesson | null;
  fromCache: boolean;
  topicLessonId: number;
}> {
  const topicLessonId = await getOrCreateTopicLessonId(topicRef);
  const localCached = await getCachedLesson(topicLessonId, language);

  if (!isSupabaseConfigured()) {
    return {
      lesson: localCached,
      fromCache: Boolean(localCached),
      topicLessonId,
    };
  }

  const cacheKey = `sync:lesson:${topicLessonId}`;

  try {
    const remoteLesson = await deduplicate(cacheKey, async () => {
      const client = getSupabaseClient();

      // Check topic_lessons table first
      const { data: topicLessonData } = await client
        .from<RemoteTopicLesson>("topic_lessons")
        .select("*")
        .eq("id", topicLessonId)
        .maybeSingle();

      if (topicLessonData?.lesson_json) {
        return await syncLessonContent(
          topicLessonId,
          topicLessonData.lesson_json,
          topicLessonData.content_version ?? "lesson-v1-ar",
          topicLessonData.language ?? language,
          parseTimestamp(topicLessonData.updated_at),
        );
      }

      // Check separate lesson table
      const { data: lessonData } = await client
        .from<RemoteLesson>("lesson")
        .select("*")
        .eq("topic_lesson_id", topicLessonId)
        .maybeSingle();

      if (lessonData?.lesson_json) {
        return await syncLessonContent(
          topicLessonId,
          lessonData.lesson_json,
          lessonData.content_version ?? "lesson-v1-ar",
          lessonData.language ?? language,
          parseTimestamp(lessonData.updated_at),
        );
      }

      return null;
    });

    if (remoteLesson) {
      return {
        lesson: remoteLesson,
        fromCache: false,
        topicLessonId,
      };
    }
  } catch (error) {
    console.warn(`[fetchTopicLessonContent] Remote fetch error for lesson ${topicLessonId}:`, error);
  }

  // If remote didn't return or failed, return local cached content
  return {
    lesson: localCached,
    fromCache: Boolean(localCached),
    topicLessonId,
  };
}
