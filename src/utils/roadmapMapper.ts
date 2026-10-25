import type { RoadmapTopicWithLessons } from "@/types/roadmap";

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

/**
 * Map the new flat topics array (each with nested lessons) into the
 * TopicSection[] shape that the sidebar UI expects.
 *
 * Each RoadmapTopic becomes a "section" heading, and its topic_lessons
 * become the navigable items underneath.
 */
export function toTopicSections(
  topics: RoadmapTopicWithLessons[],
): UiTopicSection[] {
  return topics.map((topic) => ({
    id: String(topic.id),
    title: topic.title,
    topics: topic.lessons.map((lesson) => ({
      id: String(lesson.id),
      title: lesson.title,
      completed: lesson.completed,
    })),
  }));
}
