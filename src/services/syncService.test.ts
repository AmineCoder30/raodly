import {
  syncRoadmaps,
  syncRoadmapTopics,
  syncTopicLessons,
  syncLessonContent,
} from "./syncService";
import * as roadmapRepo from "./roadmapRepository";
import * as lessonRepo from "./lessonRepository";
import * as supabaseModule from "./supabase";

jest.mock("./roadmapRepository", () => ({
  listRoadmaps: jest.fn(),
  upsertRoadmap: jest.fn(),
  getTopicsByRoadmap: jest.fn(),
  upsertTopic: jest.fn(),
  getTopicLessons: jest.fn(),
  upsertTopicLesson: jest.fn(),
  getLesson: jest.fn(),
  upsertLesson: jest.fn(),
}));

jest.mock("./lessonRepository", () => ({
  getCachedLesson: jest.fn(),
  getOrCreateTopicLessonId: jest.fn(),
  saveLesson: jest.fn(),
}));

jest.mock("./supabase", () => ({
  getSupabaseClient: jest.fn(),
  isSupabaseConfigured: jest.fn(),
}));

describe("syncService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("syncRoadmaps (Startup Sync)", () => {
    it("returns local roadmaps if Supabase is not configured", async () => {
      (supabaseModule.isSupabaseConfigured as jest.Mock).mockReturnValue(false);
      const local = [
        {
          id: 1,
          title: "مسار محلي",
          description: null,
          progress: "25%",
          difficulty: "beginner" as const,
          createdAt: "2026-01-01",
        },
      ];
      (roadmapRepo.listRoadmaps as jest.Mock).mockResolvedValue(local);

      const result = await syncRoadmaps();
      expect(result).toEqual(local);
      expect(supabaseModule.getSupabaseClient).not.toHaveBeenCalled();
    });

    it("inserts missing roadmaps and updates existing while preserving local user progress", async () => {
      (supabaseModule.isSupabaseConfigured as jest.Mock).mockReturnValue(true);

      const local = [
        {
          id: 1,
          title: "Frontend",
          description: "Old desc",
          progress: "40%",
          difficulty: "beginner" as const,
          createdAt: "2026-01-01",
        },
      ];
      (roadmapRepo.listRoadmaps as jest.Mock).mockResolvedValue(local);

      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: [
            {
              id: 1,
              title: "Frontend",
              description: "New updated desc",
              progress: "0%",
              difficulty: "beginner",
            },
            {
              id: 2,
              title: "Backend",
              description: "Brand new roadmap",
              progress: "0%",
              difficulty: "intermediate",
            },
          ],
          error: null,
        }),
      });

      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      (supabaseModule.getSupabaseClient as jest.Mock).mockReturnValue({
        from: mockFrom,
      });

      await syncRoadmaps();

      // For existing roadmap (id: 1), progress should be preserved as "40%", not overwritten with "0%"
      expect(roadmapRepo.upsertRoadmap).toHaveBeenCalledWith({
        id: 1,
        title: "Frontend",
        description: "New updated desc",
        progress: "40%",
        difficulty: "beginner",
      });

      // For missing roadmap (id: 2), it should be inserted
      expect(roadmapRepo.upsertRoadmap).toHaveBeenCalledWith({
        id: 2,
        title: "Backend",
        description: "Brand new roadmap",
        progress: "0%",
        difficulty: "intermediate",
      });
    });

    it("falls back to local SQLite roadmaps if remote request fails", async () => {
      (supabaseModule.isSupabaseConfigured as jest.Mock).mockReturnValue(true);
      const local = [
        {
          id: 1,
          title: "Cached Offline Roadmap",
          description: null,
          progress: "50%",
          difficulty: "beginner" as const,
          createdAt: "2026-01-01",
        },
      ];
      (roadmapRepo.listRoadmaps as jest.Mock).mockResolvedValue(local);

      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Network unavailable" },
        }),
      });

      (supabaseModule.getSupabaseClient as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({ select: mockSelect }),
      });

      const result = await syncRoadmaps();
      expect(result).toEqual(local);
    });
  });

  describe("syncRoadmapTopics (When Opening a Roadmap)", () => {
    it("fetches missing topics for roadmap and avoids duplicates", async () => {
      (supabaseModule.isSupabaseConfigured as jest.Mock).mockReturnValue(true);

      const localTopics = [
        {
          id: 10,
          roadmapId: 1,
          title: "HTML Basics",
          description: null,
          orderIndex: 0,
          createdAt: "2026-01-01",
        },
      ];
      (roadmapRepo.getTopicsByRoadmap as jest.Mock).mockResolvedValue(localTopics);

      const mockEq = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: [
            {
              id: 10,
              roadmap_id: 1,
              title: "HTML Basics",
              description: "Updated desc",
              order_index: 0,
            },
            {
              id: 11,
              roadmap_id: 1,
              title: "CSS Basics",
              description: "Newly added topic",
              order_index: 1,
            },
          ],
          error: null,
        }),
      });

      (supabaseModule.getSupabaseClient as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({ eq: mockEq }),
        }),
      });

      await syncRoadmapTopics(1);

      // Existing topic updated, not duplicated
      expect(roadmapRepo.upsertTopic).toHaveBeenCalledWith({
        id: 10,
        roadmapId: 1,
        title: "HTML Basics",
        description: "Updated desc",
        orderIndex: 0,
      });

      // Missing topic inserted
      expect(roadmapRepo.upsertTopic).toHaveBeenCalledWith({
        id: 11,
        roadmapId: 1,
        title: "CSS Basics",
        description: "Newly added topic",
        orderIndex: 1,
      });
    });

    it("uses locally stored topics when offline", async () => {
      (supabaseModule.isSupabaseConfigured as jest.Mock).mockReturnValue(true);

      const localTopics = [
        {
          id: 10,
          roadmapId: 1,
          title: "HTML Basics",
          description: null,
          orderIndex: 0,
          createdAt: "2026-01-01",
        },
      ];
      (roadmapRepo.getTopicsByRoadmap as jest.Mock).mockResolvedValue(localTopics);

      (supabaseModule.getSupabaseClient as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest
                .fn()
                .mockResolvedValue({ data: null, error: { message: "Offline" } }),
            }),
          }),
        }),
      });

      const result = await syncRoadmapTopics(1);
      expect(result).toEqual(localTopics);
    });
  });

  describe("syncLessonContent (When Opening a Topic)", () => {
    it("inserts lesson into SQLite when not present locally", async () => {
      (roadmapRepo.getLesson as jest.Mock).mockResolvedValue(null);

      const remoteLesson = {
        introduction: "مقدمة",
        codeExamples: [],
        guidelines: [],
        quiz: { question: "Q", options: ["A"], correctAnswer: 0, explanation: "E" },
      };

      await syncLessonContent(
        101,
        remoteLesson,
        "lesson-v1-ar",
        "ar",
        1700000000000,
      );

      expect(roadmapRepo.upsertLesson).toHaveBeenCalledWith(
        101,
        JSON.stringify(remoteLesson),
        "ar",
        "lesson-v1-ar",
        1700000000000,
      );
    });

    it("updates cached content when remote lesson is newer", async () => {
      (roadmapRepo.getLesson as jest.Mock).mockResolvedValue({
        id: 1,
        topicLessonId: 101,
        isCompleted: true,
        language: "ar",
        contentVersion: "lesson-v1-ar",
        lessonJson: JSON.stringify({ introduction: "Old" }),
        quizAnswer: 0,
        quizCorrect: true,
        updatedAt: 1000,
      });

      const updatedRemoteLesson = {
        introduction: "New updated introduction",
        codeExamples: [],
        guidelines: [],
        quiz: { question: "Q", options: ["A"], correctAnswer: 0, explanation: "E" },
      };

      await syncLessonContent(
        101,
        updatedRemoteLesson,
        "lesson-v2-ar",
        "ar",
        2000, // Newer timestamp
      );

      expect(roadmapRepo.upsertLesson).toHaveBeenCalledWith(
        101,
        JSON.stringify(updatedRemoteLesson),
        "ar",
        "lesson-v2-ar",
        2000,
      );
    });

    it("reuses local version when remote lesson is not newer", async () => {
      const localLessonJson = {
        introduction: "Current",
        codeExamples: [],
        guidelines: [],
        quiz: { question: "Q", options: ["A"], correctAnswer: 0, explanation: "E" },
      };

      (roadmapRepo.getLesson as jest.Mock).mockResolvedValue({
        id: 1,
        topicLessonId: 101,
        isCompleted: true,
        language: "ar",
        contentVersion: "lesson-v1-ar",
        lessonJson: JSON.stringify(localLessonJson),
        quizAnswer: 0,
        quizCorrect: true,
        updatedAt: 5000,
      });

      const result = await syncLessonContent(
        101,
        localLessonJson,
        "lesson-v1-ar",
        "ar",
        4000, // Older timestamp
      );

      expect(roadmapRepo.upsertLesson).not.toHaveBeenCalled();
      expect(result).toEqual(localLessonJson);
    });
  });
});
