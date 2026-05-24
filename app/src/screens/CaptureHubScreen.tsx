import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Binoculars, Flame } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors, Spacing, BorderRadius, Shadows, Fonts, FontSizes } from "../theme";
import { Text, Body, Pill } from "../components/atoms";
import { DUMMY_STREAK, DUMMY_USER, DUMMY_USER_CARDS } from "../data/dummy";
import { BirdCardThumb } from "../components/molecules/BirdCard";
import { ScrollView } from "react-native-gesture-handler";
import type { CaptureStackParamList } from "../navigation/stacks/CaptureStack";

type Nav = NativeStackNavigationProp<CaptureStackParamList>;

export const CaptureHubScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const streak = DUMMY_STREAK;
  const user = DUMMY_USER;
  const recentCards = DUMMY_USER_CARDS.slice(0, 4);
  const quotaRemaining = 2;

  return (
    <SafeAreaView style={styles.container} testID="capture-hub-screen">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Wordmark */}
        <Text
          variant="bold"
          size="3xl"
          color={Colors.sage}
          align="center"
          testID="capture-hub-wordmark"
        >
          birdr
        </Text>

        <Text
          variant="regular"
          size="sm"
          color={Colors.inkSoft}
          align="center"
          testID="capture-hub-tagline"
          style={{ marginTop: Spacing.xs }}
        >
          Every bird tells a story
        </Text>

        {/* Streak chip */}
        <View style={styles.streakChip} testID="capture-hub-streak-chip">
          <Flame size={18} color={Colors.coral} strokeWidth={2} />
          <Text variant="bold" size="lg" color={Colors.ink} testID="capture-hub-streak-count">
            {String(streak.currentStreak)}
          </Text>
          <Text variant="regular" size="sm" color={Colors.inkSoft} testID="capture-hub-streak-label">
            day streak
          </Text>
        </View>

        {/* Today's status */}
        <View style={styles.statusCard} testID="capture-hub-status">
          <Text
            variant="medium"
            size="sm"
            color={streak.hasCapturedToday ? Colors.sage : Colors.coral}
            align="center"
            testID="capture-hub-status-text"
          >
            {streak.hasCapturedToday
              ? "Streak safe today"
              : "Capture today to keep your streak"}
          </Text>
        </View>

        {/* Big capture button */}
        <Pressable
          style={({ pressed }) => [
            styles.captureButton,
            pressed && { transform: [{ scale: 0.95 }] },
          ]}
          onPress={() => navigation.navigate("CaptureFlow")}
          testID="capture-hub-capture-button"
          accessible
          accessibilityRole="button"
          accessibilityLabel="Open camera to capture a bird"
        >
          <LinearGradient
            colors={[Colors.saffron, "#FFC966"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.captureButtonGradient}
          >
            <Binoculars size={40} color={Colors.white} strokeWidth={1.5} />
          </LinearGradient>
        </Pressable>

        {/* Daily quota (free tier) */}
        {!user.isSubscribed && (
          <View style={styles.quotaRow} testID="capture-hub-quota">
            <Text variant="regular" size="sm" color={Colors.inkSoft} testID="capture-hub-quota-text">
              {`${quotaRemaining} of 3 captures left today`}
            </Text>
          </View>
        )}

        {/* Recent captures */}
        {recentCards.length > 0 && (
          <View style={styles.recentSection} testID="capture-hub-recent">
            <Text
              variant="semiBold"
              size="base"
              color={Colors.ink}
              testID="capture-hub-recent-title"
              style={{ marginBottom: Spacing.md }}
            >
              Recent captures
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentScroll}
            >
              {recentCards.map((card) => (
                <View key={card.speciesId} style={styles.recentCard}>
                  <BirdCardThumb
                    data={{
                      speciesName: card.species.name,
                      familyName: card.species.familyName,
                      habitat: card.species.habitat,
                      conservationTier: card.species.conservationTier,
                      photoUri: card.heroPhotoUri,
                      sightingCount: card.sightingCount,
                    }}
                    testID={`capture-hub-recent-${card.speciesId}`}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
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
    paddingTop: Spacing["3xl"],
    paddingBottom: Spacing["4xl"],
    alignItems: "center",
  },
  streakChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing["2xl"],
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
  },
  statusCard: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.paper,
    borderRadius: BorderRadius.lg,
  },
  captureButton: {
    marginTop: Spacing["3xl"],
    ...Shadows.lg,
  },
  captureButtonGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  quotaRow: {
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  recentSection: {
    marginTop: Spacing["3xl"],
    alignSelf: "stretch",
  },
  recentScroll: {
    gap: Spacing.md,
  },
  recentCard: {
    width: 120,
  },
});

export default CaptureHubScreen;
