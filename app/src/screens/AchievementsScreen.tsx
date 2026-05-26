import React, { useMemo, useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  ScrollView,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft,
  Check,
  Trophy,
  Flame,
  BookOpen,
  Feather,
  TreePine,
  Music,
  Crosshair,
  Waves,
  Bird,
  Shell,
  Anchor,
  Target,
  Axe,
  Wind,
  Wheat,
  Cactus,
  Droplets,
  Mountain,
  Snowflake,
  Building2,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { useGlobalSheet } from "../contexts/BottomSheetProvider";
import Skeleton from "react-native-reanimated-skeleton";
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
  AchievementColors,
} from "../theme";
import { Text, CircleBtn } from "../components/atoms";
import {
  useAchievements,
  useCards,
  useStreak,
  useAllSpecies,
} from "../hooks/useApi";
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

// Parse target number from achievement ID (e.g. "collection_50" → 50, "streak_7" → 7)
function parseTarget(id: string): number | null {
  const match = id.match(/_(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// Mastery tier percentages keyed by tier suffix
const MASTERY_PCT: Record<string, number> = {
  spotter: 0.05,
  apprentice: 0.1,
  adept: 0.25,
  expert: 0.5,
  master: 1.0,
};

export const AchievementsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: userAchievements, isLoading: achievementsLoading } =
    useAchievements();
  const { data: cards, isLoading: cardsLoading } = useCards();
  const { data: streakData } = useStreak();
  const { data: allSpecies, isLoading: speciesLoading } = useAllSpecies();

  const isLoading = achievementsLoading || cardsLoading || speciesLoading;

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

  // Compute derived progress from live data
  const derivedProgress = useMemo(() => {
    const spottedCount = cards?.length ?? 0;
    const currentStreak = streakData?.current_streak ?? 0;
    const species = allSpecies ?? [];

    // Count spotted species per type and habitat
    const spottedIds = new Set((cards ?? []).map((c) => c.species_id));
    const spottedByType = new Map<string, number>();
    const spottedByHabitat = new Map<string, number>();
    const totalByType = new Map<string, number>();
    const totalByHabitat = new Map<string, number>();

    for (const sp of species) {
      const typeId = sp.species_type_id;
      const habitatId = sp.primary_habitat_id;
      totalByType.set(typeId, (totalByType.get(typeId) ?? 0) + 1);
      totalByHabitat.set(habitatId, (totalByHabitat.get(habitatId) ?? 0) + 1);
      if (spottedIds.has(sp.id)) {
        spottedByType.set(typeId, (spottedByType.get(typeId) ?? 0) + 1);
        spottedByHabitat.set(
          habitatId,
          (spottedByHabitat.get(habitatId) ?? 0) + 1,
        );
      }
    }

    // Build slug→type/habitat maps for ID matching
    const typeSlugToId = new Map<string, string>();
    const habitatSlugToId = new Map<string, string>();
    const seenTypes = new Set<string>();
    const seenHabitats = new Set<string>();
    for (const sp of species) {
      if (!seenTypes.has(sp.species_type_id)) {
        seenTypes.add(sp.species_type_id);
        const name = (sp as any).species_type_name ?? "";
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        typeSlugToId.set(slug, sp.species_type_id);
      }
      if (!seenHabitats.has(sp.primary_habitat_id)) {
        seenHabitats.add(sp.primary_habitat_id);
        const name = (sp as any).habitat_name ?? "";
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        habitatSlugToId.set(slug, sp.primary_habitat_id);
      }
    }

    const progress = new Map<string, number>();

    for (const def of ALL_ACHIEVEMENTS) {
      if (def.category === "collection") {
        const target = parseTarget(def.id);
        if (target) progress.set(def.id, Math.min(spottedCount / target, 1));
      } else if (def.category === "streak") {
        const target = parseTarget(def.id);
        if (target) progress.set(def.id, Math.min(currentStreak / target, 1));
      } else if (def.category === "family") {
        // ID format: family_{slug}_{tier}
        const parts = def.id.replace("family_", "").split("_");
        const tier = parts.pop()!;
        const slug = parts.join("-");
        const typeId = typeSlugToId.get(slug);
        const pct = MASTERY_PCT[tier] ?? 1;
        if (typeId) {
          const total = totalByType.get(typeId) ?? 0;
          const spotted = spottedByType.get(typeId) ?? 0;
          const target = Math.ceil(total * pct);
          progress.set(def.id, target > 0 ? Math.min(spotted / target, 1) : 0);
        }
      } else if (def.category === "habitat") {
        // ID format: habitat_{slug}_{tier}
        const parts = def.id.replace("habitat_", "").split("_");
        const tier = parts.pop()!;
        const slug = parts.join("-");
        const habitatId = habitatSlugToId.get(slug);
        const pct = MASTERY_PCT[tier] ?? 1;
        if (habitatId) {
          const total = totalByHabitat.get(habitatId) ?? 0;
          const spotted = spottedByHabitat.get(habitatId) ?? 0;
          const target = Math.ceil(total * pct);
          progress.set(def.id, target > 0 ? Math.min(spotted / target, 1) : 0);
        }
      }
    }

    return progress;
  }, [cards, streakData, allSpecies]);

  // Merge registry with user progress + derived progress
  const allRows: AchievementRowData[] = useMemo(() => {
    return ALL_ACHIEVEMENTS.map((def) => {
      const user = userMap.get(def.id);
      const unlocked = !!user?.unlocked_at;
      const progress = unlocked ? 1 : (derivedProgress.get(def.id) ?? 0);
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        category: def.category,
        progress,
        unlocked,
        unlockedAt: user?.unlocked_at ?? null,
      };
    });
  }, [userMap, derivedProgress]);

  const unlocked = allRows.filter((a) => a.unlocked);
  const inProgress = allRows.filter((a) => !a.unlocked && a.progress > 0);
  const locked = allRows.filter((a) => !a.unlocked && a.progress === 0);

  const totalCount = allRows.length;
  const overallProgress = totalCount > 0 ? unlocked.length / totalCount : 0;

  type Filter = "all" | "collection" | "family" | "habitat" | "streak";
  const [filter, setFilter] = useState<Filter>("all");

  const filteredRows = useMemo(() => {
    const rows =
      filter === "all" ? allRows : allRows.filter((a) => a.category === filter);
    return [...rows].sort((a, b) => b.progress - a.progress);
  }, [filter, allRows]);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "collection", label: "Collection" },
    { key: "family", label: "Species Type" },
    { key: "habitat", label: "Habitat" },
    { key: "streak", label: "Streaks" },
  ];

  const { open: openSheet } = useGlobalSheet();

  const spottedIds = useMemo(
    () => new Set((cards ?? []).map((c) => c.species_id)),
    [cards],
  );

  const getRelevantSpecies = useCallback(
    (achievement: AchievementRowData) => {
      const species = allSpecies ?? [];
      const id = achievement.id;

      if (achievement.category === "collection") {
        return species
          .filter((s) => spottedIds.has(s.id))
          .map((s) => ({
            id: s.id,
            name: s.common_name,
            family: s.family,
            spotted: true,
          }));
      }

      if (achievement.category === "streak") return [];

      if (achievement.category === "family") {
        const parts = id.replace("family_", "").split("_");
        parts.pop();
        const slug = parts.join("-");
        const matchType = species.find((s) => {
          const name = (s as any).species_type_name ?? "";
          return (
            name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "") === slug
          );
        });
        if (!matchType) return [];
        return species
          .filter((s) => s.species_type_id === matchType.species_type_id)
          .map((s) => ({
            id: s.id,
            name: s.common_name,
            family: s.family,
            spotted: spottedIds.has(s.id),
          }))
          .sort((a, b) =>
            a.spotted === b.spotted
              ? a.name.localeCompare(b.name)
              : a.spotted
                ? -1
                : 1,
          );
      }

      if (achievement.category === "habitat") {
        const parts = id.replace("habitat_", "").split("_");
        parts.pop();
        const slug = parts.join("-");
        const matchHabitat = species.find((s) => {
          const name = (s as any).habitat_name ?? "";
          return (
            name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "") === slug
          );
        });
        if (!matchHabitat) return [];
        return species
          .filter(
            (s) => s.primary_habitat_id === matchHabitat.primary_habitat_id,
          )
          .map((s) => ({
            id: s.id,
            name: s.common_name,
            family: s.family,
            spotted: spottedIds.has(s.id),
          }))
          .sort((a, b) =>
            a.spotted === b.spotted
              ? a.name.localeCompare(b.name)
              : a.spotted
                ? -1
                : 1,
          );
      }

      return [];
    },
    [allSpecies, spottedIds],
  );

  const handleAchievementPress = useCallback(
    (achievement: AchievementRowData) => {
      const colorKey = CATEGORY_COLOR_KEY[achievement.category] ?? "collection";
      const sheetColor =
        (AchievementColors as Record<string, string>)[colorKey] ?? Colors.sage;
      const relevant = getRelevantSpecies(achievement);

      openSheet(
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text variant="semiBold" size="lg" color={Colors.ink}>
                  {achievement.name}
                </Text>
                <Text
                  variant="regular"
                  size="xs"
                  color={Colors.inkSoft}
                  style={{ marginTop: 2 }}
                >
                  {achievement.description}
                </Text>
                {achievement.category !== "streak" && (
                  <Text
                    variant="medium"
                    size="xs"
                    color={Colors.inkFaint}
                    style={{ marginTop: Spacing.sm }}
                  >
                    {`${relevant.filter((s) => s.spotted).length} of ${relevant.length} species`}
                  </Text>
                )}
              </View>
              <View style={styles.sheetRing}>
                <ProgressRing
                  progress={achievement.progress}
                  size={56}
                  strokeWidth={4}
                  color={sheetColor}
                  trackColor={`${sheetColor}20`}
                />
                <View style={styles.sheetRingLabel}>
                  <Text
                    variant="bold"
                    size="sm"
                    color={
                      achievement.progress > 0 ? sheetColor : Colors.inkFaint
                    }
                  >
                    {`${Math.round(achievement.progress * 100)}%`}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Content */}
          {achievement.category === "streak" ? (
            (() => {
              const target = parseTarget(achievement.id) ?? 3;
              const current = streakData?.current_streak ?? 0;
              return (
                <ScrollView contentContainerStyle={styles.streakPillGrid}>
                  {Array.from({ length: target }).map((_, i) => {
                    const dayNum = i + 1;
                    const completed = dayNum <= current;
                    return (
                      <View
                        key={dayNum}
                        style={[
                          styles.dayPill,
                          completed ? styles.dayPillCompleted : styles.dayPillPending,
                        ]}
                      >
                        <Text
                          variant={completed ? "semiBold" : "regular"}
                          size="xs"
                          color={completed ? Colors.white : Colors.inkFaint}
                        >
                          {`${dayNum}`}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              );
            })()
          ) : (
            <FlatList
              data={relevant}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.sheetList}
              renderItem={({ item }) => (
                <View style={styles.speciesRow}>
                  <View
                    style={[
                      styles.speciesDot,
                      {
                        backgroundColor: item.spotted
                          ? Colors.sage
                          : Colors.paper,
                      },
                    ]}
                  >
                    {item.spotted && (
                      <Check size={14} color={Colors.white} strokeWidth={3} />
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text
                      variant="medium"
                      size="base"
                      color={item.spotted ? Colors.ink : Colors.inkSoft}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text
                      variant="regular"
                      size="xs"
                      color={Colors.inkFaint}
                      numberOfLines={1}
                    >
                      {item.family}
                    </Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>,
      );
    },
    [getRelevantSpecies, openSheet, streakData],
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top", "left", "right"]}
        testID="achievements-screen-loading"
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <CircleBtn
            icon={ArrowLeft}
            size={36}
            backgroundColor={Colors.white}
            color={Colors.ink}
            onPress={() => navigation.goBack()}
            testID="achievements-back-loading"
          />
          <Text variant="semiBold" size="md" color={Colors.ink}>
            Achievements
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <Skeleton
          isLoading
          boneColor={Colors.paper}
          highlightColor={Colors.cream}
          duration={1200}
          containerStyle={{ paddingHorizontal: Spacing.xl }}
          layout={[
            // Progress card — matches progressCard style: padding xl (20) top+bottom, icon 28, text 30+13, bar 6+marginTop 12
            {
              key: "progress-card",
              width: "100%" as any,
              height: 150,
              borderRadius: BorderRadius.xl,
              marginBottom: Spacing.md,
            },
            // Filter pills — matches filterPill: paddingHorizontal md (12), paddingVertical sm (8), text xs (11)
            {
              key: "pills",
              flexDirection: "row" as const,
              gap: Spacing.sm,
              paddingVertical: Spacing.md,
              children: [
                {
                  key: "pill-1",
                  width: 36,
                  height: 27,
                  borderRadius: BorderRadius.full,
                },
                {
                  key: "pill-2",
                  width: 72,
                  height: 27,
                  borderRadius: BorderRadius.full,
                },
                {
                  key: "pill-3",
                  width: 88,
                  height: 27,
                  borderRadius: BorderRadius.full,
                },
                {
                  key: "pill-4",
                  width: 60,
                  height: 27,
                  borderRadius: BorderRadius.full,
                },
                {
                  key: "pill-5",
                  width: 54,
                  height: 27,
                  borderRadius: BorderRadius.full,
                },
              ],
            },
            // Achievement rows — matches achievementRow: paddingVertical md (12), icon 36x36, name 15px, desc 11px, ring 40x40
            ...Array.from({ length: 8 }).map((_, i) => ({
              key: `row-${i}`,
              flexDirection: "row" as const,
              alignItems: "center" as const,
              paddingVertical: Spacing.md,
              gap: Spacing.md,
              children: [
                { key: `icon-${i}`, width: 36, height: 36, borderRadius: 18 },
                {
                  key: `text-${i}`,
                  flex: 1,
                  children: [
                    {
                      key: `name-${i}`,
                      width: "55%" as any,
                      height: 15,
                      borderRadius: 7,
                      marginBottom: 4,
                    },
                    {
                      key: `desc-${i}`,
                      width: "75%" as any,
                      height: 11,
                      borderRadius: 5,
                    },
                  ],
                },
                { key: `ring-${i}`, width: 40, height: 40, borderRadius: 20 },
              ],
            })),
          ]}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
      testID="achievements-screen"
    >
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

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            style={[
              styles.filterPill,
              filter === f.key && styles.filterPillActive,
            ]}
            onPress={() => setFilter(f.key)}
            testID={`achievements-filter-${f.key}`}
          >
            <Text
              variant={filter === f.key ? "semiBold" : "regular"}
              size="xs"
              color={filter === f.key ? Colors.white : Colors.inkSoft}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Achievement list */}
      <FlatList
        data={filteredRows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AchievementRow
            achievement={item}
            onPress={() => handleAchievementPress(item)}
          />
        )}
      />
    </SafeAreaView>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressRing: React.FC<{
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
  trackColor: string;
}> = ({ progress, size, strokeWidth, color, trackColor }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProgress = useSharedValue(0);

  React.useEffect(() => {
    animatedProgress.value = withTiming(Math.min(progress, 1), {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <Svg width={size} height={size}>
      {/* Track */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Fill */}
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference}`}
        animatedProps={animatedProps}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  collection: BookOpen,
  streak: Flame,
};

const FAMILY_ICONS: Record<string, LucideIcon> = {
  songbirds: Music,
  "birds-of-prey": Crosshair,
  waterfowl: Waves,
  "wading-birds": Bird,
  shorebirds: Shell,
  seabirds: Anchor,
  "game-birds": Target,
  woodpeckers: Axe,
  "aerial-specialists": Wind,
};

const HABITAT_ICONS: Record<string, LucideIcon> = {
  forests: TreePine,
  "grasslands-farmland": Wheat,
  "deserts-scrublands": Cactus,
  wetlands: Droplets,
  freshwater: Droplets,
  "coasts-ocean": Anchor,
  mountains: Mountain,
  tundra: Snowflake,
  "cities-towns": Building2,
};

function getAchievementIcon(id: string, category: string): LucideIcon {
  if (category === "family") {
    const parts = id.replace("family_", "").split("_");
    parts.pop(); // remove tier
    const slug = parts.join("-");
    return FAMILY_ICONS[slug] ?? Feather;
  }
  if (category === "habitat") {
    const parts = id.replace("habitat_", "").split("_");
    parts.pop();
    const slug = parts.join("-");
    return HABITAT_ICONS[slug] ?? TreePine;
  }
  return CATEGORY_ICONS[category] ?? Feather;
}

const AchievementRow: React.FC<{
  achievement: AchievementRowData;
  onPress?: () => void;
}> = ({ achievement, onPress }) => {
  const colorKey = CATEGORY_COLOR_KEY[achievement.category] ?? "collection";
  const categoryColor =
    (AchievementColors as Record<string, string>)[colorKey] ?? Colors.sage;
  const categoryLabel =
    CATEGORY_LABELS[achievement.category] ?? achievement.category;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.achievementRow,
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
      testID={`achievement-${achievement.id}`}
    >
      {/* Category icon */}
      {(() => {
        const Icon = getAchievementIcon(achievement.id, achievement.category);
        return (
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
              <Icon
                size={16}
                color={achievement.progress > 0 ? categoryColor : Colors.inkFaint}
                strokeWidth={1.5}
              />
            )}
          </View>
        );
      })()}

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
      </View>

      {/* Right side — progress ring */}
      {!achievement.unlocked && (
        <View style={styles.progressRingContainer}>
          <ProgressRing
            progress={achievement.progress}
            size={40}
            strokeWidth={3}
            color={categoryColor}
            trackColor={`${categoryColor}20`}
          />
          <View style={styles.progressRingLabel}>
            <Text
              variant="semiBold"
              size="xs"
              color={achievement.progress > 0 ? categoryColor : Colors.inkFaint}
              testID={`achievement-pct-${achievement.id}`}
            >
              {`${Math.round(achievement.progress * 100)}%`}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
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
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.paper,
  },
  filterPillActive: {
    backgroundColor: Colors.sage,
    borderColor: Colors.sage,
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
  progressRingContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  progressRingLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetHeader: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.paper,
  },
  sheetHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  sheetRing: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sheetRingLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetList: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["4xl"],
  },
  speciesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.paper,
  },
  speciesDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  streakPillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing["4xl"],
    gap: Spacing.sm,
  },
  dayPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayPillCompleted: {
    backgroundColor: Colors.coral,
  },
  dayPillPending: {
    backgroundColor: Colors.paper,
  },
});

export default AchievementsScreen;
