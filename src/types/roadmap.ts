export type RoadmapDifficulty = "beginner" | "intermediate" | "advanced";

export type Roadmap = {
  id: number;
  title: string;
  description: string | null;
  progress: string;
  difficulty: RoadmapDifficulty;
  createdAt: string;
};

export type RoadmapTopic = {
  id: number;
  roadmapId: number;
  title: string;
  description: string | null;
  orderIndex: number;
  createdAt: string;
};

export type TopicLesson = {
  id: number;
  topicId: number;
  title: string;
  description: string | null;
  orderIndex: number;
  createdAt: string;
};

export type Lesson = {
  id: number;
  topicLessonId: number;
  isCompleted: boolean;
  language: string;
  contentVersion: string;
  lessonJson: string;
  quizAnswer: number | null;
  quizCorrect: boolean;
  updatedAt: number;
};

export type LessonMessage = {
  id: number;
  lessonId: number;
  question: string;
  answerJson: string;
  createdAt: string;
};

/** A topic with its lessons and their completion status */
export type RoadmapTopicWithLessons = RoadmapTopic & {
  lessons: (TopicLesson & { completed: boolean })[];
};

/** A full roadmap with all its topics and nested lessons */
export type RoadmapWithTopics = Roadmap & {
  topics: RoadmapTopicWithLessons[];
};
