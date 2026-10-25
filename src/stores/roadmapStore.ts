import { create } from "zustand";
import {
  getRoadmapWithTopics,
  getTopicLessons,
  listRoadmaps,
  upsertTopicLesson,
  type UpsertRoadmapInput,
  type UpsertTopicInput,
  type UpsertTopicLessonInput,
  upsertRoadmap,
  upsertTopic,
  updateLessonProgress,
} from "@/services/roadmapRepository";
import {
  syncRoadmaps,
  syncRoadmapTopics,
  syncTopicLessons,
} from "@/services/syncService";
import type {
  Roadmap,
  RoadmapWithTopics,
  TopicLesson,
} from "@/types/roadmap";

type RoadmapStore = {
  roadmaps: Roadmap[];
  activeRoadmap: RoadmapWithTopics | null;
  lessonsByTopicId: Record<number, TopicLesson[]>;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  syncStartupRoadmaps: () => Promise<Roadmap[]>;
  loadRoadmaps: () => Promise<void>;
  loadRoadmap: (roadmapId: number) => Promise<RoadmapWithTopics | null>;
  saveRoadmap: (input: UpsertRoadmapInput) => Promise<number>;
  saveTopic: (input: UpsertTopicInput) => Promise<number>;
  saveLesson: (input: UpsertTopicLessonInput) => Promise<number>;
  loadTopicLessons: (topicId: number) => Promise<TopicLesson[]>;
  setLessonProgress: (
    topicLessonId: number,
    isCompleted: boolean,
    quizAnswer?: number | null,
    quizCorrect?: boolean,
  ) => Promise<void>;
  setTopicProgress: (
    topicLessonId: number | string,
    status: string,
    quizAnswer?: number | null,
    quizCorrect?: boolean,
  ) => Promise<void>;
  clearError: () => void;
};

let hydrationPromise: Promise<void> | null = null;

export const useRoadmapStore = create<RoadmapStore>((set, get) => ({
  roadmaps: [],
  activeRoadmap: null,
  lessonsByTopicId: {},
  isLoading: false,
  isHydrated: false,
  error: null,

  hydrate: async () => {
    if (hydrationPromise) return hydrationPromise;

    hydrationPromise = (async () => {
      set({ isLoading: true, error: null });
      try {
        // Step 1: Load existing local roadmaps from SQLite for immediate UI availability
        const localRoadmaps = await listRoadmaps();
        set({ roadmaps: localRoadmaps, isHydrated: true });

        // Step 2: Sync from Supabase on startup to discover new roadmaps
        try {
          const syncedRoadmaps = await syncRoadmaps();
          set({ roadmaps: syncedRoadmaps });
        } catch (syncError) {
          console.warn("[hydrate] Supabase roadmaps sync failed, local roadmaps retained:", syncError);
        }
      } catch (cause) {
        const error =
          cause instanceof Error ? cause.message : "Failed to load roadmaps";
        set({ error });
        throw cause;
      } finally {
        set({ isLoading: false });
        hydrationPromise = null;
      }
    })();

    return hydrationPromise;
  },

  syncStartupRoadmaps: async () => {
    set({ isLoading: true, error: null });
    try {
      const roadmaps = await syncRoadmaps();
      set({ roadmaps, isHydrated: true });
      return roadmaps;
    } catch (cause) {
      const error =
        cause instanceof Error ? cause.message : "Failed to sync roadmaps";
      set({ error });
      throw cause;
    } finally {
      set({ isLoading: false });
    }
  },

  loadRoadmaps: async () => {
    set({ isLoading: true, error: null });
    try {
      const roadmaps = await listRoadmaps();
      set({ roadmaps, isHydrated: true });
    } catch (cause) {
      const error =
        cause instanceof Error ? cause.message : "Failed to load roadmaps";
      set({ error });
      throw cause;
    } finally {
      set({ isLoading: false });
    }
  },

  loadRoadmap: async (roadmapId) => {
    set({ isLoading: true, error: null });
    try {
      // Step 1: Check local cache first
      let activeRoadmap = await getRoadmapWithTopics(roadmapId);

      if (activeRoadmap && activeRoadmap.topics.length > 0) {
        // Display locally cached content immediately
        set({ activeRoadmap });

        // Background sync to discover newly added topics without blocking UI
        void syncRoadmapTopics(roadmapId)
          .then(async () => {
            const updated = await getRoadmapWithTopics(roadmapId);
            if (updated) {
              set({ activeRoadmap: updated });
            }
          })
          .catch((err) => {
            console.warn(`[loadRoadmap] Background topic sync failed:`, err);
          });

        return activeRoadmap;
      }

      // Step 2: Content not cached locally — fetch and sync from Supabase
      try {
        await syncRoadmapTopics(roadmapId);
        activeRoadmap = await getRoadmapWithTopics(roadmapId);
      } catch (syncError) {
        console.warn(`[loadRoadmap] Remote topic fetch failed:`, syncError);
      }

      if (!activeRoadmap) {
        set({
          activeRoadmap: null,
          lessonsByTopicId: {},
        });
        return null;
      }

      set({ activeRoadmap });
      return activeRoadmap;
    } catch (cause) {
      const error =
        cause instanceof Error ? cause.message : "Failed to load roadmap";
      set({ error });
      throw cause;
    } finally {
      set({ isLoading: false });
    }
  },

  saveRoadmap: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const id = await upsertRoadmap(input);
      await get().loadRoadmaps();
      return id;
    } catch (cause) {
      const error =
        cause instanceof Error ? cause.message : "Failed to save roadmap";
      set({ error });
      throw cause;
    } finally {
      set({ isLoading: false });
    }
  },

  saveTopic: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const id = await upsertTopic(input);
      const activeRoadmap = get().activeRoadmap;
      if (activeRoadmap && activeRoadmap.id === input.roadmapId) {
        await get().loadRoadmap(activeRoadmap.id);
      }
      return id;
    } catch (cause) {
      const error =
        cause instanceof Error ? cause.message : "Failed to save topic";
      set({ error });
      throw cause;
    } finally {
      set({ isLoading: false });
    }
  },

  saveLesson: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const id = await upsertTopicLesson(input);
      if (get().lessonsByTopicId[input.topicId]) {
        await get().loadTopicLessons(input.topicId);
      }
      return id;
    } catch (cause) {
      const error =
        cause instanceof Error ? cause.message : "Failed to save lesson";
      set({ error });
      throw cause;
    } finally {
      set({ isLoading: false });
    }
  },

  loadTopicLessons: async (topicId) => {
    set({ isLoading: true, error: null });
    try {
      const localLessons = await getTopicLessons(topicId);
      if (localLessons.length > 0) {
        set((state) => ({
          lessonsByTopicId: {
            ...state.lessonsByTopicId,
            [topicId]: localLessons,
          },
        }));

        // Background sync to discover newly added or updated lessons
        void syncTopicLessons(topicId)
          .then((updated) => {
            set((state) => ({
              lessonsByTopicId: {
                ...state.lessonsByTopicId,
                [topicId]: updated,
              },
            }));
          })
          .catch(() => {});

        return localLessons;
      }

      // Not cached locally — fetch and sync from Supabase
      const lessons = await syncTopicLessons(topicId);
      set((state) => ({
        lessonsByTopicId: {
          ...state.lessonsByTopicId,
          [topicId]: lessons,
        },
      }));
      return lessons;
    } catch (cause) {
      const error =
        cause instanceof Error ? cause.message : "Failed to load lessons";
      set({ error });
      throw cause;
    } finally {
      set({ isLoading: false });
    }
  },

  setLessonProgress: async (
    topicLessonId,
    isCompleted,
    quizAnswer = null,
    quizCorrect = false,
  ) => {
    set({ error: null });
    try {
      await updateLessonProgress(
        topicLessonId,
        isCompleted,
        quizAnswer,
        quizCorrect,
      );
    } catch (cause) {
      const error =
        cause instanceof Error
          ? cause.message
          : "Failed to update lesson progress";
      set({ error });
      throw cause;
    }
  },

  setTopicProgress: async (
    topicLessonId,
    status,
    quizAnswer = null,
    quizCorrect = false,
  ) => {
    const rawId =
      typeof topicLessonId === "number"
        ? topicLessonId
        : parseInt(String(topicLessonId).replace(/\D/g, ""), 10) || 1;
    return get().setLessonProgress(
      rawId,
      status === "completed",
      quizAnswer,
      quizCorrect,
    );
  },

  clearError: () => set({ error: null }),
}));

export type { RoadmapStore };
