import { toTopicSections } from "./roadmapMapper";
import type { RoadmapTopicWithLessons } from "@/types/roadmap";

describe("toTopicSections", () => {
  it("preserves topic/lesson ordering and maps user completion", () => {
    const topics: RoadmapTopicWithLessons[] = [
      {
        id: 3,
        roadmapId: 1,
        title: "Forms",
        description: null,
        orderIndex: 2,
        createdAt: "2026-01-01T00:00:00.000Z",
        lessons: [
          {
            id: 11,
            topicId: 3,
            title: "Input types",
            description: null,
            orderIndex: 0,
            createdAt: "2026-01-01T00:00:00.000Z",
            completed: true,
          },
        ],
      },
    ];

    expect(toTopicSections(topics)).toEqual([
      {
        id: "3",
        title: "Forms",
        topics: [{ id: "11", title: "Input types", completed: true }],
      },
    ]);
  });
});
