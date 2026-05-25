import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  ChevronsUp,
} from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Shadows } from "../theme";
import { Text } from "../components/atoms";
import { BirdCard } from "../components/molecules/BirdCard";
import {
  useCards,
  useAllSpecies,
  useSightingsForSpecies,
} from "../hooks/useApi";
import type { CollectionStackParamList } from "../navigation/stacks/CollectionStack";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RouteProps = RouteProp<CollectionStackParamList, "CardDetail">;
type Nav = NativeStackNavigationProp<CollectionStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.6;

export const CardDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const { speciesId } = route.params;

  const { data: allSpecies } = useAllSpecies();
  const { data: cards } = useCards();
  const { data: sightingsData } = useSightingsForSpecies(speciesId);

  // Animation values
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.3);
  const cardOpacity = useSharedValue(0);
  const cardTranslateX = useSharedValue(0);
  const sheetTranslateY = useSharedValue(60);
  const sheetOpacity = useSharedValue(0);

  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 250 });
    cardScale.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) });
    cardOpacity.value = withTiming(1, { duration: 200 });
    cardTranslateX.value = 0;
    sheetTranslateY.value = withDelay(150, withTiming(0, { duration: 200 }));
    sheetOpacity.value = withDelay(150, withTiming(1, { duration: 150 }));
  }, []);

  const animateOut = (cb: () => void) => {
    sheetOpacity.value = withTiming(0, { duration: 120 });
    sheetTranslateY.value = withTiming(60, { duration: 150 });
    cardScale.value = withTiming(0.6, { duration: 200 });
    cardOpacity.value = withTiming(0, { duration: 180 });
    overlayOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(cb)();
    });
  };

  const swipeToCard = (direction: "left" | "right", nextId: string) => {
    const exitX = direction === "left" ? -SCREEN_WIDTH : SCREEN_WIDTH;
    cardTranslateX.value = withTiming(exitX, { duration: 200 }, () => {
      runOnJS(goToCard)(nextId);
    });
  };

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((e) => {
      cardTranslateX.value = e.translationX;
    })
    .onEnd((e) => {
      const threshold = SCREEN_WIDTH * 0.25;
      if (e.translationX < -threshold && hasNext) {
        runOnJS(swipeToCard)("left", allCards[currentIndex + 1].species_id);
      } else if (e.translationX > threshold && hasPrev) {
        runOnJS(swipeToCard)("right", allCards[currentIndex - 1].species_id);
      } else {
        cardTranslateX.value = withTiming(0, { duration: 150 });
      }
    });

  const handleBack = () => {
    animateOut(() => navigation.goBack());
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cardTranslateX.value },
      { scale: cardScale.value },
    ],
    opacity: cardOpacity.value,
  }));

  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
    opacity: sheetOpacity.value,
  }));

  const species = allSpecies?.find((s) => s.id === speciesId);
  const userCard = cards?.find((c) => c.species_id === speciesId);
  const sightings = (sightingsData ?? []).sort(
    (a, b) =>
      new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()
  );

  const allCards = cards ?? [];
  const currentIndex = allCards.findIndex((c) => c.species_id === speciesId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allCards.length - 1 && currentIndex >= 0;

  const goToCard = (id: string) => {
    navigation.replace("CardDetail", { speciesId: id });
  };

  // Still loading data
  if (!allSpecies) {
    return (
      <View style={styles.container}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.overlayBg, overlayStyle]} />
      </View>
    );
  }

  if (!species) {
    return (
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleBack} />
        <SafeAreaView style={styles.centered}>
          <Text variant="regular" size="base" color={Colors.white} testID="card-detail-not-found">
            Species not found
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  const isSpotted = !!userCard;
  const lastSighting = sightings[0];
  const lastSpottedLabel = lastSighting
    ? getRelativeDate(lastSighting.captured_at)
    : null;

  return (
    <View style={styles.container} testID="card-detail-screen">
      {/* Animated dark overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.overlayBg, overlayStyle]} />

      {/* Tap backdrop to close */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleBack}
        testID="card-detail-backdrop"
      />

      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        {/* Top bar */}
        <View style={styles.topBar} pointerEvents="box-none">
          <Pressable
            style={styles.backBtn}
            onPress={handleBack}
            testID="card-detail-back"
          >
            <ChevronLeft size={24} color={Colors.white} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Card + nav arrows */}
        <GestureDetector gesture={swipeGesture}>
        <Animated.View style={[styles.cardRow, cardAnimStyle]} pointerEvents="box-none">
          {/* Left arrow */}
          <Pressable
            style={[styles.navArrow, !hasPrev && styles.navArrowHidden]}
            onPress={() => hasPrev && goToCard(allCards[currentIndex - 1].species_id)}
            disabled={!hasPrev}
            testID="card-detail-prev"
          >
            <ChevronLeft size={28} color={Colors.white} strokeWidth={2.5} />
          </Pressable>

          {/* Card */}
          <View style={[styles.cardWrapper, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
            <BirdCard
              data={{
                speciesName: species.common_name,
                familyName: species.family,
                speciesType: species.species_type_name,
                habitat: species.habitat_name,
                conservationTier: species.conservation_status as any,
                photoUri: userCard?.hero_photo_url ?? null,
                size: species.size,
                about: species.about_text,
                firstSight: isSpotted
                  ? `${formatDate(userCard!.first_seen_at)}${lastSighting?.named_location ? `, ${lastSighting.named_location}` : ""}`
                  : undefined,
                sightingCount: userCard?.sighting_count,
                locked: !isSpotted,
              }}
              testID="card-detail-bird-card"
            />
          </View>

          {/* Right arrow */}
          <Pressable
            style={[styles.navArrow, !hasNext && styles.navArrowHidden]}
            onPress={() => hasNext && goToCard(allCards[currentIndex + 1].species_id)}
            disabled={!hasNext}
            testID="card-detail-next"
          >
            <ChevronRight size={28} color={Colors.white} strokeWidth={2.5} />
          </Pressable>
        </Animated.View>
        </GestureDetector>

        {/* Bottom sheet */}
        <Animated.View style={[styles.bottomSheet, sheetAnimStyle]} testID="card-detail-bottom-sheet">
          {isSpotted && lastSighting ? (
            <>
              <View style={styles.sheetRow}>
                <View style={styles.locationPin}>
                  <MapPin size={18} color={Colors.coral} strokeWidth={2} />
                </View>
                <View style={styles.sheetInfo}>
                  <Text
                    variant="regular"
                    size="xs"
                    color={Colors.inkFaint}
                    testID="card-detail-last-spotted-label"
                    style={{ textTransform: "uppercase", letterSpacing: 1 }}
                  >
                    {`Last spotted ${lastSpottedLabel}`}
                  </Text>
                  <Text
                    variant="semiBold"
                    size="base"
                    color={Colors.ink}
                    testID="card-detail-location"
                  >
                    {lastSighting.named_location ?? "Unknown location"}
                  </Text>
                </View>
                <View style={styles.sightingsBadge}>
                  <Star size={12} color={Colors.saffron} strokeWidth={2} fill={Colors.saffron} />
                  <Text
                    variant="semiBold"
                    size="xs"
                    color={Colors.saffron}
                    testID="card-detail-sighting-count"
                  >
                    {`${userCard!.sighting_count} sighting${userCard!.sighting_count === 1 ? "" : "s"}`}
                  </Text>
                </View>
              </View>
              {sightings.length > 1 && (
                <View style={styles.sheetHint}>
                  <ChevronsUp size={14} color={Colors.inkFaint} strokeWidth={1.5} />
                  <Text variant="regular" size="xs" color={Colors.inkFaint}>
                    Swipe up for sightings
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.unspottedSheet}>
              <Text
                variant="semiBold"
                size="base"
                color={Colors.ink}
                align="center"
                testID="card-detail-unspotted-text"
              >
                Not yet spotted
              </Text>
              <Text
                variant="regular"
                size="sm"
                color={Colors.inkSoft}
                align="center"
                testID="card-detail-unspotted-hint"
                style={{ marginTop: Spacing.xs }}
              >
                Head out and capture one to add it to your collection
              </Text>
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getRelativeDate(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayBg: {
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
  },
  navArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  navArrowHidden: {
    opacity: 0,
  },
  cardWrapper: {
    marginHorizontal: Spacing.sm,
  },
  bottomSheet: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  locationPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetInfo: {
    flex: 1,
    gap: 2,
  },
  sightingsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.cream,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  sheetHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.paper,
  },
  unspottedSheet: {
    paddingVertical: Spacing.sm,
  },
});

export default CardDetailScreen;
