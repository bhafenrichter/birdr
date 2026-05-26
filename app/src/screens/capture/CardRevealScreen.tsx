import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, StyleSheet, Pressable, Platform, Dimensions } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Location from "expo-location";
import ConfettiCannon from "react-native-confetti-cannon";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import {
  Colors,
  ConservationTierColors,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../theme";
import { Text } from "../../components/atoms";
import { BirdCardThumb } from "../../components/molecules/BirdCard";
import { confirmSighting } from "../../services/api";
import { useAllSpecies, useSpecies } from "../../hooks/useApi";
import { useAuth } from "../../contexts/AuthProvider";
import { usePostHog } from "../../contexts/PostHogProvider";
import type { CaptureFlowParamList } from "../../navigation/stacks/CaptureFlowStack";
import type { ConservationStatus, ConfirmSightingResponse } from "../../types/api";

type Nav = NativeStackNavigationProp<CaptureFlowParamList>;
type Route = RouteProp<CaptureFlowParamList, "CardReveal">;

// Rarity intensity scaling per PRD §6.7
const RARITY_SCALE: Record<
  ConservationStatus,
  { durationMult: number; haptic: Haptics.ImpactFeedbackStyle }
> = {
  LC: { durationMult: 1.0, haptic: Haptics.ImpactFeedbackStyle.Light },
  NT: { durationMult: 1.1, haptic: Haptics.ImpactFeedbackStyle.Light },
  VU: { durationMult: 1.25, haptic: Haptics.ImpactFeedbackStyle.Medium },
  EN: { durationMult: 1.4, haptic: Haptics.ImpactFeedbackStyle.Medium },
  CR: { durationMult: 1.6, haptic: Haptics.ImpactFeedbackStyle.Heavy },
};

export const CardRevealScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { photoUri, speciesId, commonName, conservationStatus, location, setting, photo_quality } =
    route.params;
  const { refreshProfile } = useAuth();
  const posthog = usePostHog();

  const { data: allSpecies } = useAllSpecies();
  const { data: singleSpecies } = useSpecies(speciesId);
  const species = allSpecies?.find((s) => s.id === speciesId) ?? singleSpecies;

  console.log("[CardReveal] species data:", {
    hasAllSpecies: !!allSpecies?.length,
    hasSingleSpecies: !!singleSpecies,
    speciesId,
    rarity: species?.rarity,
    habitat: species?.habitat_name,
    type: species?.species_type_name,
  });

  const tier = (conservationStatus ?? "LC") as ConservationStatus;
  const tierColor = ConservationTierColors[tier];
  const scale = RARITY_SCALE[tier];

  const [beat, setBeat] = useState(0); // 0=init, 1=identifying, 2=match, 3=card, 4=banner, 5=settled
  const [confirmResult, setConfirmResult] =
    useState<ConfirmSightingResponse | null>(null);
  const [canSkip, setCanSkip] = useState(false);
  const confirmedRef = useRef(false);

  // Animation values
  const bgOpacity = useSharedValue(0);
  const particleOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.3);
  const cardOpacity = useSharedValue(0);
  const bannerOpacity = useSharedValue(0);
  const settledScale = useSharedValue(1);
  const bonusOpacity = useSharedValue(0);

  // Confirm the sighting in background while animation plays
  useEffect(() => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;

    (async () => {
      try {
        // Read photo as base64
        const base64 = await FileSystem.readAsStringAsync(photoUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Reverse geocode lat/lon to a readable location name
        let namedLocation: string | undefined;
        if (location?.lat && location?.lon) {
          try {
            const [geo] = await Location.reverseGeocodeAsync({
              latitude: location.lat,
              longitude: location.lon,
            });
            if (geo) {
              const city = geo.city || geo.subregion || geo.district;
              const state = geo.region;
              if (city && state) {
                namedLocation = `${city}, ${state}`;
              } else if (state) {
                namedLocation = state;
              } else if (city) {
                namedLocation = city;
              }
            }
          } catch {}
        }

        const result = await confirmSighting({
          species_id: speciesId,
          photo_base64: base64,
          photo_mime_type: "image/jpeg",
          lat: location?.lat,
          lon: location?.lon,
          named_location: namedLocation,
          setting,
          photo_quality,
        });

        setConfirmResult(result);
        await refreshProfile();

        posthog.capture("sighting_confirmed", {
          species_id: speciesId,
          common_name: commonName,
          conservation_status: tier,
          is_first_sight: result.is_first_sight,
          sighting_count: result.card.sighting_count,
          photo_quality,
        });

        if ((result.streak as any)?.streak_extended) {
          posthog.capture("streak_extended", { current_streak: result.streak.current_streak, longest_streak: result.streak.longest_streak });
        }

        for (const ach of result.achievements_unlocked) {
          posthog.capture("achievement_unlocked", { achievement_id: ach.achievement_id, name: ach.name, category: ach.category });
        }

        // If it was a repeat sighting (not first sight), show toast and go back
        if (!result.is_first_sight) {
          Toast.show({
            type: "sighting",
            text1: "Spotted again!",
            text2: `${commonName} — sighting #${result.card.sighting_count}`,
            position: "top",
          });
          navigation.getParent()?.goBack();
          return;
        }
      } catch (e: any) {
        // Confirm failed but we still show the reveal with optimistic data
        setConfirmResult({
          sighting_id: "pending",
          is_first_sight: true,
          card: {
            species_id: speciesId,
            common_name: commonName,
            scientific_name: "",
            conservation_status: tier,
            sighting_count: 1,
          },
          streak: { current_streak: 0, longest_streak: 0 },
          achievements_unlocked: [],
        });
      }
    })();
  }, []);

  // Run the 5-beat animation sequence
  useEffect(() => {
    const d = scale.durationMult;

    // Beat 1: Identifying (background dims)
    setBeat(1);
    bgOpacity.value = withTiming(0.85, { duration: 800 * d });

    // Beat 2: Match found (~1.5s in)
    const beat2Delay = 1500 * d;
    setTimeout(() => {
      setBeat(2);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      particleOpacity.value = withTiming(1, { duration: 300 });
      setCanSkip(true);
    }, beat2Delay);

    // Beat 3: Card materializes (~2.5s in)
    const beat3Delay = 2500 * d;
    setTimeout(() => {
      setBeat(3);
      Haptics.impactAsync(scale.haptic);
      cardOpacity.value = withTiming(1, { duration: 500 });
      cardScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    }, beat3Delay);

    // Beat 4: First Sight banner (~3.5s in)
    const beat4Delay = 3500 * d;
    setTimeout(() => {
      setBeat(4);
      bannerOpacity.value = withTiming(1, { duration: 400 });
    }, beat4Delay);

    // Beat 5: Settled (~4.5s in)
    const beat5Delay = 4500 * d;
    setTimeout(() => {
      setBeat(5);
      settledScale.value = withTiming(0.85, { duration: 500 });
      bonusOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
      bgOpacity.value = withTiming(0, { duration: 600 });
    }, beat5Delay);
  }, []);

  const handleSkip = useCallback(() => {
    if (!canSkip) return;
    posthog.capture("card_reveal_skipped", { beat });
    setBeat(5);
    bgOpacity.value = withTiming(0, { duration: 300 });
    cardOpacity.value = withTiming(1, { duration: 200 });
    cardScale.value = withTiming(0.85, { duration: 300 });
    bannerOpacity.value = withTiming(1, { duration: 200 });
    bonusOpacity.value = withTiming(1, { duration: 200 });
  }, [canSkip]);

  const handleContinue = () => {
    // Back to viewfinder for next shot
    navigation.getParent()?.goBack();
  };

  // Animated styles
  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const particleStyle = useAnimatedStyle(() => ({
    opacity: particleOpacity.value,
  }));

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

  return (
    <Pressable
      style={styles.container}
      onPress={handleSkip}
      testID="card-reveal-screen"
    >
      {/* Dark overlay */}
      <Animated.View
        style={[styles.overlay, bgStyle]}
        testID="card-reveal-overlay"
      />

      {/* Confetti burst */}
      {beat >= 2 && (
        <ConfettiCannon
          count={80}
          origin={{ x: Dimensions.get("window").width / 2, y: -20 }}
          fadeOut
          autoStart
          explosionSpeed={300}
          fallSpeed={3000}
          colors={[tierColor, Colors.saffron, Colors.sage, Colors.white, "#FFD700"]}
        />
      )}

      {/* Card */}
      {beat >= 3 && (
        <Animated.View
          style={[styles.cardContainer, cardStyle]}
          testID="card-reveal-card"
        >
          <View style={{ width: Dimensions.get("window").width * 0.65 }}>
            <BirdCardThumb
              data={{
                speciesName: commonName,
                familyName: species?.family ?? "",
                speciesType: species?.species_type_name ?? "",
                habitat: species?.habitat_name ?? "",
                conservationTier: tier,
                photoUri: photoUri,
                sightingCount: 1,
                rarity: species?.rarity as any,
                about: species?.about_text,
              }}
              testID="card-reveal-thumb"
            />
          </View>
        </Animated.View>
      )}

      {/* First Sight banner — above card */}
      {beat >= 4 && (
        <Animated.View
          style={[styles.bannerContainer, bannerStyle]}
          testID="card-reveal-banner"
        >
          <Text
            variant="bold"
            size="xs"
            color={Colors.saffron}
            align="center"
            testID="card-reveal-first-sight-label"
            style={{ letterSpacing: 2, textTransform: "uppercase" }}
          >
            First Sight
          </Text>
          <Text
            variant="bold"
            size="2xl"
            color={Colors.white}
            align="center"
            testID="card-reveal-banner-name"
          >
            {commonName}
          </Text>
        </Animated.View>
      )}

      {/* Settled state: achievements + CTA */}
      {beat >= 5 && (
        <Animated.View
          style={[styles.settledContainer, bonusStyle]}
          testID="card-reveal-settled"
        >
          {/* Achievement cards — show streak + first achievement, then summarize the rest */}
          {confirmResult?.streak && confirmResult.streak.streak_extended && (
            <View style={styles.achievementCard}>
              <Text variant="bold" size="sm" color={Colors.coral}>🔥</Text>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text variant="semiBold" size="sm" color={Colors.white}>
                  {`${confirmResult.streak.current_streak}-day streak`}
                </Text>
                <Text variant="regular" size="xs" color="rgba(255,255,255,0.6)">
                  Keep it going!
                </Text>
              </View>
            </View>
          )}
          {confirmResult?.achievements_unlocked.slice(0, 1).map((ach) => (
            <View key={ach.achievement_id} style={styles.achievementCard}>
              <Text variant="bold" size="sm" color={Colors.saffron}>🏆</Text>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text variant="semiBold" size="sm" color={Colors.white}>
                  {ach.name}
                </Text>
                <Text variant="regular" size="xs" color="rgba(255,255,255,0.6)">
                  Achievement unlocked
                </Text>
              </View>
            </View>
          ))}
          {(confirmResult?.achievements_unlocked.length ?? 0) > 1 && (
            <View style={styles.achievementCard}>
              <Text variant="bold" size="sm" color={Colors.saffron}>🏆</Text>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text variant="semiBold" size="sm" color={Colors.white}>
                  {`+${confirmResult!.achievements_unlocked.length - 1} more achievement${confirmResult!.achievements_unlocked.length - 1 > 1 ? "s" : ""}`}
                </Text>
                <Text variant="regular" size="xs" color="rgba(255,255,255,0.6)">
                  Check your profile to see them all
                </Text>
              </View>
            </View>
          )}

          {/* Continue button */}
          <Pressable
            style={styles.continueBtn}
            onPress={handleContinue}
            testID="card-reveal-continue"
          >
            <Text variant="semiBold" size="base" color={Colors.white}>
              Continue
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.stage,
  },
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.stage,
  },
  cardContainer: {
    position: "absolute",
    top: "22%",
    alignSelf: "center",
  },
  bannerContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? "12%" : "8%",
    alignSelf: "center",
    alignItems: "center",
  },
  settledContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 50 : 30,
    left: Spacing.xl,
    right: Spacing.xl,
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  continueBtn: {
    backgroundColor: Colors.sage,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.md,
  },
});

export default CardRevealScreen;
