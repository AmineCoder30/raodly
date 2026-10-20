import { create } from "zustand";
import {
  getRoadmapWithTopics,
  getTopicLessons,
  listRoadmaps,
  listTopicProgress,
  LOCAL_USER_ID,
  selectRoadmap,
  updateTopicProgress,
  upsertSection,
  upsertTopicLesson,
  type UpsertRoadmapInput,
  type UpsertTopicInput,
  upsertRoadmap,
  upsertTopic,
} from "@/services/roadmapRepository";
import type {
  Roadmap,
  RoadmapWithSections,
  RoadmapSection,
  TopicLesson,
  TopicProgress,
  TopicProgressStatus,
} from "@/types/roadmap";

type RoadmapStore = {
  userId: string;
  roadmaps: Roadmap[];
  activeRoadmap: RoadmapWithSections | null;
  lessonsByTopicId: Record<string, TopicLesson[]>;
  progressByTopicId: Record<string, TopicProgress>;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  hydrate: (userId?: string) => Promise<void>;
  loadRoadmaps: () => Promise<void>;
  loadRoadmap: (roadmapId: string) => Promise<RoadmapWithSections | null>;
  saveRoadmap: (input: UpsertRoadmapInput) => Promise<string>;
  saveSection: (input: Omit<RoadmapSection, "topics"> & {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
  }) => Promise<string>;
  saveTopic: (input: UpsertTopicInput) => Promise<string>;
  saveLesson: (input: Parameters<typeof upsertTopicLesson>[0]) => Promise<string>;
  loadTopicLessons: (topicId: string) => Promise<TopicLesson[]>;
  selectRoadmap: (roadmapId: string) => Promise<void>;
  setTopicProgress: (
    topicId: string,
    status: TopicProgressStatus,
    quizAnswer?: number | null,
    quizCorrect?: boolean,
  ) => Promise<void>;
  clearError: () => void;
};

let hydrationPromise: Promise<void> | null = null;

function progressRecord(
  progress: TopicProgress[],
): Record<string, TopicProgress> {
  return Object.fromEntries(progress.map((item) => [item.topicId, item]));
}

async function loadProgress(
  userId: string,
  roadmap: RoadmapWithSections,
): Promise<Record<string, TopicProgress>> {
  const topicIds = roadmap.sections.flatMap((section) =>
    section.topics.map((topic) => topic.id),
  );
  const progress = await listTopicProgress(userId, topicIds);
  return progressRecord(progress);
}

export const useRoadmapStore = create<RoadmapStore>((set, get) => ({
  userId: LOCAL_USER_ID,
  roadmaps: [],
  activeRoadmap: null,
  lessonsByTopicId: {},
  progressByTopicId: {},
  isLoading: false,
  isHydrated: false,
  error: null,

  hydrate: async (userId = get().userId) => {
    if (hydrationPromise) return hydrationPromise;

    hydrationPromise = (async () => {
      set({ userId, isLoading: true, error: null });
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
        hydrationPromise = null;
      }
    })();

    return hydrationPromise;
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
      const activeRoadmap = await getRoadmapWithTopics(roadmapId, get().userId);
      if (!activeRoadmap) {
        set({
          activeRoadmap: null,
          progressByTopicId: {},
          lessonsByTopicId: {},
        });
        return null;
      }

      const progressByTopicId = await loadProgress(get().userId, activeRoadmap);
      set({ activeRoadmap, progressByTopicId });
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
      if (
        activeRoadmap?.sections.some((section) => section.id === input.sectionId)
      ) {
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

  saveSection: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const id = await upsertSection(input);
      if (get().activeRoadmap?.id === input.roadmapId) {
        await get().loadRoadmap(input.roadmapId);
      }
      return id;
    } catch (cause) {
      const error =
        cause instanceof Error ? cause.message : "Failed to save section";
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
      const lessons = await getTopicLessons(topicId);
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

  selectRoadmap: async (roadmapId) => {
    set({ isLoading: true, error: null });
    try {
      await selectRoadmap(get().userId, roadmapId);
      await get().loadRoadmap(roadmapId);
    } catch (cause) {
      const error =
        cause instanceof Error ? cause.message : "Failed to select roadmap";
      set({ error });
      throw cause;
    } finally {
      set({ isLoading: false });
    }
  },

  setTopicProgress: async (
    topicId,
    status,
    quizAnswer = null,
    quizCorrect = false,
  ) => {
    set({ error: null });
    try {
      await updateTopicProgress(
        get().userId,
        topicId,
        status,
        quizAnswer,
        quizCorrect,
      );
      const progress = await listTopicProgress(get().userId, [topicId]);
      if (progress[0]) {
        set((state) => ({
          progressByTopicId: {
            ...state.progressByTopicId,
            [topicId]: progress[0],
          },
        }));
      }
    } catch (cause) {
      const error =
        cause instanceof Error
          ? cause.message
          : "Failed to update topic progress";
      set({ error });
      throw cause;
    }
  },

  clearError: () => set({ error: null }),
}));

export type { RoadmapStore };
