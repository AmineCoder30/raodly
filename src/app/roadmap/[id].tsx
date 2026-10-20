import SafeScreen from "@/components/layout/global/SafeScreen";
import {
  DEFAULT_ROADMAP,
  getRoadmapById,
  type ModuleNode,
  type NodeState,
} from "@/constants/roadmaps";
import { useTheme, type UseThemeReturn } from "@/hooks/use-theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ArrowRight, Check, Lock, Play } from "lucide-react-native";
import { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle as SvgCircle } from "react-native-svg";

// ── Duolingo-style layout constants ──────────────────────────────────
const NODE_SIZE = 70; // diameter of the circular button
const NODE_DEPTH = 8; // 3D bottom shadow thickness
const LABEL_HEIGHT = 38; // space for the label text below each circle
const ROW_HEIGHT = NODE_SIZE + NODE_DEPTH + LABEL_HEIGHT + 16; // total per node
const WAVE_AMPLITUDE = 55; // how far nodes sway left/right from center
const PAD_TOP = 24;
const PAD_BOTTOM = 20;

// ── Dynamic colors per state based on active theme ───────────────────
function getNodeColors(state: NodeState, theme: UseThemeReturn) {
  if (state === "completed" || state === "active") {
    return {
      face: theme.primary,
      depth: theme.primaryDark,
      icon: theme.onPrimary,
      ring: theme.isDark ? "#D8B4FE" : "#9D4EDD",
      track: theme.isDark ? "#3D2452" : "#E8D5F5",
      label: theme.textPrimary,
      subtitle: theme.textSecondary,
    };
  }

  // locked
  return {
    face: theme.neutralLight,
    depth: theme.border,
    icon: theme.disabledText,
    ring: theme.border,
    track: theme.neutralLight,
    label: theme.disabledText,
    subtitle: theme.disabledText,
  };
}

/**
 * Compute center positions for each node along a sine-wave path.
 * Returns the center (cx, cy) relative to the inner container.
 */
function computeNodeCenters(containerWidth: number, count: number) {
  const centerX = (containerWidth - PAD_TOP * 2) / 2; // horizontal midpoint
  const centers: { cx: number; cy: number }[] = [];

  for (let i = 0; i < count; i++) {
    const cy = PAD_TOP + NODE_SIZE / 2 + i * ROW_HEIGHT;
    // Sine-wave offset: 0 → right, 1 → left, 2 → right, ...
    const angle = (i * Math.PI) / 1;
    const cx = centerX + Math.sin(angle + Math.PI / 2) * WAVE_AMPLITUDE;
    centers.push({ cx, cy });
  }

  const totalHeight = PAD_TOP + count * ROW_HEIGHT + PAD_BOTTOM;
  return { centers, totalHeight };
}

/**
 * Dotted trail between two node centers — skips the area inside the circles.
 */
function trailDots(
  from: { cx: number; cy: number },
  to: { cx: number; cy: number },
  color: string,
) {
  const dots: { cx: number; cy: number; r: number; fill: string }[] = [];
  const count = 6;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    // Skip dots that land inside either node circle
    if (t < 0.15 || t > 0.85) continue;
    const cx = from.cx + (to.cx - from.cx) * t;
    const cy = from.cy + (to.cy - from.cy) * t;
    const r = t > 0.3 && t < 0.7 ? 4 : 3;
    dots.push({ cx: cx + PAD_TOP, cy: cy + PAD_TOP, r, fill: color });
  }
  return dots;
}

export default function RoadmapDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  const roadmap = useMemo(() => {
    return getRoadmapById(params.id) ?? DEFAULT_ROADMAP;
  }, [params.id]);

  // Responsive container width inside padding (16px left + 16px right = 32px)
  const containerWidth = Math.max(windowWidth - 32, 280);
  const { centers, totalHeight } = useMemo(
    () => computeNodeCenters(containerWidth, roadmap.nodes.length),
    [containerWidth, roadmap.nodes.length],
  );

  // Build SVG trail dots
  const allDots = useMemo(() => {
    const dots: { cx: number; cy: number; r: number; fill: string }[] = [];
    for (let i = 0; i < roadmap.nodes.length - 1; i++) {
      const dotColor =
        roadmap.nodes[i].state === "completed" &&
        roadmap.nodes[i + 1].state !== "locked"
          ? theme.isDark
            ? `${theme.primary}88`
            : `${theme.primaryDark}88`
          : theme.isDark
            ? `${theme.border}88`
            : `${theme.border}CC`;
      dots.push(...trailDots(centers[i], centers[i + 1], dotColor));
    }
    return dots;
  }, [roadmap.nodes, centers, theme]);

  const handleContinue = () => {
    const activeNode = roadmap.nodes.find((node) => node.state === "active");
    const nextTopicId = activeNode ? `t${activeNode.id}` : `t${roadmap.nodes[0]?.id ?? 1}`;
    router.push({
      pathname: "/[topic]",
      params: {
        topic: nextTopicId,
        roadmapId: roadmap.id,
        title: roadmap.nextSectionTitle,
      },
    });
  };

  const LEVEL_LABELS: Record<string, string> = {
    Beginner: "مبتدئ",
    Intermediate: "متوسط",
    Advanced: "متقدم",
  };

  return (
    <SafeScreen classes="p-0">
      {/* Navigation Top Header */}
      <View className="flex-row items-center justify-between border-b border-border/40 bg-background px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="flex-row items-center gap-2 p-1 active:opacity-70"
        >
          <ArrowRight size={22} color={theme.textSecondary} />
          <Text className="text-lg font-cairo-bold font-bold text-textPrimary">
            {roadmap.title}
          </Text>
        </Pressable>

        <View className="rounded-full bg-primary/10 px-3 py-1">
          <Text className="font-cairo-semibold text-xs font-semibold text-primary">
            {LEVEL_LABELS[roadmap.level] ?? roadmap.level}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Roadmap Hero Header */}
        <View className="mb-6">
          <View className="mb-2 flex-row items-center justify-center">
            <Text className="font-cairo-bold text-[11px] font-bold uppercase tracking-widest text-primary">
              مسار التعلم
            </Text>
            <Text className="font-cairo text-[11px] text-textSecondary">
              {" "}
              • {roadmap.modulesCount} وحدات
            </Text>
          </View>
        </View>

        {/* ── Duolingo-Style Path Card ── */}
        <View
          className="overflow-hidden   "
          style={{ height: totalHeight + PAD_TOP * 2, width: containerWidth }}
        >
          {/* SVG connector dots */}
          <Svg
            width={containerWidth}
            height={totalHeight + PAD_TOP * 2}
            style={StyleSheet.absoluteFill}
          >
            {allDots.map((dot, i) => (
              <SvgCircle
                key={i}
                cx={dot.cx}
                cy={dot.cy}
                r={dot.r}
                fill={dot.fill}
              />
            ))}
          </Svg>

          {/* Node buttons */}
          {roadmap.nodes.map((node, index) => {
            const c = centers[index];
            return (
              <DuoNode
                key={node.id}
                node={node}
                roadmapId={roadmap.id}
                cx={c.cx + PAD_TOP}
                cy={c.cy + PAD_TOP}
                theme={theme}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View className="border-t border-border bg-card px-5 py-4">
        <Pressable
          onPress={handleContinue}
          className="w-full flex-row items-center justify-center rounded-xl bg-primary py-3.5 shadow-sm active:opacity-90 gap-2"
        >
          <Text className="text-[15px] font-cairo-bold font-bold text-white">
            {roadmap.isCompleted
              ? `مراجعة: ${roadmap.nextSectionTitle}`
              : `متابعة: ${roadmap.nextSectionTitle}`}
          </Text>
          <ArrowLeft size={18} color={"#fff"} />
        </Pressable>
      </View>
    </SafeScreen>
  );
}

// ── Duolingo-style 3D circular node ──────────────────────────────────
function DuoNode({
  node,
  roadmapId,
  cx,
  cy,
  theme,
}: {
  node: ModuleNode;
  roadmapId: string;
  cx: number;
  cy: number;
  theme: UseThemeReturn;
}) {
  const router = useRouter();
  const colors = getNodeColors(node.state, theme);
  const ringSize = NODE_SIZE + 16;
  const ringCenter = ringSize / 2;
  const ringRadius = (ringSize - 8) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const progress = Math.max(0, Math.min(1, node.progress));

  const icon = (() => {
    switch (node.state) {
      case "completed":
        return <Check size={27} color={colors.icon} strokeWidth={3} />;
      case "active":
        return <Play size={27} color={colors.icon} fill={colors.icon} />;
      case "locked":
        return <Lock size={23} color={colors.icon} />;
    }
  })();

  const handlePress = () => {
    if (node.state === "locked") return;
    router.push({
      pathname: "/[topic]",
      params: {
        topic: `t${node.id}`,
        roadmapId,
        title: node.title,
      },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={node.state === "locked"}
      style={{
        position: "absolute",
        left: cx - NODE_SIZE / 2,
        top: cy - NODE_SIZE / 2,
        width: NODE_SIZE,
        alignItems: "center",
      }}
    >
      {/* Circular progress border */}
      <Svg
        width={ringSize}
        height={ringSize}
        style={{
          position: "absolute",
          top: -8,
          left: -8,
        }}
      >
        {/* Background track */}
        <SvgCircle
          cx={ringCenter}
          cy={ringCenter}
          r={ringRadius}
          fill="none"
          stroke={colors.track}
          strokeWidth={4}
        />

        {/* Progress arc */}
        {progress > 0 && (
          <SvgCircle
            cx={ringCenter}
            cy={ringCenter}
            r={ringRadius}
            fill="none"
            stroke={colors.ring}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - progress)}
            rotation={-90}
            origin={`${ringCenter}, ${ringCenter}`}
          />
        )}
      </Svg>

      {/* 3D bottom layer */}
      <View
        style={{
          position: "absolute",
          top: 5,
          width: NODE_SIZE,
          height: NODE_SIZE,
          borderRadius: NODE_SIZE / 2,
          backgroundColor: colors.depth,
        }}
      />

      {/* Main node button surface */}
      <View
        style={{
          width: NODE_SIZE,
          height: NODE_SIZE,
          borderRadius: NODE_SIZE / 2,
          backgroundColor: colors.face,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: node.state === "active" ? 2 : 0,
          borderColor: theme.isDark ? theme.border : theme.primaryDark,
        }}
      >
        {icon}
      </View>

      {/* Completion badge */}
      {node.state === "completed" && (
        <View
          style={{
            position: "absolute",
            top: -5,
            right: -5,
            width: 23,
            height: 23,
            borderRadius: 12,
            backgroundColor: theme.success,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: theme.card,
          }}
        >
          <Check size={13} color="#FFFFFF" strokeWidth={3} />
        </View>
      )}

      {/* Module title */}
      <Text
        numberOfLines={1}
        style={{
          fontFamily: "Cairo-Bold",
          color: colors.label,
          fontSize: 11,
          fontWeight: "700",
          textAlign: "center",
          marginTop: NODE_DEPTH + 6,
          width: NODE_SIZE + 40,
        }}
      >
        {node.title}
      </Text>

      {/* Module subtitle */}
      <Text
        numberOfLines={1}
        style={{
          fontFamily: "Cairo-Regular",
          color: colors.subtitle,
          fontSize: 10,
          textAlign: "center",
          marginTop: 2,
          width: NODE_SIZE + 40,
        }}
      >
        {node.subtitle}
      </Text>
    </Pressable>
  );
}
