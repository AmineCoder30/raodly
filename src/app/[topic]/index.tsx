import LessonSkeleton from "@/components/layout/features/topic/LessonSkeleton";
import TopicsSidebar, {
  type Topic,
  type TopicSection,
} from "@/components/layout/features/topic/TitlesSidebar";
import SafeScreen from "@/components/layout/global/SafeScreen";
import { useTheme } from "@/hooks/use-theme";
import { askLessonFollowUp, generateLesson } from "@/services/gemini";
import {
  getCachedLesson,
  getTopicProgress,
  saveLesson,
  saveTopicProgress,
} from "@/services/lessonRepository";
import type { GeneratedLesson, TopicContext } from "@/types/lesson";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Copy,
  Info,
  Menu,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  ThumbsUp,
  Zap,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import CodeHighlighter from "react-native-code-highlighter";
import {
  atomOneDark,
  atomOneLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs";

export const MOCK_SECTIONS: TopicSection[] = [
  {
    id: "s1",
    title: "القسم 01 · الأساسيات",
    topics: [
      { id: "t1", title: "كيف يعمل الويب", completed: true },
      { id: "t2", title: "هيكل مستند HTML", completed: true },
      { id: "t3", title: "العناوين والفقرات", completed: true },
      { id: "t4", title: "القوائم والجداول", completed: true },
      { id: "t5", title: "الروابط والتنقل", completed: true },
    ],
  },
  {
    id: "s2",
    title: "القسم 02 · العناصر الدلالية الأساسية",
    topics: [
      { id: "t6", title: "العناصر الدلالية", completed: true },
      { id: "t7", title: "تسلسل العناوين", completed: true },
      { id: "t8", title: "خاصية alt للصور", completed: true },
      { id: "t9", title: "معالم ARIA", completed: false },
      { id: "t10", title: "الأزرار مقابل الروابط", completed: false },
    ],
  },
  {
    id: "s3",
    title: "القسم 03 · النماذج (Forms)",
    topics: [
      { id: "t11", title: "أساسيات النماذج", completed: true },
      { id: "t12", title: "التسميات وحقول الإدخال", completed: true },
      { id: "t13", title: "أنواع حقول الإدخال", completed: true },
      { id: "t14", title: "خصائص التحقق", completed: true },
      { id: "t15", title: "المجموعات والعناوين التوضيحية", completed: true },
    ],
  },
  {
    id: "s4",
    title: "القسم 04 · الوسائط والتضمينات",
    topics: [
      { id: "t16", title: "الصور وخاصية srcset", completed: true },
      { id: "t17", title: "الصوت والفيديو", completed: true },
      { id: "t18", title: "الشكل والشرح التوضيحي", completed: true },
      { id: "t19", title: "الإطارات والتضمين", completed: true },
      { id: "t20", title: "أساسيات SVG", completed: true },
    ],
  },
  {
    id: "s5",
    title: "القسم 05 · الأداء وتهيئة محركات البحث",
    topics: [
      { id: "t21", title: "وسوم الميتا", completed: true },
      { id: "t22", title: "أساسيات Open Graph", completed: false },
      { id: "t23", title: "التحميل الكسول", completed: false },
      { id: "t24", title: "التحميل المسبق والجلب", completed: false },
      { id: "t25", title: "مؤشرات أداء الويب الأساسية", completed: false },
    ],
  },
];

const C = {
  primary: "#B4B7FF",
  muted: "#A1A1AA",
  text: "#E4E4E7",
  warning: "#FDBA74",
  success: "#86EFAC",
  onPrimary: "#1B1B3A",
};

function normalizeLanguage(language: string): string {
  const normalized = language.trim().toLowerCase();
  const aliases: Record<string, string> = {
    html: "xml",
    html5: "xml",
    jsx: "javascript",
    ts: "typescript",
    md: "markdown",
    sh: "bash",
    shell: "bash",
  };
  return aliases[normalized] ?? normalized;
}

function topicFromParams(value: string | string[] | undefined): Topic {
  const id = Array.isArray(value) ? value[0] : value;
  return (
    MOCK_SECTIONS.flatMap((section) => section.topics).find(
      (topic) => topic.id === id || topic.title === id,
    ) ?? MOCK_SECTIONS[1].topics[2]
  );
}

function createContext(topic: Topic): TopicContext {
  return {
    id: topic.id,
    title: topic.title,
    description: `درس عملي عن ${topic.title} في تطوير الويب وإمكانية الوصول.`,
    language: "HTML",
    difficulty: "Beginner",
  };
}

export default function TopicDetailsScreen() {
  const params = useLocalSearchParams<{ topic?: string }>();
  const router = useRouter();
  const topic = useMemo(() => topicFromParams(params.topic), [params.topic]);
  const context = useMemo(() => createContext(topic), [topic]);
  const [lesson, setLesson] = useState<GeneratedLesson | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [question, setQuestion] = useState("");
  const [followUp, setFollowUp] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestInFlight = useRef(false);
  const { isDark, colors } = useTheme();

  const loadLesson = useCallback(
    async (force = false) => {
      if (requestInFlight.current) return;
      requestInFlight.current = true;
      setLoading(true);
      setError(null);
      try {
        const cached = force ? null : await getCachedLesson(context.id, "ar");
        const nextLesson = cached ?? (await generateLesson(context));
        if (!cached) await saveLesson(context.id, "ar", nextLesson);
        setLesson(nextLesson);
        const progress = await getTopicProgress(context.id);
        setCompleted(Boolean(progress?.completed));
        setSelected(progress?.quiz_answer ?? null);
      } catch (cause) {
        setError(
          cause instanceof Error && cause.message === "GEMINI_API_KEY_MISSING"
            ? "أضف مفتاح Gemini من الإعدادات أولاً."
            : "تعذر إنشاء الدرس. تحقق من الاتصال ومفتاح Gemini ثم حاول مجدداً.",
        );
      } finally {
        setLoading(false);
        requestInFlight.current = false;
      }
    },
    [context],
  );

  useEffect(() => {
    void loadLesson();
  }, [loadLesson]);

  const selectAnswer = (answer: number) => {
    if (!lesson) return;
    setSelected(answer);
    void saveTopicProgress(
      context.id,
      completed,
      answer,
      answer === lesson.quiz.correctAnswer,
    );
  };

  const ask = async (value = question) => {
    const prompt = value.trim();
    if (!prompt || requestInFlight.current) return;
    requestInFlight.current = true;
    setRequesting(true);
    setError(null);
    try {
      const result = await askLessonFollowUp(context, prompt);
      setFollowUp(result.answer);
      setQuestion("");
    } catch {
      setError("تعذر الحصول على إجابة الآن. حاول مرة أخرى.");
    } finally {
      setRequesting(false);
      requestInFlight.current = false;
    }
  };

  const selectTopic = (next: Topic) => {
    setShowSidebar(false);
    router.push(`/${next.id}`);
  };

  return (
    <SafeScreen classes="flex-1 p-0">
      <TopicsSidebar
        visible={showSidebar}
        activeId={topic.id}
        sections={MOCK_SECTIONS}
        onClose={() => setShowSidebar(false)}
        onSelect={selectTopic}
      />
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between px-margin-mobile py-2 border-b border-border/40">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-2 p-1 active:opacity-70"
            hitSlop={10}
          >
            <ArrowRight size={22} color={"#888888"} />
            <Text className="text-textPrimary text-xl font-cairo-bold font-bold text-start">
              {topic.title}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setShowSidebar(true)}
            className="p-2 bg-primary/10 rounded-lg active:opacity-70"
          >
            <Menu size={20} color={"#888888"} />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-margin-mobile pb-6"
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <LessonSkeleton />
          ) : error && !lesson ? (
            <View className="mt-6 rounded-lg border border-warning bg-card ">
              <Text className="text-body-md text-textPrimary font-cairo text-start">
                {error}
              </Text>
              <View className="mt-4 flex-row gap-3">
                <Pressable
                  onPress={() => void loadLesson()}
                  className="rounded-md bg-primary px-4 py-2"
                >
                  <Text className="font-cairo-semibold font-semibold text-onPrimary text-start">
                    إعادة المحاولة
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push("/settings")}
                  className="rounded-md border border-border px-4 py-2"
                >
                  <Text className="text-textPrimary font-cairo text-start">
                    الإعدادات
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : lesson ? (
            <>
              <Text className="mt-5 text-headline-lg-mobile font-cairo-bold font-bold text-textPrimary text-start">
                {topic.title}
              </Text>
              <View className="mt-4  overflow-hidden">
                <View className="flex-row">
                  <View className="flex-1 ">
                    <Text className="text-body-md text-textPrimary leading-7 font-cairo text-start">
                      {lesson.introduction}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-6  overflow-hidden">
                <View className="flex-row">
                  <View className="flex-1  gap-3">
                    <View className="flex-row items-center gap-2">
                      <ShieldCheck size={18} color={C.primary} />
                      <Text className="font-cairo-bold text-[11px] font-bold uppercase tracking-widest text-primary text-start">
                        إرشادات هامة
                      </Text>
                    </View>
                    <View className="gap-2.5">
                      {lesson.guidelines.map((guideline, index) => (
                        <View
                          key={index}
                          className="flex-row items-start gap-2.5"
                        >
                          <View className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/60" />
                          <Text className="flex-1 text-body-md text-textPrimary leading-7 font-cairo text-start">
                            {guideline}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              {lesson.codeExamples.map((example, index) => (
                <View
                  key={`${example.filename}-${index}`}
                  className="mt-6 overflow-hidden border border-border/60 rounded-lg"
                >
                  <View className="flex-row items-center justify-between border-b border-border/60 bg-background px-4 py-2.5">
                    <View className="flex-row items-center gap-2">
                      <View className="rounded-md bg-primary/15 px-2 py-0.5">
                        <Text className="font-mono text-[9px] font-bold text-primary text-start">
                          {example.language}
                        </Text>
                      </View>
                      <Text className="font-mono text-label-sm text-textPrimary text-start">
                        {example.filename}
                      </Text>
                    </View>
                    <Pressable className="flex-row items-center   gap-1.5 rounded-md px-2 py-1 active:opacity-60">
                      <Copy size={13} color={C.muted} />
                      <Text className="font-cairo text-label-sm text-textSecondary text-start">
                        نسخ
                      </Text>
                    </Pressable>
                  </View>
                  <View style={{ direction: "ltr" }}>
                    <CodeHighlighter
                      language={normalizeLanguage(example.language)}
                      hljsStyle={isDark ? atomOneDark : atomOneLight}
                      textStyle={{ fontSize: 13, fontFamily: "monospace" }}

                      scrollViewProps={{
                        horizontal: true,
                        contentContainerStyle: { padding: 16 },
                        style: { backgroundColor: colors.card, width: "100%" },
                      }}
                    >
                      {example.code}
                    </CodeHighlighter>
                  </View>

                  <View className="border-t border-border/60 bg-primary/5 px-4 py-3.5">
                    <Text className="text-body-md text-textPrimary leading-7 font-cairo text-start">
                      {example.explanation}
                    </Text>
                  </View>
                </View>
              ))}

              <View className="mt-6  overflow-hidden">
                <View className="flex-row">
                  <View className="flex-1  gap-3">
                    <View className="flex-row items-center gap-2">
                      <Info size={18} color={C.warning} />
                      <Text className="font-cairo-bold text-[11px] font-bold uppercase tracking-widest text-warning text-start">
                        إرشاد هام
                      </Text>
                    </View>
                    <Text className="text-body-md text-textPrimary leading-7 font-cairo text-start">
                      {lesson.guidelines[0]}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-6  overflow-hidden">
                <View className="flex-row">
                  <View className="flex-1 ">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Zap size={14} color={C.primary} />
                        <Text className="font-cairo-bold text-[11px] font-bold uppercase tracking-widest text-primary text-start">
                          اختبار سريع للمفهوم
                        </Text>
                      </View>
                    </View>
                    <Text className="mt-4 text-body-md font-cairo-bold font-semibold text-textPrimary leading-7 text-start">
                      {lesson.quiz.question}
                    </Text>
                    <View className="mt-4 gap-2.5">
                      {lesson.quiz.options.map((option, index) => (
                        <Pressable
                          key={option}
                          onPress={() => selectAnswer(index)}
                          className={`flex-row items-center rounded-xl border px-4 py-3.5 gap-3 active:opacity-80 ${selected === index ? "border-primary bg-primary/10" : "border-border/60 bg-background"}`}
                        >
                          <View
                            className={`h-7 w-7 items-center justify-center rounded-full ${selected === index ? "bg-primary" : "bg-border/30"}`}
                          >
                            <Text
                              className={`font-mono text-[11px] font-bold text-start ${selected === index ? "text-onPrimary" : "text-textSecondary"}`}
                            >
                              {String.fromCharCode(65 + index)}
                            </Text>
                          </View>
                          <Text className="flex-1 font-cairo text-body-md text-textPrimary leading-6 text-start">
                            {option}
                          </Text>
                          {selected === index && (
                            <View className="h-5 w-5 items-center justify-center rounded-full bg-primary">
                              <Check size={12} color={"white"} />
                            </View>
                          )}
                        </Pressable>
                      ))}
                    </View>
                    {selected !== null && (
                      <View
                        className={`mt-4 p-4 rounded-xl border  ${selected === lesson.quiz.correctAnswer ? "border-success/30 bg-success/10" : "border-warning/30 bg-warning/10"}`}
                      >
                        <Text
                          className={`font-cairo-bold text-[11px] font-bold uppercase tracking-widest text-start ${selected === lesson.quiz.correctAnswer ? "text-success" : "text-warning"}`}
                        >
                          {selected === lesson.quiz.correctAnswer
                            ? "إجابة صحيحة، أحسنت!"
                            : "ليست الإجابة الدقيقة، حاول مجدداً"}
                        </Text>
                        <Text className="mt-2 text-body-md text-textPrimary leading-7 font-cairo text-start">
                          {lesson.quiz.explanation}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {followUp && (
                <View className="mt-4  overflow-hidden">
                  <View className="flex-row">
                    <View className="w-1 bg-primary" />
                    <View className="flex-1 ">
                      <Text className="text-body-md text-textPrimary font-cairo leading-7 text-start">
                        {followUp}
                      </Text>
                      <View className="mt-4 flex-row items-center gap-1.5">
                        <Pressable className="flex-row items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 active:opacity-70">
                          <ThumbsUp size={12} color={C.primary} />
                          <Text className="font-cairo text-label-sm text-primary text-start">
                            مفيد
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              )}
              {error && (
                <Text className="mt-3 text-label-sm text-warning font-cairo text-start">
                  {error}
                </Text>
              )}
              <View className="mt-4 flex-row items-center border border-border rounded-md  px-3 py-2 gap-2">
                <Pressable
                  disabled={requesting}
                  onPress={() => void ask()}
                  className="h-9 w-9 items-center justify-center rounded-xl bg-primary active:opacity-80"
                >
                  {requesting ? (
                    <ActivityIndicator size="small" color={"white"} />
                  ) : (
                    <ArrowUp size={16} color={"white"} />
                  )}
                </Pressable>
                <TextInput
                  value={question}
                  onChangeText={setQuestion}
                  onSubmitEditing={() => void ask()}
                  placeholder="اطرح سؤالاً حول هذا الموضوع..."
                  placeholderTextColor={C.muted}
                  className="flex-1 py-2 text-body-md text-textPrimary text-start font-cairo"
                  returnKeyType="send"
                />
                <MessageSquare size={18} color={C.muted} />
              </View>
              <Pressable
                disabled={requesting}
                onPress={() => void loadLesson(true)}
                className="mt-4 flex-row items-center justify-center gap-2 rounded-xl border border-border/60 px-4 py-3 active:opacity-70"
              >
                <RefreshCw size={14} color={C.primary} />
                <Text className="text-label-sm text-primary font-cairo-medium font-medium text-start">
                  إعادة إنشاء الدرس
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/t9")}
                className="mt-4 flex-row items-center justify-between rounded-lg bg-primary px-5 py-4 active:opacity-80"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="font-cairo text-label-sm uppercase tracking-widest text-white text-start">
                    التالي
                  </Text>
                  <Text className="text-button font-cairo-bold font-semibold text-white text-start">
                    الموضوع 04: معالم ARIA
                  </Text>
                </View>
                <ArrowLeft size={18} color={"white"} />
              </Pressable>
            </>
          ) : null}
        </ScrollView>
      </View>
    </SafeScreen>
  );
}
