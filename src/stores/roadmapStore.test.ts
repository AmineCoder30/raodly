import { useRoadmapStore } from "./roadmapStore";
import { updateLessonProgress } from "@/services/roadmapRepository";

jest.mock("@/services/syncService", () => ({
  syncRoadmaps: jest.fn().mockResolvedValue([]),
  syncRoadmapTopics: jest.fn().mockResolvedValue([]),
  syncTopicLessons: jest.fn().mockResolvedValue([]),
  fetchTopicLessonContent: jest
    .fn()
    .mockResolvedValue({ lesson: null, fromCache: false, topicLessonId: 1 }),
}));

jest.mock("@/services/roadmapRepository", () => ({
  getRoadmapWithTopics: jest.fn(),
  getTopicLessons: jest.fn(),
  listRoadmaps: jest.fn(),
  LOCAL_USER_ID: "local-user",
  updateLessonProgress: jest.fn().mockResolvedValue(undefined),
  updateTopicProgress: jest.fn().mockResolvedValue(undefined),
  upsertRoadmap: jest.fn(),
  upsertTopic: jest.fn(),
  upsertTopicLesson: jest.fn(),
}));

describe("useRoadmapStore", () => {
  it("updates lesson progress after persistence", async () => {
    await useRoadmapStore.getState().setLessonProgress(11, true, null, false);

    expect(updateLessonProgress).toHaveBeenCalledWith(11, true, null, false);
  });

  it("updates topic progress via alias", async () => {
    await useRoadmapStore.getState().setTopicProgress("t11", "completed");

    expect(updateLessonProgress).toHaveBeenCalledWith(11, true, null, false);
  });
});
