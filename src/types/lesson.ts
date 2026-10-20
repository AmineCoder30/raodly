export type LessonCodeExample = {
  language: string;
  filename: string;
  code: string;
  explanation: string;
};

export type LessonQuiz = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type GeneratedLesson = {
  introduction: string;
  codeExamples: LessonCodeExample[];
  guidelines: string[];
  quiz: LessonQuiz;
};

export type TopicContext = {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
};

export type FollowUpAnswer = {
  question: string;
  answer: string;
};
