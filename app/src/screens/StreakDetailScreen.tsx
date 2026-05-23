import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Flame } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Shadows, Fonts, FontSizes } from "../theme";
import { Text, CircleBtn } from "../components/atoms";
import { DUMMY_STREAK } from "../data/dummy";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export const StreakDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const streak = DUMMY_STREAK;

  // Build 28-day calendar (4 weeks)
  const calendarDays = useMemo(() => {
    const today = new Date("2026-05-23"); // Current date
    const days: { date: string; isCapture: boolean; isToday: boolean }[] = [];

    // Go back to the start of the 4-week window aligned to Sunday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 27);
    // Align to Sunday
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const captureSet = new Set(streak.capturedDays);

    for (let i = 0; i < 28; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      days.push({
        date: iso,
        isCapture: captureSet.has(iso),
        isToday: iso === today.toISOString().split("T")[0],
      });
    }

    return days;
  }, []);

  return (
    <SafeAreaView style={styles.container} testID="streak-detail-screen">
      {/* Top bar */}
      <View style={styles.topBar}>
        <CircleBtn
          icon={ArrowLeft}
          size={36}
          backgroundColor={Colors.white}
          color={Colors.ink}
          onPress={() => navigation.goBack()}
          testID="streak-detail-back"
        />
        <Text
          variant="semiBold"
          size="md"
          color={Colors.ink}
          testID="streak-detail-title"
        >
          Streak
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current streak — large hero */}
        <View style={styles.heroCard} testID="streak-detail-hero">
          <Flame size={48} color={Colors.coral} strokeWidth={1.5} />
          <Text
            variant="extraBold"
            size="3xl"
            color={Colors.ink}
            testID="streak-detail-current-value"
            style={{ marginTop: Spacing.sm }}
          >
            {String(streak.currentStreak)}
          </Text>
          <Text
            variant="regular"
            size="base"
            color={Colors.inkSoft}
            testID="streak-detail-current-label"
          >
            day streak
          </Text>

          {/* Status prompt */}
          <View style={styles.statusPill}>
            <Text
              variant="medium"
              size="sm"
              color={streak.hasCapturedToday ? Colors.sage : Colors.coral}
              testID="streak-detail-status"
            >
              {streak.hasCapturedToday
                ? "Streak safe today"
                : "Capture today to keep it going"}
            </Text>
          </View>
        </View>

        {/* Stat tiles */}
        <View style={styles.statRow} testID="streak-detail-stats">
          <View style={styles.statTile}>
            <Text
              variant="bold"
              size="xl"
              color={Colors.ink}
              testID="streak-detail-longest-value"
            >
              {String(streak.longestStreak)}
            </Text>
            <Text
              variant="regular"
              size="xs"
              color={Colors.inkSoft}
              testID="streak-detail-longest-label"
            >
              Longest streak
            </Text>
          </View>
          <View style={styles.statTile}>
            <Text
              variant="bold"
              size="xl"
              color={Colors.ink}
              testID="streak-detail-total-value"
            >
              {String(streak.captureDaysTotal)}
            </Text>
            <Text
              variant="regular"
              size="xs"
              color={Colors.inkSoft}
              testID="streak-detail-total-label"
            >
              Capture days
            </Text>
          </View>
        </View>

        {/* 4-week calendar grid */}
        <View style={styles.calendarCard} testID="streak-detail-calendar">
          <Text
            variant="semiBold"
            size="base"
            color={Colors.ink}
            testID="streak-detail-calendar-title"
            style={{ marginBottom: Spacing.md }}
          >
            Past 4 weeks
          </Text>

          {/* Weekday headers */}
          <View style={styles.calendarRow}>
            {WEEKDAYS.map((day, i) => (
              <View key={`hdr-${i}`} style={styles.calendarCell}>
                <Text
                  variant="medium"
                  size="xs"
                  color={Colors.inkFaint}
                  testID={`streak-weekday-${i}`}
                >
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Day cells — 4 rows of 7 */}
          {[0, 1, 2, 3].map((week) => (
            <View key={`week-${week}`} style={styles.calendarRow}>
              {calendarDays.slice(week * 7, (week + 1) * 7).map((day) => (
                <View
                  key={day.date}
                  style={[
                    styles.calendarCell,
                    styles.calendarDay,
                    day.isCapture && styles.calendarDayCapture,
                    day.isToday && !day.isCapture && styles.calendarDayToday,
                  ]}
                  testID={`streak-day-${day.date}`}
                >
                  <Text
                    variant={day.isCapture ? "semiBold" : "regular"}
                    size="xs"
                    color={
                      day.isCapture
                        ? Colors.white
                        : day.isToday
                          ? Colors.coral
                          : Colors.inkSoft
                    }
                    testID={`streak-day-label-${day.date}`}
                  >
                    {String(new Date(day.date + "T12:00:00").getDate())}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["4xl"],
  },
  heroCard: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing["3xl"],
    paddingHorizontal: Spacing.xl,
    ...Shadows.sm,
    marginBottom: Spacing.lg,
  },
  statusPill: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.paper,
    borderRadius: BorderRadius.full,
  },
  statRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statTile: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  calendarCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  calendarRow: {
    flexDirection: "row",
    marginBottom: Spacing.xs,
  },
  calendarCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
  },
  calendarDay: {
    borderRadius: BorderRadius.full,
    margin: 2,
  },
  calendarDayCapture: {
    backgroundColor: Colors.coral,
  },
  calendarDayToday: {
    borderWidth: 1.5,
    borderColor: Colors.coral,
    borderStyle: "dashed",
  },
});

export default StreakDetailScreen;
