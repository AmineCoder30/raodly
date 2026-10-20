import { useRoadmapStore } from "./roadmapStore";
import { updateTopicProgress } from "@/services/roadmapRepository";

jest.mock("@/services/roadmapRepository", () => ({
  getRoadmapWithTopics: jest.fn(),
  getTopicLessons: jest.fn(),
  listRoadmaps: jest.fn(),
  listTopicProgress: jest.fn().mockResolvedValue([]),
  LOCAL_USER_ID: "local-user",
  selectRoadmap: jest.fn(),
  updateTopicProgress: jest.fn().mockResolvedValue(undefined),
  upsertRoadmap: jest.fn(),
  upsertSection: jest.fn(),
  upsertTopic: jest.fn(),
  upsertTopicLesson: jest.fn(),
}));

describe("useRoadmapStore", () => {
  it("updates the current user's topic progress after persistence", async () => {
    await useRoadmapStore
      .getState()
      .setTopicProgress("t11", "completed");

    expect(updateTopicProgress).toHaveBeenCalledWith(
      "local-user",
      "t11",
      "completed",
      null,
      false,
    );
  });
});
