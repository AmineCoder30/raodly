import SafeScreen from "@/components/layout/global/SafeScreen";
import { useTheme } from "@/hooks/use-theme";
import { router } from "expo-router";
import { ArrowRight, FileText } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

type LegalDocumentProps = {
  title: string;
  intro: string;
  sections: LegalSection[];
  children?: ReactNode;
};

export function LegalDocument({
  title,
  intro,
  sections,
  children,
}: LegalDocumentProps) {
  const theme = useTheme();

  return (
    <SafeScreen classes="p-0">
      <View
        className="flex-row items-center justify-between border-b border-border/40 bg-background px-5 py-3"
        style={{ direction: "rtl" }}
      >
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-2 p-1 active:opacity-70"
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="العودة"
        >
          <ArrowRight size={22} color={theme.textPrimary} />
          <Text className="font-cairo-bold text-xl font-bold text-textPrimary">
            {title}
          </Text>
        </Pressable>
        <View className="rounded-lg bg-primary/10 p-2">
          <FileText size={20} color={theme.primary} />
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="px-4 pb-10 pt-6"
        style={{ direction: "rtl" }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-5">
          <Text className="mb-2 text-right font-cairo-bold text-2xl font-bold leading-9 text-textPrimary">
            {title}
          </Text>
          <Text className="text-right font-cairo text-sm leading-7 text-textSecondary">
            {intro}
          </Text>
        </View>

        <View className="mb-5 rounded-xl border border-border bg-card px-4 py-3">
          <Text className="text-right font-cairo text-xs leading-6 text-textSecondary">
            آخر تحديث: 25 أكتوبر 2026
          </Text>
        </View>

        {sections.map((section) => (
          <View
            key={section.title}
            className="mb-4 rounded-xl border border-border bg-card p-4"
          >
            <Text className="mb-2 text-right font-cairo-bold text-base font-bold text-primary">
              {section.title}
            </Text>
            {section.paragraphs.map((paragraph) => (
              <Text
                key={paragraph}
                className="mb-2 text-right font-cairo text-sm leading-7 text-textPrimary last:mb-0"
              >
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        {children}
      </ScrollView>
    </SafeScreen>
  );
}
