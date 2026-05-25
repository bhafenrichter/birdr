import React, { useMemo } from "react";
import { View, StyleSheet, SectionList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Check, Lock, Trophy } from "lucide-react-native";
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
  AchievementColors,
} from "../theme";
import { Text, CircleBtn } from "../components/atoms";
import { useAchievements } from "../hooks/useApi";
import {
  ALL_ACHIEVEMENTS,
  getAchievement,
  CATEGORY_COLOR_KEY,
  CATEGORY_LABELS,
} from "../data/achievements";
import type { AchievementCategory } from "../types/api";

interface AchievementRowData {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  progress: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export const AchievementsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: userAchievements } = useAchievements();
  const userMap = useMemo(() => {
    const map = new Map<
      string,
      { progress: number; unlocked_at: string | null }
    >();
    for (const ua of userAchievements ?? []) {
      map.set(ua.achievement_id, {
        progress: ua.progress,
        unlocked_at: ua.unlocked_at,
      });
    }
    return map;
  }, [userAchievements]);

  // Merge registry with user progress
  const allRows: AchievementRowData[] = useMemo(() => {
    return ALL_ACHIEVEMENTS.map((def) => {
      const user = userMap.get(def.id);
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        category: def.category,
        progress: user?.progress ?? 0,
        unlocked: !!user?.unlocked_at,
        unlockedAt: user?.unlocked_at ?? null,
      };
    });
  }, [userMap]);

  const unlocked = allRows.filter((a) => a.unlocked);
  const inProgress = allRows.filter((a) => !a.unlocked && a.progress > 0);
  const locked = allRows.filter((a) => !a.unlocked && a.progress === 0);

  const totalCount = allRows.length;
  const overallProgress = totalCount > 0 ? unlocked.length / totalCount : 0;

  const sections = [
    ...(inProgress.length > 0
      ? [{ title: "In progress", data: inProgress }]
      : []),
    ...(unlocked.length > 0 ? [{ title: "Unlocked", data: unlocked }] : []),
    ...(locked.length > 0 ? [{ title: "Locked", data: locked }] : []),
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]} testID="achievements-screen">
      {/* Top bar */}
      <View style={styles.topBar}>
        <CircleBtn
          icon={ArrowLeft}
          size={36}
          backgroundColor={Colors.white}
          color={Colors.ink}
          onPress={() => navigation.goBack()}
          testID="achievements-back"
        />
        <Text
          variant="semiBold"
          size="md"
          color={Colors.ink}
          testID="achievements-title"
        >
          Achievements
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Overall progress card */}
      <View style={styles.progressCard} testID="achievements-progress">
        <View style={styles.progressIconWrap}>
          <Trophy size={28} color={Colors.saffron} strokeWidth={1.5} />
        </View>
        <Text
          variant="bold"
          size="2xl"
          color={Colors.ink}
          testID="achievements-progress-count"
        >
          {`${unlocked.length} of ${totalCount}`}
        </Text>
        <Text
          variant="regular"
          size="sm"
          color={Colors.inkSoft}
          testID="achievements-progress-label"
        >
          {`${Math.round(overallProgress * 100)}% complete`}
        </Text>
        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${overallProgress * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Achievement list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
        renderSectionHeader={({ section: { title, data } }) => (
          <View style={styles.sectionHeader}>
            <Text
              variant="semiBold"
              size="base"
              color={Colors.ink}
              testID={`achievements-section-${title}`}
            >
              {title}
            </Text>
            <Text variant="regular" size="xs" color={Colors.inkFaint}>
              {data.length}
            </Text>
          </View>
        )}
        renderItem={({ item }) => <AchievementRow achievement={item} />}
      />
    </SafeAreaView>
  );
};

const AchievementRow: React.FC<{ achievement: AchievementRowData }> = ({
  achievement,
}) => {
  const colorKey = CATEGORY_COLOR_KEY[achievement.category] ?? "collection";
  const categoryColor =
    (AchievementColors as Record<string, string>)[colorKey] ?? Colors.sage;
  const categoryLabel =
    CATEGORY_LABELS[achievement.category] ?? achievement.category;

  return (
    <View
      style={styles.achievementRow}
      testID={`achievement-${achievement.id}`}
    >
      {/* Category color icon */}
      <View
        style={[
          styles.achievementIcon,
          {
            backgroundColor: achievement.unlocked
              ? categoryColor
              : `${categoryColor}20`,
          },
        ]}
      >
        {achievement.unlocked ? (
          <Check size={16} color={Colors.white} strokeWidth={2.5} />
        ) : (
          <Lock
            size={14}
            color={achievement.progress > 0 ? categoryColor : Colors.inkFaint}
            strokeWidth={1.5}
          />
        )}
      </View>

      {/* Info */}
      <View style={styles.achievementInfo}>
        <Text
          variant="medium"
          size="base"
          color={achievement.unlocked ? Colors.ink : Colors.inkSoft}
          numberOfLines={1}
          testID={`achievement-name-${achievement.id}`}
        >
          {achievement.name}
        </Text>
        <Text
          variant="regular"
          size="xs"
          color={Colors.inkFaint}
          numberOfLines={1}
          testID={`achievement-desc-${achievement.id}`}
        >
          {achievement.unlocked
            ? `${categoryLabel} · Earned ${formatShortDate(achievement.unlockedAt!)}`
            : achievement.description}
        </Text>

        {/* Progress bar for in-progress */}
        {!achievement.unlocked && achievement.progress > 0 && (
          <View style={styles.miniProgressBg}>
            <View
              style={[
                styles.miniProgressFill,
                {
                  width: `${achievement.progress * 100}%`,
                  backgroundColor: categoryColor,
                },
              ]}
            />
          </View>
        )}
      </View>

      {/* Right side */}
      {!achievement.unlocked && achievement.progress > 0 && (
        <Text
          variant="semiBold"
          size="xs"
          color={categoryColor}
          testID={`achievement-pct-${achievement.id}`}
        >
          {`${Math.round(achievement.progress * 100)}%`}
        </Text>
      )}
    </View>
  );
};

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  progressCard: {
    marginHorizontal: Spacing.xl,
    padding: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    ...Shadows.sm,
  },
  progressIconWrap: {
    marginBottom: Spacing.sm,
  },
  progressBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: Colors.paper,
    borderRadius: 3,
    marginTop: Spacing.md,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    backgroundColor: Colors.sage,
    borderRadius: 3,
  },
  listContent: {
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["4xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.cream,
  },
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.paper,
  },
  achievementIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementInfo: {
    flex: 1,
    gap: 2,
  },
  miniProgressBg: {
    height: 4,
    backgroundColor: Colors.paper,
    borderRadius: 2,
    marginTop: Spacing.xs,
    overflow: "hidden",
  },
  miniProgressFill: {
    height: 4,
    borderRadius: 2,
  },
});

export default AchievementsScreen;
