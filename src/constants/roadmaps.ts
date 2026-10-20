export type NodeState = "completed" | "active" | "locked";

export type ModuleNode = {
  id: number;
  title: string;
  subtitle: string;
  state: NodeState;
  progress: number;
};

export type Roadmap = {
  id: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  hours: number;
  title: string;
  description: string;
  topicsCompleted: number;
  topicsTotal: number;
  nextSectionTitle: string;
  isCompleted?: boolean;
  modulesCount: number;
  nodes: ModuleNode[];
};

export const ROADMAPS: Roadmap[] = [
  {
    id: "javascript-fundamentals",
    level: "Beginner",
    hours: 8,
    title: "أساسيات جافاسكريبت",
    description:
      "بنية اللغة الأساسية، الإغلاقات (Closures)، النماذج الأولية (Prototypes)، نموذج حلقة الأحداث (Event Loop)، والأنماط غير المتزامنة الحديثة.",
    topicsCompleted: 18,
    topicsTotal: 25,
    nextSectionTitle: "القسم 04 - جافاسكريبت غير المتزامنة",
    modulesCount: 5,
    nodes: [
      {
        id: 1,
        title: "الأساسيات",
        subtitle: "تم إتقان 5/5",
        state: "completed",
        progress: 1,
      },
      {
        id: 2,
        title: "الدوال ونطاق المتغيرات",
        subtitle: "تم إتقان 6/6",
        state: "completed",
        progress: 1,
      },
      {
        id: 3,
        title: "المصفوفات والكائنات",
        subtitle: "2 من 5 مكتملة",
        state: "active",
        progress: 0.4,
      },
      {
        id: 4,
        title: "جافاسكريبت غير المتزامنة",
        subtitle: "6 مواضيع",
        state: "locked",
        progress: 0,
      },
      {
        id: 5,
        title: "المراجعة النهائية",
        subtitle: "موضوعان",
        state: "locked",
        progress: 0,
      },
    ],
  },
  {
    id: "web-accessibility",
    level: "Intermediate",
    hours: 5,
    title: "إمكانية الوصول للويب (WCAG 2.2)",
    description:
      "أساسيات HTML سهلة الوصول، معالم ARIA المتقدمة، حالات التنقل بلوحة المفاتيح، وتصميم قارئات الشاشة.",
    topicsCompleted: 8,
    topicsTotal: 14,
    nextSectionTitle: "أنماط احتجاز التركيز",
    modulesCount: 4,
    nodes: [
      {
        id: 1,
        title: "HTML سهل الوصول",
        subtitle: "تم إتقان 4/4",
        state: "completed",
        progress: 1,
      },
      {
        id: 2,
        title: "معالم ARIA",
        subtitle: "تم إتقان 3/4",
        state: "completed",
        progress: 1,
      },
      {
        id: 3,
        title: "لوحة المفاتيح والتركيز",
        subtitle: "1 من 3 مكتملة",
        state: "active",
        progress: 0.33,
      },
      {
        id: 4,
        title: "قارئات الشاشة",
        subtitle: "3 مواضيع",
        state: "locked",
        progress: 0,
      },
    ],
  },
  {
    id: "css-grid-flexbox",
    level: "Beginner",
    hours: 4,
    title: "احتراف CSS Grid و Flexbox",
    description:
      "ديناميكيات التخطيط المتجاوب الحديثة، محاذاة Subgrid، وحدات القياس الجوهرية، وأنماط البطاقات المرنة.",
    topicsCompleted: 12,
    topicsTotal: 12,
    isCompleted: true,
    nextSectionTitle: "مراجعة الهيكلية",
    modulesCount: 3,
    nodes: [
      {
        id: 1,
        title: "أسس Flexbox",
        subtitle: "تم إتقان 5/5",
        state: "completed",
        progress: 1,
      },
      {
        id: 2,
        title: "آليات CSS Grid",
        subtitle: "تم إتقان 4/4",
        state: "completed",
        progress: 1,
      },
      {
        id: 3,
        title: "Subgrid والأنماط",
        subtitle: "تم إتقان 3/3",
        state: "completed",
        progress: 1,
      },
    ],
  },
];

export const DEFAULT_ROADMAP = ROADMAPS[0];

export function getRoadmapById(id?: string): Roadmap {
  if (!id) return DEFAULT_ROADMAP;
  return ROADMAPS.find((r) => r.id === id) ?? DEFAULT_ROADMAP;
}
