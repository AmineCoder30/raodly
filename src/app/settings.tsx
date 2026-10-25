import SafeScreen from "@/components/layout/global/SafeScreen";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";
import { getGeminiApiKey, setGeminiApiKey } from "@/services/secureSettings";
import { router } from "expo-router";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Database,
  Download,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Lock,
  Monitor,
  Moon,
  Palette,
  ShieldCheck,
  Sparkles,
  Sun,
  Upload,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

type ThemeMode = "light" | "dark" | "system";

const THEME_OPTIONS: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "فاتح", Icon: Sun },
  { value: "dark", label: "داكن", Icon: Moon },
  { value: "system", label: "النظام", Icon: Monitor },
];

const THEME_LABELS: Record<ThemeMode, string> = {
  light: "الفاتح",
  dark: "الداكن",
  system: "النظام",
};

function SectionHeader({
  title,
  Icon,
  color,
}: {
  title: string;
  Icon: typeof Sun;
  color: string;
}) {
  return (
    <View className="mb-3 flex-row items-center gap-2 px-1">
      <Icon size={14} color={color} />
      <Text className="text-textSecondary text-xs font-cairo-semibold font-semibold uppercase tracking-wider text-start">
        {title}
      </Text>
    </View>
  );
}

function LegalRow({
  label,
  Icon,
  onPress,
  showDivider,
  iconColor,
  chevronColor,
}: {
  label: string;
  Icon: typeof Sun;
  onPress: () => void;
  showDivider?: boolean;
  iconColor: string;
  chevronColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3 px-4 py-4 active:bg-primary/5 ${
        showDivider ? "border-b border-border" : ""
      }`}
      style={{ direction: "rtl" }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View className="rounded-lg bg-primary/10 p-2">
        <Icon size={20} color={iconColor} />
      </View>
      <Text className="flex-1 text-right font-cairo-semibold text-base font-semibold text-textPrimary">
        {label}
      </Text>
      <ChevronLeft size={20} color={chevronColor} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { isDark, themePreference, setColorScheme, toggleColorScheme } =
    useColorScheme();
  const theme = useTheme();

  const [apiKey, setApiKey] = useState("");
  const [initialKey, setInitialKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void getGeminiApiKey().then((value) => {
      setApiKey(value ?? "");
      setInitialKey(value ?? "");
    });
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  const hasKey = initialKey.trim().length > 0;
  const isDirty = apiKey.trim() !== initialKey.trim();

  const saveKey = async () => {
    if (saving) return;
    setSaving(true);
    setError(false);
    try {
      const trimmed = apiKey.trim();
      await setGeminiApiKey(trimmed);
      setApiKey(trimmed);
      setInitialKey(trimmed);
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 2500);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  const canSave = isDirty && !saving;

  return (
    <SafeScreen classes="p-0">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border/40 bg-background px-5 py-3">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-3 p-1 active:opacity-70"
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="رجوع"
        >
          <ArrowRight size={22} color={theme.textPrimary} />
          <Text className="text-textPrimary text-xl font-cairo-bold font-bold">
            الإعدادات
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- AI ---------- */}
        <SectionHeader
          title="توليد الدروس بالذكاء الاصطناعي"
          Icon={Sparkles}
          color={theme.textSecondary}
        />
        <View className="mb-8 rounded-2xl border border-border bg-card p-4">
          <View className="flex-row items-center gap-3">
            <View className="rounded-xl bg-primary/15 p-2.5">
              <KeyRound size={20} color={theme.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-textPrimary font-cairo-semibold font-semibold text-base text-start">
                Gemini API Key
              </Text>
              <Text
                className={`text-xs font-cairo text-start ${
                  hasKey ? "text-primary" : "text-textSecondary"
                }`}
              >
                {hasKey
                  ? "المفتاح محفوظ على هذا الجهاز"
                  : "لم يتم إضافة مفتاح بعد"}
              </Text>
            </View>
          </View>

          <Text className="mt-3 text-textSecondary text-xs leading-relaxed text-start font-cairo">
            يُحفظ بأمان على هذا الجهاز ولا يُرفع أبداً إلى Git. استخدم مفتاحك
            الخاص لهذا النموذج الأولي.
          </Text>

          {/* Input */}
          <View
            className={`mt-4 flex-row items-center rounded-xl border bg-background px-3 ${
              error ? "border-red-500" : "border-border"
            }`}
          >
            <TextInput
              value={apiKey}
              onChangeText={(value) => {
                setApiKey(value);
                setSaved(false);
                setError(false);
              }}
              placeholder="AIza..."
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => canSave && void saveKey()}
              className="flex-1 py-3 text-textPrimary text-left font-cairo"
            />
            <Pressable
              onPress={() => setShowKey((v) => !v)}
              hitSlop={10}
              className="p-1 active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel={showKey ? "إخفاء المفتاح" : "إظهار المفتاح"}
            >
              {showKey ? (
                <EyeOff size={18} color={theme.textSecondary} />
              ) : (
                <Eye size={18} color={theme.textSecondary} />
              )}
            </Pressable>
          </View>

          {error && (
            <Text className="mt-2 text-xs text-red-500 font-cairo text-start">
              تعذّر حفظ المفتاح. حاول مرة أخرى.
            </Text>
          )}

          <Pressable
            onPress={() => void saveKey()}
            disabled={!canSave}
            className={`mt-3 flex-row items-center justify-center gap-2 rounded-xl px-4 py-3 active:opacity-80 ${
              canSave || saved ? "bg-primary" : "bg-primary/40"
            }`}
            accessibilityRole="button"
          >
            {saved && <Check size={18} color={theme.onPrimary ?? "#fff"} />}
            <Text className="font-cairo-semibold font-semibold text-onPrimary">
              {saving
                ? "جارٍ الحفظ..."
                : saved
                  ? "تم الحفظ بأمان"
                  : "حفظ API Key"}
            </Text>
          </Pressable>

          <View className="mt-3 flex-row items-center justify-center gap-1.5">
            <Lock size={12} color={theme.textSecondary} />
            <Text className="text-textSecondary text-[11px] font-cairo">
              مشفّر ومخزّن محلياً فقط
            </Text>
          </View>
        </View>

        {/* ---------- Appearance ---------- */}
        <SectionHeader
          title="المظهر والسمة"
          Icon={Palette}
          color={theme.textSecondary}
        />
        <View className="mb-8 rounded-2xl border border-border bg-card p-4">
          <View className="mb-4 flex-row items-center gap-3">
            <View className="rounded-xl bg-primary/15 p-2.5">
              <Palette size={20} color={theme.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-textPrimary font-cairo-semibold font-semibold text-base text-start">
                وضع الألوان
              </Text>
              <Text className="text-textSecondary text-xs text-start font-cairo">
                الوضع المختار:{" "}
                <Text className="text-primary font-cairo-bold font-bold">
                  {THEME_LABELS[themePreference as ThemeMode]}
                </Text>
              </Text>
            </View>
          </View>

          {/* Segmented options */}
          <View className="flex-row gap-2">
            {THEME_OPTIONS.map(({ value, label, Icon }) => {
              const active = themePreference === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setColorScheme(value)}
                  className={`flex-1 items-center gap-2 rounded-xl border py-4 active:opacity-80 ${
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border bg-neutralLight"
                  }`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={label}
                >
                  <Icon
                    size={22}
                    color={active ? theme.primary : theme.textSecondary}
                  />
                  <Text
                    className={`text-sm ${
                      active
                        ? "text-primary font-cairo-bold font-bold"
                        : "text-textSecondary font-cairo-medium font-medium"
                    }`}
                  >
                    {label}
                  </Text>
                  <View
                    className={`h-4 w-4 items-center justify-center rounded-full ${
                      active ? "bg-primary" : "border border-border"
                    }`}
                  >
                    {active && (
                      <Check size={10} color={theme.onPrimary ?? "#fff"} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ---------- Backup ---------- */}
        <SectionHeader
          title="النسخ الاحتياطي"
          Icon={Database}
          color={theme.textSecondary}
        />
        <View className="mb-8 rounded-2xl border border-border bg-card p-4">
          <View className="mb-4 flex-row items-center gap-3">
            <View className="rounded-xl bg-primary/15 p-2.5">
              <Database size={20} color={theme.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-textPrimary font-cairo-semibold font-semibold text-base text-start">
                البيانات
              </Text>
              <Text className="text-textSecondary text-xs leading-relaxed text-start font-cairo">
                صدّر نسخة من بياناتك أو استورد نسخة سابقة.
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <Pressable
              onPress={() => console.log("Export pressed")}

              className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 active:opacity-80 `}
              accessibilityRole="button"
              accessibilityLabel="تصدير البيانات"
            >
              <Upload size={18} color={theme.onPrimary ?? "#fff"} />

              <Text className="font-cairo-semibold font-semibold text-onPrimary">
                تصدير
              </Text>
            </Pressable>

            <Pressable
              onPress={() => console.log("Import pressed")}

              className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-primary bg-primary/10 px-4 py-3 active:opacity-80 `}
              accessibilityRole="button"
              accessibilityLabel="استيراد البيانات"
            >
              <Download size={18} color={theme.primary} />

              <Text className="font-cairo-semibold font-semibold text-primary">
                استيراد
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ---------- Legal legal ---------- */}
        <SectionHeader
          title="المعلومات القانونية"
          Icon={ShieldCheck}
          color={theme.textSecondary}
        />
        <View className="mb-6 overflow-hidden rounded-2xl border border-border bg-card">
          <LegalRow
            label="سياسة الخصوصية"
            Icon={ShieldCheck}
            onPress={() => router.push("/privacy-policy")}
            showDivider
            iconColor={theme.primary}
            chevronColor={theme.textSecondary}
          />
          <LegalRow
            label="شروط الاستخدام"
            Icon={FileText}
            onPress={() => router.push("/terms-of-service")}
            iconColor={theme.primary}
            chevronColor={theme.textSecondary}
          />
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
