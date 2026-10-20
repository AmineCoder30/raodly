export type RoadmapDifficulty = "beginner" | "intermediate" | "advanced";
export type RoadmapVisibility = "private" | "public";
export type TopicProgressStatus = "locked" | "active" | "completed";

export type Roadmap = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: RoadmapDifficulty;
  language: string;
  createdBy: string | null;
  visibility: RoadmapVisibility;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type RoadmapTopic = {
  id: string;
  sectionId: string;
  title: string;
  description: string | null;
  orderIndex: number;
  estimatedMinutes: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type RoadmapTopicWithProgress = RoadmapTopic & {
  completed: boolean;
  progress: TopicProgress | null;
};

export type RoadmapSection = {
  id: string;
  roadmapId: string;
  title: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  topics: RoadmapTopicWithProgress[];
};

export type TopicLesson = {
  id: string;
  topicId: string;
  title: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type RoadmapWithSections = Roadmap & { sections: RoadmapSection[] };
/** @deprecated Use RoadmapWithSections. */
export type RoadmapWithTopics = RoadmapWithSections;

export type TopicProgress = {
  id: string;
  userId: string;
  topicId: string;
  status: TopicProgressStatus;
  completedAt: string | null;
  updatedAt: string;
  quizAnswer: number | null;
  quizCorrect: boolean;
};
