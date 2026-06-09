import React, { useEffect } from "react";
import { View, StyleSheet, Pressable, ImageBackground } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Binoculars, Crown } from "lucide-react-native";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
  Fonts,
  FontSizes,
} from "../theme";
import { Text, Body, Pill } from "../components/atoms";
import { useStreak, useProfile } from "../hooks/useApi";
import { useRevenueCat } from "../contexts/RevenueCatProvider";
import { usePostHog } from "../contexts/PostHogProvider";
import { ScrollView } from "react-native-gesture-handler";
import type { CaptureStackParamList } from "../navigation/stacks/CaptureStack";

type Nav = NativeStackNavigationProp<CaptureStackParamList>;

export const CaptureHubScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { data: streakData } = useStreak();
  const { data: profile } = useProfile();
  const currentStreak = streakData?.current_streak ?? 0;
  const lastCapture = streakData?.last_capture_date;
  const hasCapturedToday =
    lastCapture === new Date().toISOString().split("T")[0];
  const { isSubscribed, presentPaywall } = useRevenueCat();
  const posthog = usePostHog();
  const quotaResetAt = profile?.daily_captures_reset_at;
  const quotaIsStale = quotaResetAt ? isNewUTCDay(quotaResetAt) : false;
  const dailyUsed = quotaIsStale ? 0 : (profile?.daily_captures_used ?? 0);
  const quotaRemaining = Math.max(0, 3 - dailyUsed);

  // Pulse animation
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <ImageBackground
      source={require("../../assets/forest.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} testID="capture-hub-screen">
        {/* Top header bar */}
        <View style={styles.headerBar}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}>
            <Text
              variant="bold"
              size="2xl"
              color={Colors.sage}
              testID="capture-hub-wordmark"
            >
              birdr
            </Text>
            {isSubscribed && (
              <View style={{ marginTop: -16, shadowColor: "#edb915", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.6, shadowRadius: 4 }}>
                <Crown size={16} color="#edb915" strokeWidth={2.5} testID="capture-hub-pro-badge" />
              </View>
            )}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
          {/* Streak chip — tappable */}
          <Pressable
            style={styles.streakChip}
            onPress={() => navigation.navigate("StreakDetail")}
            testID="capture-hub-streak-chip"
          >
            <View
              style={{
                width: 36,
                height: 36,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LottieView
                source={require("../../assets/animations/streak_flame.json")}
                autoPlay
                loop
                style={{ width: 60, height: 60 }}
              />
            </View>
            <Text
              variant="bold"
              size="lg"
              color={Colors.ink}
              testID="capture-hub-streak-count"
            >
              {String(currentStreak)}
            </Text>
          </Pressable>
          </View>
        </View>

        <View style={styles.scrollContent}>
          {/* Big capture button with pulse */}
          <Animated.View style={[styles.captureButton, pulseStyle]}>
            <Pressable
              style={({ pressed }) => [
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
              onPress={() => {
                if (!isSubscribed && quotaRemaining <= 0) {
                  posthog.capture("paywall_shown", {
                    trigger: "capture_hub_quota_exceeded",
                  });
                  presentPaywall();
                } else {
                  posthog.capture("capture_started", {
                    quota_remaining: quotaRemaining,
                    is_subscribed: isSubscribed,
                  });
                  navigation.navigate("CaptureFlow");
                }
              }}
              testID="capture-hub-capture-button"
              accessible
              accessibilityRole="button"
              accessibilityLabel="Open camera to capture a bird"
            >
              <LinearGradient
                colors={[Colors.sage, Colors.sageLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.captureButtonGradient}
              >
                <Binoculars size={40} color={Colors.white} strokeWidth={1.5} />
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Daily quota (free tier) */}
          {!isSubscribed && (
            <>
              <View style={styles.quotaBadge} testID="capture-hub-quota-badge">
                <Text
                  variant="medium"
                  size="sm"
                  color={Colors.inkSoft}
                  testID="capture-hub-quota-text"
                >
                  {`${quotaRemaining} of 3 captures left today`}
                </Text>
              </View>
              <Pressable
                style={styles.upgradeLink}
                onPress={presentPaywall}
                testID="capture-hub-upgrade"
              >
                <Crown size={14} color={Colors.sage} strokeWidth={2} />
                <Text
                  variant="medium"
                  size="sm"
                  color={Colors.sage}
                  testID="capture-hub-upgrade-text"
                >
                  Upgrade for unlimited
                </Text>
              </Pressable>
            </>
          )}
          {isSubscribed && (
            <LinearGradient
              colors={["#f8e15c", "#edb915"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                marginTop: Spacing.xl,
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.xs,
                borderRadius: BorderRadius.full,
              }}
              testID="capture-hub-unlimited"
            >
              <Text variant="semiBold" size="sm" color={Colors.white}>
                Unlimited captures
              </Text>
            </LinearGradient>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  streakChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  quotaBadge: {
    marginTop: Spacing["4xl"],
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.paper,
    borderRadius: BorderRadius.full,
  },
  upgradeLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  captureButton: {
    ...Shadows.lg,
  },
  captureButtonGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});

// Returns true if the stored reset timestamp is from a previous UTC day,
// meaning the server-side counter hasn't been reset yet this session.
function isNewUTCDay(resetAt: string): boolean {
  const reset = new Date(resetAt);
  const now = new Date();
  return (
    now.getUTCFullYear() !== reset.getUTCFullYear() ||
    now.getUTCMonth() !== reset.getUTCMonth() ||
    now.getUTCDate() !== reset.getUTCDate()
  );
}

export default CaptureHubScreen;
