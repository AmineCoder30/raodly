import SafeScreen from "@/components/layout/global/SafeScreen";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";
import { getGeminiApiKey, setGeminiApiKey } from "@/services/secureSettings";
import { router } from "expo-router";
import { ArrowRight, Check, Moon, Palette, Sun } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

export default function SettingsScreen() {
  const { colorScheme, isDark, setColorScheme, toggleColorScheme } =
    useColorScheme();
  const theme = useTheme();
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void getGeminiApiKey().then((value) => setApiKey(value ?? ""));
  }, []);

  const saveKey = async () => {
    await setGeminiApiKey(apiKey);
    setSaved(true);
  };

  const PALETTE_ITEMS = [
    { label: "الأساسي (Primary)", color: theme.primary },
    { label: "الأساسي الداكن (Dark)", color: theme.primaryDark },
    { label: "الثانوي (Secondary)", color: theme.secondary },
    { label: "الخلفية (Background)", color: theme.background },
    { label: "البطاقة (Card)", color: theme.card },
    { label: "الحدود (Border)", color: theme.border },
    { label: "النص الأساسي", color: theme.textPrimary },
    { label: "النص الثانوي", color: theme.textSecondary },
    { label: "نجاح (Success)", color: theme.success },
    { label: "تحذير (Warning)", color: theme.warning },
    { label: "خطأ (Error)", color: theme.error },
  ];

  return (
    <SafeScreen classes="p-0">
      {/* Header */}
      <View className="flex-row px-5 py-3 bg-background items-center justify-between border-b border-border/40">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-2 p-1 active:opacity-70"
          hitSlop={10}
        >
          <ArrowRight size={22} color={theme.textPrimary} />
          <Text className="text-textPrimary text-xl font-cairo-bold font-bold">
            الإعدادات
          </Text>
        </Pressable>
        <Pressable
          onPress={() => toggleColorScheme()}
          className="p-2 bg-primary/10 rounded-lg active:opacity-70"
        >
          {isDark ? (
            <Sun size={20} color={theme.primary} />
          ) : (
            <Moon size={20} color={theme.primary} />
          )}
        </Pressable>
      </View>

      <ScrollView className="flex-1 bg-background px-4 pt-6">
        <Text className="mb-3 text-textSecondary text-xs font-cairo uppercase tracking-wider text-start">
          توليد الدروس بالذكاء الاصطناعي
        </Text>
        <View className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-textPrimary font-cairo-semibold font-semibold text-base text-start">
            Gemini API Key
          </Text>
          <Text className="mt-1 text-textSecondary text-xs leading-relaxed text-start font-cairo">
            يُحفظ بأمان على هذا الجهاز ولا يُرفع أبداً إلى Git. استخدم مفتاحك
            الخاص لهذا النموذج الأولي.
          </Text>
          <TextInput
            value={apiKey}
            onChangeText={(value) => {
              setApiKey(value);
              setSaved(false);
            }}
            placeholder="AIza..."
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            className="mt-4 rounded-lg border border-border bg-background px-3 py-3 text-textPrimary text-left font-cairo"
          />
          <Pressable
            onPress={() => void saveKey()}
            className="mt-3 items-center rounded-lg bg-primary px-4 py-3 active:opacity-80"
          >
            <Text className="font-cairo-semibold font-semibold text-onPrimary">
              {saved ? "تم الحفظ بأمان" : "حفظ API Key"}
            </Text>
          </Pressable>
        </View>

        <Text className="text-textSecondary text-xs font-cairo uppercase tracking-wider mb-3 text-start">
          المظهر والسمة
        </Text>

        {/* Theme Mode Selector Card */}
        <View className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-textPrimary font-cairo-semibold font-semibold text-base text-start">
                وضع الألوان
              </Text>
              <Text className="text-textSecondary text-xs text-start font-cairo">
                الوضع الحالي:{" "}
                <Text className="text-primary font-cairo-bold font-bold">
                  {colorScheme === "dark" ? "الداكن" : "الفاتح"}
                </Text>
              </Text>
            </View>
            <View className="p-2 bg-primary/15 rounded-lg">
              <Palette size={20} color={theme.primary} />
            </View>
          </View>

          {/* Options */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setColorScheme("light")}
              className={`flex-1 flex-row items-center justify-center py-3 px-3 rounded-lg border gap-2 ${
                !isDark
                  ? "bg-primary/10 border-primary"
                  : "bg-neutralLight border-border"
              } active:opacity-80`}
            >
              <Sun
                size={16}
                color={!isDark ? theme.primary : theme.textSecondary}
              />
              <Text
                className={`text-sm font-cairo-medium font-medium ${
                  !isDark
                    ? "text-primary font-cairo-bold font-bold"
                    : "text-textSecondary"
                }`}
              >
                فاتح
              </Text>
              {!isDark && <Check size={14} color={theme.primary} />}
            </Pressable>

            <Pressable
              onPress={() => setColorScheme("dark")}
              className={`flex-1 flex-row items-center justify-center py-3 px-3 rounded-lg border gap-2 ${
                isDark
                  ? "bg-primary/10 border-primary"
                  : "bg-neutralLight border-border"
              } active:opacity-80`}
            >
              <Moon
                size={16}
                color={isDark ? theme.primary : theme.textSecondary}
              />
              <Text
                className={`text-sm font-cairo-medium font-medium ${
                  isDark
                    ? "text-primary font-cairo-bold font-bold"
                    : "text-textSecondary"
                }`}
              >
                داكن
              </Text>
              {isDark && <Check size={14} color={theme.primary} />}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
