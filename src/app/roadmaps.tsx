import SafeScreen from "@/components/layout/global/SafeScreen";
import { RoadmapCard } from "@/components/roadmap-card";
import { ROADMAPS } from "@/constants/roadmaps";
import { useTheme } from "@/hooks/use-theme";
import { router } from "expo-router";
import {
  Globe,
  Plus,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react-native";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RoadmapsScreen() {
  const theme = useTheme();

  const handleOpenRoadmap = (id: string) => {
    router.push({
      pathname: "/roadmap/[id]",
      params: { id },
    });
  };

  return (
    <SafeScreen classes="p-0">
      {/* Header */}
      <View className="flex-row px-5 py-2 bg-background items-center justify-between border-b border-border/40">
        <Pressable
          onPress={() => router.push("/settings")}
          className="flex-row items-center gap-1.5 bg-primary/10 rounded-md p-2 active:opacity-70"
        >
          <Settings size={22} color={theme.textSecondary} />
        </Pressable>
        <View className="flex-row items-center gap-2">
          {/* Logo */}
          <Text className="text-textPrimary text-2xl font-bold">Roadly</Text>
          <Image
            source={require("@/assets/images/image.png")}
            className="w-10 h-10"
            resizeMode="cover"
          />
        </View>
      </View>

      <ScrollView className="flex-1 bg-background px-4 pt-6">
        {/* Main Title Area */}
        <View className="flex-row justify-between items-center mb-2 mt-4">
          <Text className="text-textPrimary text-4xl font-cairo-bold font-bold text-start">
            مسارات التعلم
          </Text>
        </View>
        <Text className="text-textSecondary text-base mb-6 leading-relaxed text-start font-cairo">
          اختر ما ترغب بتعلمه أو اصنع مسار تعلّمك المحلي الخاص.
        </Text>

        {/* Create Button */}
        <Pressable className="bg-primary flex-row justify-center items-center py-3.5 rounded-xl mb-4 active:opacity-90 shadow-sm gap-2">
          <Plus size={20} color={"#fff"} />
          <Text className="text-white font-cairo-semibold font-semibold text-base">
            إنشاء مسار تعلم
          </Text>
        </Pressable>

        {/* Search Bar */}
        <View className="flex-row items-center bg-card border border-border rounded-xl px-3 py-2 mb-6 shadow-sm gap-2">
          <Search size={18} color={theme.textSecondary} />
          <TextInput
            placeholder="ابحث عن المسارات، المواضيع..."
            placeholderTextColor={theme.textSecondary}
            className="flex-1 text-textPrimary text-sm text-right font-cairo"
          />
        </View>

        {/* Tabs */}
        <View className="flex-row bg-neutralLight rounded-lg p-1.5 mb-6">
          <View className="flex-1 bg-card border border-border/50 rounded-md flex-row items-center justify-center py-2 shadow-sm gap-2">
            <Text className="text-textPrimary font-cairo-medium font-medium text-xs">
              مساراتي
            </Text>
            <View className="bg-primary/15 rounded-full px-2.5 py-1">
              <Text className="text-primary text-[10px] font-cairo-bold font-bold">
                3
              </Text>
            </View>
          </View>
          <View className="flex-1 rounded-md flex-row items-center justify-center py-2 gap-2">
            <Text className="text-textSecondary font-cairo-medium font-medium text-xs">
              المجتمع
            </Text>
            <View className="bg-transparent rounded-full px-2.5 py-1">
              <Text className="text-textSecondary text-[10px] font-cairo">
                12
              </Text>
            </View>
          </View>
        </View>

        {/* Cards List */}
        {ROADMAPS.map((roadmap) => (
          <RoadmapCard
            key={roadmap.id}
            level={roadmap.level}
            hours={roadmap.hours}
            title={roadmap.title}
            description={roadmap.description}
            topicsCompleted={roadmap.topicsCompleted}
            topicsTotal={roadmap.topicsTotal}
            nextSectionTitle={roadmap.nextSectionTitle}
            isCompleted={roadmap.isCompleted}
            onPress={() => handleOpenRoadmap(roadmap.id)}
          />
        ))}

        {/* Community Catalog Section */}
        <View className="bg-card border border-border rounded-xl p-4 mt-2 mb-8 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center gap-2">
              <Globe size={18} color={theme.primary} />
              <Text className="text-primary text-xs font-cairo-bold font-medium tracking-widest uppercase">
                دليل المجتمع
              </Text>
            </View>
            <Text className="text-textSecondary text-xs font-cairo">
              12 مسار متاح
            </Text>
          </View>

          <Text className="text-textSecondary text-sm mb-4 leading-relaxed text-right font-cairo">
            استكشف مسارات منتقاة ومراجعة من قِبل مهندسين متميزين:{" "}
            <Text className="font-cairo-bold font-bold text-textPrimary">
              React 19 Concurrency، تفاصيل بايت كود Python 3.13،
            </Text>{" "}
            ومعمارية التخزين الموزع.
          </Text>

          <Pressable className="bg-neutralLight flex-row justify-center items-center py-3.5 rounded-lg border border-border active:opacity-80">
            <Text className="text-textPrimary text-sm font-cairo-medium font-medium">
              تصفح جميع المسارات الـ 12 ←
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-center gap-2 mb-16">
          <ShieldCheck size={14} color={theme.textSecondary} />
          <Text className="text-textSecondary text-[11px] font-cairo text-center">
            جميع البيانات محفوظة على جهازك. لا يلزم إنشاء حساب.
          </Text>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
