import { toTopicSections } from "./roadmapMapper";
import type { RoadmapSection } from "@/types/roadmap";

describe("toTopicSections", () => {
  it("preserves section/topic ordering and maps user completion", () => {
    const sections: RoadmapSection[] = [
      {
        id: "s3",
        roadmapId: "html",
        title: "Forms",
        orderIndex: 2,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        deletedAt: null,
        topics: [
          {
            id: "t11",
            sectionId: "s3",
            title: "Input types",
            description: null,
            orderIndex: 0,
            estimatedMinutes: null,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
            deletedAt: null,
            completed: true,
            progress: null,
          },
        ],
      },
    ];

    expect(toTopicSections(sections)).toEqual([
      {
        id: "s3",
        title: "Forms",
        topics: [{ id: "t11", title: "Input types", completed: true }],
      },
    ]);
  });
});
