import type { RoadmapSection } from "@/types/roadmap";

export type UiTopic = {
  id: string;
  title: string;
  completed: boolean;
};

export type UiTopicSection = {
  id: string;
  title: string;
  topics: UiTopic[];
};

export function toTopicSections(
  sections: RoadmapSection[],
): UiTopicSection[] {
  return sections.map((section) => ({
    id: section.id,
    title: section.title,
    topics: section.topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      completed: topic.completed,
    })),
  }));
}
