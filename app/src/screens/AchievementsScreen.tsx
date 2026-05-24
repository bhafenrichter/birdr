import React from "react";
import { View, StyleSheet, SectionList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Check, Lock } from "lucide-react-native";
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
  AchievementColors,
} from "../theme";
import { Text, CircleBtn } from "../components/atoms";
import { useAchievements } from "../hooks/useApi";
import type { UserAchievement } from "../types/api";

export const AchievementsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: achievements } = useAchievements();
  const allAchievements = achievements ?? [];

  const unlocked = allAchievements.filter((a) => a.unlocked_at);
  const inProgress = allAchievements.filter(
    (a) => !a.unlocked_at && a.progress > 0
  );
  const locked = allAchievements.filter(
    (a) => !a.unlocked_at && a.progress === 0
  );

  const totalCount = allAchievements.length;
  const overallProgress = totalCount > 0 ? unlocked.length / totalCount : 0;

  const sections = [
    ...(inProgress.length > 0
      ? [{ title: "In progress", data: inProgress }]
      : []),
    ...(unlocked.length > 0 ? [{ title: "Unlocked", data: unlocked }] : []),
    ...(locked.length > 0 ? [{ title: "Locked", data: locked }] : []),
  ];

  return (
    <SafeAreaView style={styles.container} testID="achievements-screen">
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
        <Text variant="bold" size="2xl" color={Colors.ink} testID="achievements-progress-count">
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

      {/* Flat list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title } }) => (
          <Text
            variant="semiBold"
            size="base"
            color={Colors.ink}
            testID={`achievements-section-${title}`}
            style={{ marginTop: Spacing.lg, marginBottom: Spacing.sm }}
          >
            {title}
          </Text>
        )}
        renderItem={({ item }) => <AchievementRow achievement={item} />}
      />
    </SafeAreaView>
  );
};

const AchievementRow: React.FC<{ achievement: UserAchievement }> = ({
  achievement,
}) => {
  const isUnlocked = !!achievement.unlocked_at;
  const categoryColor =
    AchievementColors[achievement.category] ?? Colors.sage;

  return (
    <View style={styles.achievementRow} testID={`achievement-${achievement.achievement_id}`}>
      {/* Status icon */}
      <View
        style={[
          styles.achievementIcon,
          {
            backgroundColor: isUnlocked ? categoryColor : Colors.paper,
          },
        ]}
      >
        {isUnlocked ? (
          <Check size={16} color={Colors.white} strokeWidth={2.5} />
        ) : (
          <Lock size={14} color={Colors.inkFaint} strokeWidth={1.5} />
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text
          variant="medium"
          size="base"
          color={Colors.ink}
          testID={`achievement-name-${achievement.achievement_id}`}
        >
          {achievement.achievement_id}
        </Text>

        {/* Progress bar for in-progress */}
        {!isUnlocked && achievement.progress > 0 && (
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

      {/* Right side: date or progress */}
      <Text
        variant="regular"
        size="xs"
        color={Colors.inkFaint}
        testID={`achievement-status-${achievement.achievement_id}`}
      >
        {isUnlocked
          ? formatShortDate(achievement.unlocked_at!)
          : `${Math.round(achievement.progress * 100)}%`}
      </Text>
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["4xl"],
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
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
