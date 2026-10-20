import { useTheme } from "@/hooks/use-theme";
import { CheckCircle2, MoreHorizontal, PlayCircle } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export type RoadmapCardProps = {
  level: "Beginner" | "Intermediate" | "Advanced";
  hours: number;
  title: string;
  description: string;
  topicsCompleted: number;
  topicsTotal: number;
  nextSectionTitle?: string;
  isCompleted?: boolean;
  onPress?: () => void;
};

const LEVEL_LABELS: Record<RoadmapCardProps["level"], string> = {
  Beginner: "مبتدئ",
  Intermediate: "متوسط",
  Advanced: "متقدم",
};

export function RoadmapCard({
  level,
  hours,
  title,
  description,
  topicsCompleted,
  topicsTotal,
  nextSectionTitle,
  isCompleted,
  onPress,
}: RoadmapCardProps) {
  const theme = useTheme();
  const progressPercent = Math.round((topicsCompleted / topicsTotal) * 100);

  const levelBgColor =
    level === "Beginner" ? "bg-neutralLight" : "bg-warning/20";
  const levelTextColor =
    level === "Beginner" ? "text-textSecondary" : "text-warning";

  return (
    <Pressable
      onPress={onPress}
      className="bg-card border border-border rounded-xl p-4 mb-4 active:opacity-80 shadow-sm"
    >
      {/* Top Header */}
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center gap-3">
          <View className={`${levelBgColor} px-2 py-0.5 rounded-md`}>
            <Text
              className={`text-xs font-cairo-medium font-medium ${levelTextColor}`}
            >
              {LEVEL_LABELS[level] ?? level}
            </Text>
          </View>
        </View>
        <MoreHorizontal size={20} color={theme.textSecondary} />
      </View>

      {/* Content */}
      <Text className="text-textPrimary text-xl font-cairo-bold font-bold mb-2 text-start">
        {title}
      </Text>
      <Text className="text-textSecondary text-sm mb-4 leading-relaxed text-start font-cairo">
        {description}
      </Text>

      {/* Progress */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-textPrimary text-xs font-cairo-medium font-medium">
          {topicsCompleted} / {topicsTotal} موضوع
        </Text>
        <View className="flex-row items-center gap-1">
          {isCompleted && <CheckCircle2 size={12} color={theme.success} />}
          <Text
            className={`text-xs font-cairo-bold font-bold ${
              isCompleted ? "text-success" : "text-primary"
            }`}
          >
            {progressPercent}%
          </Text>
        </View>
      </View>

      <View className="w-full h-1.5 bg-neutralLight rounded-full overflow-hidden mb-4">
        <View
          className={`h-full rounded-full ${
            isCompleted ? "bg-success" : "bg-primary"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </View>

      {/* Footer action */}
      {isCompleted ? (
        <View className="flex-row justify-between items-center bg-neutralLight p-3 rounded-lg border border-border">
          <Text className="text-textSecondary text-xs font-cairo">
            محفوظ في التخزين المحلي
          </Text>
          <Text className="text-primary text-xs font-cairo-medium font-medium">
            مراجعة المسار
          </Text>
        </View>
      ) : (
        <Pressable className="flex-row items-center justify-between border-t border-border pt-3">
          <View className="flex-row items-center gap-2">
            <PlayCircle size={18} color={theme.primary} />
            <Text className="text-textSecondary text-xs font-cairo-medium font-medium">
              متابعة: {nextSectionTitle}
            </Text>
          </View>
          <Text className="text-textSecondary text-lg font-bold">›</Text>
        </Pressable>
      )}
    </Pressable>
  );
}
