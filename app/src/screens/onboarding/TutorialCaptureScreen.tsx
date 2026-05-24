import React, { useRef, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView, Dimensions } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
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
import { Flame, Award } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Shadows } from "../../theme";
import { Text, PrimaryButton, InfoCard } from "../../components/atoms";
import { BirdCard } from "../../components/molecules/BirdCard";
import type { OnboardingStackParamList } from "../../navigation/stacks/OnboardingStack";

const SAMPLE_CARDINAL = {
  speciesName: "Northern Cardinal",
  familyName: "Songbird",
  habitat: "Forests",
  conservationTier: "LC" as const,
  photoUri: null,
  size: "Approx. 8.3 - 9 inches (21 - 23 cm)",
  about: "One of our most popular birds, the Northern Cardinal is the official state bird of no fewer than seven eastern states.",
  firstSight: "January 15, 2024, backyard feeder",
  sightingCount: 1,
};

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

export const TutorialCaptureScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [phase, setPhase] = useState<"ready" | "revealing" | "card" | "achievements">("ready");
  const confettiRef = useRef<ConfettiCannon>(null);

  // Animation values — first sight
  const cardScale = useSharedValue(0.5);
  const cardOpacity = useSharedValue(0);
  const bannerOpacity = useSharedValue(0);

  // Animation values — achievements
  const achBannerOpacity = useSharedValue(0);
  const achBannerTranslateY = useSharedValue(20);
  const achCard1Opacity = useSharedValue(0);
  const achCard1TranslateY = useSharedValue(30);
  const achCard2Opacity = useSharedValue(0);
  const achCard2TranslateY = useSharedValue(30);
  const achCtaOpacity = useSharedValue(0);

  const handleIdentify = async () => {
    setPhase("revealing");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate card in
    cardOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    cardScale.value = withDelay(500, withSpring(1, { damping: 12, stiffness: 100 }));

    // Show banner + confetti
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      bannerOpacity.value = withTiming(1, { duration: 400 });
      confettiRef.current?.start();
    }, 1500);

    // Enable continue
    setTimeout(() => {
      setPhase("card");
    }, 2500);
  };

  const handleShowAchievements = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase("achievements");

    // Animate banner
    achBannerOpacity.value = withTiming(1, { duration: 400 });
    achBannerTranslateY.value = withTiming(0, { duration: 400 });

    // First card slides in after banner
    achCard1Opacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    achCard1TranslateY.value = withDelay(300, withSpring(0, { damping: 14, stiffness: 100 }));

    // Second card slides in after first
    achCard2Opacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    achCard2TranslateY.value = withDelay(600, withSpring(0, { damping: 14, stiffness: 100 }));

    // CTA fades in last
    achCtaOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));
  };

  const handleFinish = () => {
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

  const achBannerStyle = useAnimatedStyle(() => ({
    opacity: achBannerOpacity.value,
    transform: [{ translateY: achBannerTranslateY.value }],
  }));
  const achCard1Style = useAnimatedStyle(() => ({
    opacity: achCard1Opacity.value,
    transform: [{ translateY: achCard1TranslateY.value }],
  }));
  const achCard2Style = useAnimatedStyle(() => ({
    opacity: achCard2Opacity.value,
    transform: [{ translateY: achCard2TranslateY.value }],
  }));
  const achCtaStyle = useAnimatedStyle(() => ({
    opacity: achCtaOpacity.value,
  }));

  // ── Phase: Ready ──────────────────────────────────────────────
  if (phase === "ready") {
    return (
      <SafeAreaView style={styles.container} testID="tutorial-capture-screen">
        <Pressable
          style={styles.skipButton}
          onPress={handleSkip}
          testID="tutorial-skip"
        >
          <Text variant="medium" size="sm" color={Colors.inkSoft} testID="tutorial-skip-label">
            Skip
          </Text>
        </Pressable>

        <View style={styles.header}>
          <Text variant="bold" size="2xl" color={Colors.ink} testID="tutorial-title">
            Try it out
          </Text>
          <Text
            variant="regular"
            size="base"
            color={Colors.inkSoft}
            testID="tutorial-subtitle"
            style={{ marginTop: Spacing.sm }}
          >
            See what happens when you identify a bird
          </Text>
        </View>

        <View style={styles.photoWrapper}>
          <View style={styles.samplePhoto} testID="tutorial-sample-photo">
            <Text variant="regular" size="sm" color={Colors.inkFaint} testID="tutorial-sample-label">
              Sample: Northern Cardinal
            </Text>
          </View>
        </View>

        <View style={styles.ctaWrapper}>
          <PrimaryButton
            title="Identify"
            size="lg"
            fullWidth
            onPress={handleIdentify}
            testID="tutorial-identify"
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Phase: Achievements ───────────────────────────────────────
  if (phase === "achievements") {
    return (
      <SafeAreaView style={styles.revealContainer} testID="tutorial-achievements-screen">
        <ScrollView
          contentContainerStyle={styles.revealScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner */}
          <Animated.View style={[styles.tutorialBanner, achBannerStyle]}>
            <Text
              variant="bold"
              size="xs"
              color={Colors.saffron}
              testID="achievements-label"
              style={{ letterSpacing: 2 }}
            >
              ACHIEVEMENTS UNLOCKED
            </Text>
            <Text variant="bold" size="2xl" color={Colors.white} testID="achievements-title">
              Nice work!
            </Text>
            <Text
              variant="regular"
              size="base"
              color="rgba(255,255,255,0.7)"
              testID="achievements-subtitle"
              style={{ marginTop: Spacing.xs }}
            >
              Every capture earns you progress
            </Text>
          </Animated.View>

          {/* Achievement cards */}
          <View style={styles.achievementsList}>
            <Animated.View style={achCard1Style}>
              <InfoCard
                icon={
                  <View style={[styles.achievementIcon, { backgroundColor: Colors.coral }]}>
                    <Flame size={24} color={Colors.white} strokeWidth={2} />
                  </View>
                }
                title="Streak +1 → 1 day"
                description="You're on a roll! Keep capturing daily."
                testID="tutorial-streak"
              />
            </Animated.View>
            <Animated.View style={achCard2Style}>
              <InfoCard
                icon={
                  <View style={[styles.achievementIcon, { backgroundColor: Colors.sage }]}>
                    <Award size={24} color={Colors.white} strokeWidth={2} />
                  </View>
                }
                title="First Feather"
                description="You identified your first bird!"
                testID="tutorial-achievement"
              />
            </Animated.View>
          </View>
        </ScrollView>

        <Animated.View style={[styles.ctaWrapper, achCtaStyle]}>
          <PrimaryButton
            title="Let's go!"
            size="lg"
            fullWidth
            onPress={handleFinish}
            testID="tutorial-finish"
          />
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── Phase: Revealing / Card ───────────────────────────────────
  return (
    <SafeAreaView style={styles.revealContainer} testID="tutorial-reveal-screen">
      <ScrollView
        contentContainerStyle={styles.revealScroll}
        showsVerticalScrollIndicator={false}
      >
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
          <Text variant="bold" size="2xl" color={Colors.white} testID="tutorial-banner-name">
            Northern Cardinal
          </Text>
        </Animated.View>

        {/* Card */}
        <Animated.View style={[styles.tutorialCard, cardStyle]} testID="tutorial-card">
          <BirdCard data={SAMPLE_CARDINAL} testID="tutorial-bird-card" />
        </Animated.View>
      </ScrollView>

      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: Dimensions.get("window").width / 2, y: -20 }}
        autoStart={false}
        fadeOut
        explosionSpeed={300}
        fallSpeed={2500}
        colors={[Colors.sage, Colors.saffron, Colors.coral, Colors.sky, Colors.sageLight]}
      />

      {/* Continue pinned to bottom */}
      {phase === "card" && (
        <View style={styles.ctaWrapper}>
          <PrimaryButton
            title="Continue"
            size="lg"
            fullWidth
            onPress={handleShowAchievements}
            testID="tutorial-continue"
          />
        </View>
      )}
    </SafeAreaView>
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
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["3xl"],
  },
  photoWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  samplePhoto: {
    width: "100%",
    aspectRatio: 9 / 16,
    maxHeight: "100%",
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.paper,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    ...Shadows.sm,
  },
  ctaWrapper: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  revealContainer: {
    flex: 1,
    backgroundColor: Colors.stage,
  },
  revealScroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing["3xl"],
    alignItems: "center",
  },
  tutorialBanner: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  tutorialCard: {
    alignSelf: "center",
    width: "90%",
  },
  achievementsList: {
    alignSelf: "stretch",
    gap: Spacing.md,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TutorialCaptureScreen;
