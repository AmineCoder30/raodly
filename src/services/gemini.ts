import { getGeminiApiKey } from "@/services/secureSettings";
import type {
  FollowUpAnswer,
  GeneratedLesson,
  TopicContext,
} from "@/types/lesson";
import { GoogleGenAI, Type } from "@google/genai";

const MODEL = "gemini-2.5-flash";

const lessonSchema = {
  type: Type.OBJECT,
  properties: {
    introduction: { type: Type.STRING },
    codeExamples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          language: { type: Type.STRING },
          filename: { type: Type.STRING },
          code: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ["language", "filename", "code", "explanation"],
      },
    },
    guidelines: { type: Type.ARRAY, items: { type: Type.STRING } },
    quiz: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctAnswer: { type: Type.INTEGER },
        explanation: { type: Type.STRING },
      },
      required: ["question", "options", "correctAnswer", "explanation"],
    },
  },
  required: ["introduction", "codeExamples", "guidelines", "quiz"],
} as const;

function requireApiKey(apiKey: string | null): string {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }
  return apiKey;
}

function validateLesson(value: unknown): GeneratedLesson {
  if (!value || typeof value !== "object") throw new Error("INVALID_LESSON");
  const lesson = value as GeneratedLesson;
  if (
    typeof lesson.introduction !== "string" ||
    !Array.isArray(lesson.codeExamples) ||
    !Array.isArray(lesson.guidelines) ||
    !lesson.quiz ||
    typeof lesson.quiz.question !== "string" ||
    !Array.isArray(lesson.quiz.options) ||
    typeof lesson.quiz.correctAnswer !== "number" ||
    typeof lesson.quiz.explanation !== "string"
  ) {
    throw new Error("INVALID_LESSON");
  }
  if (
    lesson.codeExamples.length === 0 ||
    lesson.quiz.options.length < 2 ||
    lesson.quiz.correctAnswer < 0 ||
    lesson.quiz.correctAnswer >= lesson.quiz.options.length ||
    lesson.codeExamples.some(
      (example) =>
        typeof example.language !== "string" ||
        typeof example.filename !== "string" ||
        typeof example.code !== "string" ||
        typeof example.explanation !== "string",
    )
  ) {
    throw new Error("INVALID_LESSON");
  }
  return lesson;
}

function contextPrompt(topic: TopicContext): string {
  return `الموضوع: ${topic.title}
المعرّف: ${topic.id}
اللغة: ${topic.language}
المستوى: ${topic.difficulty}
الوصف الحالي: ${topic.description}`;
}

export async function generateLesson(
  topic: TopicContext,
): Promise<GeneratedLesson> {
  const apiKey = requireApiKey(await getGeminiApiKey());
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `أنشئ درساً تعليمياً باللغة العربية حول الموضوع التالي:

${contextPrompt(topic)}

الهدف اشرح الموضوع بطريقة بسيطة وعملية تناسب المبتدئين تماماً، بأسلوب تعليمي واضح يشبه W3Schools.

قواعد الشرح
- استخدم العربية الفصحى المبسطة، مع الإبقاء على المصطلحات التقنية باللغة الإنجليزية عند الحاجة.
- اشرح فكرة واحدة في كل مرة، وانتقل تدريجياً من الأساسيات إلى التطبيق.
- اجعل الشروحات قصيرة ومباشرة وسهلة الفهم، وتجنب الحشو والتفاصيل غير الضرورية.
- ابدأ بتوضيح المفهوم، ثم قدم مثالاً بسيطاً يوضح كيفية عمله.
- استخدم أمثلة عملية وصحيحة يمكن للمتعلم فهمها وتجربتها بنفسه.
- في أمثلة البرمجة، اذكر لغة البرمجة واسم الملف، واشرح الأجزاء المهمة من الكود بوضوح.
- وضّح النتيجة المتوقعة من المثال عندما يكون ذلك مفيداً.
- استخدم المقارنات أو التشبيهات البسيطة عند الحاجة فقط.
- اذكر الأخطاء الشائعة أو النصائح العملية عندما تكون مفيدة لفهم الموضوع.
- لا تفترض معرفة المتعلم بمفاهيم سابقة لم يتم توضيحها.
- اجعل طول الدرس مناسباً للموضوع؛ البساطة لا تعني حذف المعلومات الضرورية.

بنية الدرس
1. مقدمة قصيرة تشرح المفهوم وأهميته.
2. شرح تدريجي للمفاهيم الأساسية.
3. أمثلة عملية واضحة مع شرح الكود عند الحاجة.
4. نصائح أو أخطاء شائعة عند الحاجة.
5. ملخص قصير لأهم ما تعلمه المستخدم.
6. سؤال واحد من نوع الاختيار من متعدد، بأربعة خيارات وإجابة صحيحة واحدة، لاختبار فهم المتعلم.
*قواعد تنسيق أمثلة الكود:
- أعد الكود كنص برمجي منسق بشكل صحيح، مع استخدام أسطر جديدة حقيقية \n والمسافات البادئة المناسبة.
- ضع كل تعليمة أو مجموعة منطقية في سطر مستقل وفقاً لقواعد تنسيق لغة البرمجة.
- حافظ على بنية الكود، بما في ذلك الأقواس والمسافات البادئة داخل الدوال والشروط والحلقات.
- لا تضع الكود كاملاً في سطر واحد، ولا تحذف الأسطر الجديدة أو المسافات البادئة الضرورية.
- أعد الكود فقط داخل حقل الكود المحدد في مخطط JSON، دون علامات Markdown مثل js .
- اجعل الشرح منفصلاً عن الكود، ولا تدمج التعليقات التوضيحية داخله إلا إذا كانت مفيدة للتعلم.
- تأكد من أن الكود صحيح وقابل للقراءة، وأن التنسيق يتوافق مع أسلوب اللغة المستخدمة.
قواعد إخراج النتيجة
- أعد JSON صالحاً فقط، دون Markdown أو أي نص خارجه.
- التزم تماماً بمخطط JSON الذي يوفره التطبيق، بما في ذلك أسماء الحقول وأنواع البيانات.
- اجعل أمثلة الكود صحيحة ومرتبطة بالموضوع.
- يجب أن تكون قيمة correctAnswer فهرس الإجابة الصحيحة ابتداءً من الصفر.
- راجع صحة JSON واتساق السؤال والخيارات والإجابة قبل إخراج النتيجة.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: lessonSchema,
    },
  });
  if (!response.text) throw new Error("EMPTY_GEMINI_RESPONSE");
  return validateLesson(JSON.parse(response.text));
}

export async function askLessonFollowUp(
  topic: TopicContext,
  question: string,
): Promise<FollowUpAnswer> {
  const apiKey = requireApiKey(await getGeminiApiKey());
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `أجب بالعربية وبأسلوب مبسط عن سؤال المتعلم حول هذا الموضوع.
${contextPrompt(topic)}
السؤال: ${question}`,
  });
  if (!response.text) throw new Error("EMPTY_GEMINI_RESPONSE");
  return { question, answer: response.text.trim() };
}
