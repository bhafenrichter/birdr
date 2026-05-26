import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Flame } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Shadows, Fonts, FontSizes } from "../theme";
import { Text } from "../components/atoms";
import { useStreak } from "../hooks/useApi";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export const StreakDetailScreen: React.FC = () => {
  const { data: streakData } = useStreak();
  const currentStreak = streakData?.current_streak ?? 0;
  const longestStreak = streakData?.longest_streak ?? 0;
  const lastCaptureDate = streakData?.last_capture_date ?? null;
  const hasCapturedToday = lastCaptureDate === new Date().toISOString().split("T")[0];

  // Build calendar month grid
  const { calendarDays, monthLabel, weekCount } = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const label = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // First day of month and total days
    const firstOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDow = firstOfMonth.getDay(); // 0=Sun

    const captureSet = new Set<string>();
    if (lastCaptureDate) {
      captureSet.add(lastCaptureDate);
    }

    const todayIso = today.toISOString().split("T")[0];
    const days: { date: string; day: number | null; isCapture: boolean; isToday: boolean }[] = [];

    // Leading blanks for alignment
    for (let i = 0; i < startDow; i++) {
      days.push({ date: "", day: null, isCapture: false, isToday: false });
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        date: iso,
        day: d,
        isCapture: captureSet.has(iso),
        isToday: iso === todayIso,
      });
    }

    // Trailing blanks to fill last row
    while (days.length % 7 !== 0) {
      days.push({ date: "", day: null, isCapture: false, isToday: false });
    }

    return { calendarDays: days, monthLabel: label, weekCount: days.length / 7 };
  }, [lastCaptureDate]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]} testID="streak-detail-screen">

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
            {String(currentStreak)}
          </Text>
          <Text
            variant="regular"
            size="base"
            color={Colors.inkSoft}
            testID="streak-detail-current-label"
          >
            day streak
          </Text>

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
              {String(longestStreak)}
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
              {String(currentStreak)}
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
            {monthLabel}
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

          {/* Day cells — dynamic rows */}
          {Array.from({ length: weekCount }).map((_, week) => (
            <View key={`week-${week}`} style={styles.calendarRow}>
              {calendarDays.slice(week * 7, (week + 1) * 7).map((day, i) => (
                <View
                  key={day.date || `blank-${week}-${i}`}
                  style={[
                    styles.calendarCell,
                    styles.calendarDay,
                    day.day != null && day.isCapture && styles.calendarDayCapture,
                    day.day != null && day.isToday && !day.isCapture && styles.calendarDayToday,
                  ]}
                  testID={day.date ? `streak-day-${day.date}` : undefined}
                >
                  {day.day != null && (
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
                    >
                      {String(day.day)}
                    </Text>
                  )}
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
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
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
