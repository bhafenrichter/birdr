import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Colors, ConservationTierColors, Spacing, BorderRadius, Shadows } from "../../theme";
import { Text, PrimaryButton, Pill } from "../../components/atoms";
import type { OnboardingStackParamList } from "../../navigation/stacks/OnboardingStack";

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

export const TutorialCaptureScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [phase, setPhase] = useState<"ready" | "revealing" | "done">("ready");

  // Animation values
  const cardScale = useSharedValue(0.5);
  const cardOpacity = useSharedValue(0);
  const bannerOpacity = useSharedValue(0);
  const bonusOpacity = useSharedValue(0);

  const handleIdentify = async () => {
    setPhase("revealing");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Simulate the reveal
    cardOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    cardScale.value = withDelay(500, withSpring(1, { damping: 12, stiffness: 100 }));

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      bannerOpacity.value = withTiming(1, { duration: 400 });
    }, 1500);

    setTimeout(() => {
      bonusOpacity.value = withTiming(1, { duration: 400 });
      setPhase("done");
    }, 2500);
  };

  const handleContinue = () => {
    // Mark onboarding complete and go to main app
    // The RootNavigator will detect the flag and show the main tabs
    navigation.navigate("Complete");
  };

  const handleSkip = () => {
    navigation.navigate("Complete");
  };

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const bannerStyle = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
  }));

  const bonusStyle = useAnimatedStyle(() => ({
    opacity: bonusOpacity.value,
  }));

  if (phase === "ready") {
    return (
      <SafeAreaView style={styles.container} testID="tutorial-capture-screen">
        {/* Skip */}
        <Pressable
          style={styles.skipButton}
          onPress={handleSkip}
          testID="tutorial-skip"
        >
          <Text variant="medium" size="sm" color={Colors.inkSoft} testID="tutorial-skip-label">
            Skip
          </Text>
        </Pressable>

        <View style={styles.readyContent}>
          <Text
            variant="bold"
            size="2xl"
            color={Colors.ink}
            align="center"
            testID="tutorial-title"
          >
            Try it out
          </Text>
          <Text
            variant="regular"
            size="base"
            color={Colors.inkSoft}
            align="center"
            testID="tutorial-subtitle"
            style={{ marginTop: Spacing.sm }}
          >
            See what happens when you identify a bird
          </Text>

          {/* Sample photo placeholder */}
          <View style={styles.samplePhoto} testID="tutorial-sample-photo">
            <Text variant="regular" size="sm" color={Colors.inkFaint} testID="tutorial-sample-label">
              Sample: Northern Cardinal
            </Text>
          </View>

          <PrimaryButton
            title="Identify"
            size="lg"
            onPress={handleIdentify}
            testID="tutorial-identify"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Revealing / Done
  return (
    <View style={styles.revealContainer} testID="tutorial-reveal-screen">
      {/* Card */}
      <Animated.View style={[styles.tutorialCard, cardStyle]} testID="tutorial-card">
        <View style={[styles.cardFrame, { backgroundColor: ConservationTierColors.LC }]}>
          <View style={styles.cardInner}>
            <Pill
              label="Sample"
              color={Colors.white}
              backgroundColor={Colors.inkFaint}
              testID="tutorial-sample-badge"
            />
            <Text
              variant="semiBold"
              size="xl"
              color={Colors.ink}
              align="center"
              testID="tutorial-card-name"
              style={{ marginTop: Spacing.md }}
            >
              Northern Cardinal
            </Text>
            <Text
              variant="regular"
              size="sm"
              color={Colors.inkSoft}
              align="center"
              testID="tutorial-card-type"
              style={{ marginTop: Spacing.xs }}
            >
              Songbird
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Banner */}
      <Animated.View style={[styles.tutorialBanner, bannerStyle]} testID="tutorial-banner">
        <Text
          variant="bold"
          size="xs"
          color={Colors.saffron}
          testID="tutorial-first-sight"
          style={{ letterSpacing: 2 }}
        >
          FIRST SIGHT
        </Text>
        <Text
          variant="bold"
          size="2xl"
          color={Colors.white}
          testID="tutorial-banner-name"
        >
          Northern Cardinal
        </Text>
      </Animated.View>

      {/* Bonus chips + CTA */}
      <Animated.View style={[styles.tutorialBonus, bonusStyle]} testID="tutorial-bonus">
        <View style={styles.bonusChips}>
          <Pill
            label="Streak +1 → 1 day"
            color={Colors.white}
            backgroundColor={Colors.coral}
            testID="tutorial-chip-streak"
          />
          <Pill
            label="First Feather"
            color={Colors.white}
            backgroundColor={Colors.sage}
            testID="tutorial-chip-achievement"
          />
        </View>

        <PrimaryButton
          title="Continue"
          size="lg"
          fullWidth
          onPress={handleContinue}
          testID="tutorial-continue"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: Spacing.xl,
    zIndex: 10,
    padding: Spacing.sm,
  },
  readyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  samplePhoto: {
    width: 240,
    height: 180,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.paper,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  revealContainer: {
    flex: 1,
    backgroundColor: Colors.stage,
    alignItems: "center",
    justifyContent: "center",
  },
  tutorialCard: {
    position: "absolute",
    top: "30%",
  },
  cardFrame: {
    borderRadius: BorderRadius["2xl"],
    padding: 4,
    ...Shadows.lg,
  },
  cardInner: {
    backgroundColor: Colors.cardBody,
    borderRadius: BorderRadius["2xl"] - 2,
    paddingVertical: Spacing["3xl"],
    paddingHorizontal: Spacing["3xl"],
    alignItems: "center",
    minWidth: 220,
  },
  tutorialBanner: {
    position: "absolute",
    top: "22%",
    alignItems: "center",
  },
  tutorialBonus: {
    position: "absolute",
    bottom: 60,
    left: Spacing.xl,
    right: Spacing.xl,
  },
  bonusChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
});

export default TutorialCaptureScreen;
