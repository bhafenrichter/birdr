import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors, Spacing, BorderRadius, Shadows } from "../../theme";
import { Text } from "../../components/atoms";
import { BirdCard } from "../../components/molecules/BirdCard";
import type { CaptureFlowParamList } from "../../navigation/stacks/CaptureFlowStack";

type Nav = NativeStackNavigationProp<CaptureFlowParamList>;

// ── Shame species roster ─────────────────────────────────────────────────

const SHAME_BIRDS = [
  {
    speciesName: "Pixel Pigeon",
    familyName: "Digitalis screenicus",
    about: "Known to lurk near Google Images. Rarely seen in the wild.",
  },
  {
    speciesName: "Screenshot Sparrow",
    familyName: "Capturus monitoris",
    about: "Thrives in browser tabs. Startled by the Print Screen key.",
  },
  {
    speciesName: "WiFi Warbler",
    familyName: "Routerus songbirdia",
    about: "Its call sounds suspiciously like a buffering wheel.",
  },
  {
    speciesName: "Cursor Crow",
    familyName: "Clickius desktopus",
    about: "Nests exclusively on desktop wallpapers.",
  },
];

const SHAME_BORDER: [string, string] = ["#9E9E9E", "#616161"];

export const ShameCardScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  // Pick a random shame bird
  const [shameBird] = useState(
    () => SHAME_BIRDS[Math.floor(Math.random() * SHAME_BIRDS.length)],
  );

  // Animation values
  const bgOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.3);
  const cardOpacity = useSharedValue(0);
  const bannerOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    // Dim background
    bgOpacity.value = withTiming(0.85, { duration: 600 });

    // Card appears
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      cardOpacity.value = withTiming(1, { duration: 500 });
      cardScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    }, 800);

    // Banner
    setTimeout(() => {
      bannerOpacity.value = withTiming(1, { duration: 400 });
    }, 1600);

    // CTA
    setTimeout(() => {
      ctaOpacity.value = withTiming(1, { duration: 400 });
    }, 2200);
  }, []);

  const handleClose = useCallback(() => {
    navigation.getParent()?.goBack();
  }, [navigation]);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const bannerStyle = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container} testID="shame-card-screen">
      {/* Banner */}
      <Animated.View style={[styles.bannerContainer, bannerStyle]}>
        <Text
          variant="bold"
          size="xs"
          color="#9E9E9E"
          align="center"
          style={{ letterSpacing: 2, textTransform: "uppercase" }}
          testID="shame-first-sight-label"
        >
          First Sight
        </Text>
        <Text
          variant="bold"
          size="2xl"
          color={Colors.white}
          align="center"
          testID="shame-banner-name"
        >
          {shameBird.speciesName}
        </Text>
        <Text
          variant="regular"
          size="sm"
          color="rgba(255,255,255,0.5)"
          align="center"
          style={{ marginTop: Spacing.xs, fontStyle: "italic" }}
          testID="shame-banner-scientific"
        >
          {shameBird.familyName}
        </Text>
      </Animated.View>

      {/* Shame card */}
      <Animated.View style={[styles.cardContainer, cardStyle]}>
        <BirdCard
          data={{
            speciesName: shameBird.speciesName,
            familyName: shameBird.familyName,
            speciesType: "Screen Dweller",
            habitat: "Living rooms & office desks",
            conservationTier: "LC",
            photoUri: null,
            sightingCount: 0,
            locked: false,
            rarity: "common" as any,
            size: "1920 × 1080 pixels",
            about: shameBird.about,
            firstSight: "Just now, at your desk",
            shameBorder: SHAME_BORDER,
            shamePhoto: true,
          }}
          testID="shame-card"
        />
      </Animated.View>

      {/* Bottom CTA */}
      <Animated.View style={[styles.bottomContainer, ctaStyle]}>
        <View style={styles.tipCard}>
          <Text variant="semiBold" size="sm" color={Colors.white}>
            Nice try!
          </Text>
          <Text variant="regular" size="xs" color="rgba(255,255,255,0.6)">
            We only count real birds. Go find one outside!
          </Text>
        </View>

        <Pressable
          style={styles.closeBtn}
          onPress={handleClose}
          testID="shame-close"
        >
          <Text variant="semiBold" size="base" color={Colors.white}>
            Fine, I'll go touch grass
          </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.stage,
  },
  bannerContainer: {
    alignItems: "center",
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
    maxHeight: "65%",
  },
  bottomContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  tipCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: 2,
  },
  closeBtn: {
    backgroundColor: "#616161",
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
});

export default ShameCardScreen;
