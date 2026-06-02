import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { TouchableOpacity } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import {
  ChevronLeft,
  MapPin,
  Star,
  ChevronRight as ChevronRightSmall,
  ChevronUp,
  Eye,
} from "lucide-react-native";
import { BlurView } from "expo-blur";
import Toast from "react-native-toast-message";
import { toastConfig } from "../config/toast";
import { Colors, Spacing, BorderRadius, Shadows, RarityConfig } from "../theme";
import { Text, InfoCard } from "../components/atoms";
import { Image } from "expo-image";
import { BirdCard } from "../components/molecules/BirdCard";
import { GestureCardContainer } from "../components/molecules/GestureCardContainer";
import { ShinyCardOverlay } from "../components/molecules/ShinyCardOverlay";
import {
  useCards,
  useAllSpecies,
  useSpecies,
  useSightingsForSpecies,
  useSpeciesStates,
} from "../hooks/useApi";
import { USStatesMap } from "../components/molecules/USStatesMap";
import { isAllCardsUnlocked } from "../services/devSettings";
import type { CollectionStackParamList } from "../navigation/stacks/CollectionStack";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RouteProps = RouteProp<CollectionStackParamList, "CardDetail">;
type Nav = NativeStackNavigationProp<CollectionStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.92;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.65;

export const CardDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const { speciesId, showAsLocked, speciesSnapshot } = route.params as {
    speciesId: string;
    showAsLocked?: boolean;
    speciesSnapshot?: any;
  };
  const insets = useSafeAreaInsets();

  const { data: allSpecies } = useAllSpecies();
  const { data: singleSpecies, isLoading: speciesLoading } = useSpecies(speciesId);
  const { data: cards, isLoading: cardsLoading } = useCards();
  const { data: sightingsData, isLoading: sightingsLoading } = useSightingsForSpecies(speciesId);
  const { data: speciesStates } = useSpeciesStates(speciesId);

  // Shiny card gradient center
  const [gradientCenter, setGradientCenter] = useState({
    x: CARD_WIDTH / 2,
    y: CARD_HEIGHT / 2,
  });

  const MAX_ANGLE = 8;

  const handleRotationChange = useCallback((rx: number, ry: number) => {
    "worklet";
    runOnJS(setGradientCenter)({
      x: CARD_WIDTH / 2 + (CARD_WIDTH / 2) * (ry / MAX_ANGLE),
      y: CARD_HEIGHT / 2 + (CARD_HEIGHT / 2) * (rx / MAX_ANGLE),
    });
  }, []);

  // Bottom sheet
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["12%", "50%"], []);
  const [sheetIndex, setSheetIndex] = useState(0);

  // Animation values
  const overlayOpacity = useSharedValue(0);
  const enterScale = useSharedValue(0.3);
  const cardOpacity = useSharedValue(0);
  const sheetAnimatedIndex = useSharedValue(0);
  const hasAnimated = useRef(false);

  // Dim overlay immediately
  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 250 });
  }, []);

  // Animate card in once data is ready — card is rendered at opacity 0 from the start
  // so expo-image begins loading immediately
  useEffect(() => {
    if (hasAnimated.current) return;
    if (!species) return;
    if (cardsLoading || sightingsLoading) return;

    hasAnimated.current = true;
    // Small delay to let the image decode from cache/network
    setTimeout(() => {
      enterScale.value = withTiming(1, {
        duration: 350,
        easing: Easing.out(Easing.cubic),
      });
      cardOpacity.value = withTiming(1, { duration: 200 });
    }, 100);
  }, [species, cardsLoading, sightingsLoading]);

  const animateOut = (cb: () => void) => {
    bottomSheetRef.current?.close();
    enterScale.value = withTiming(0.6, { duration: 200 });
    cardOpacity.value = withTiming(0, { duration: 180 });
    overlayOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(cb)();
    });
  };

  const handleBack = () => {
    animateOut(() => navigation.goBack());
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardAnimStyle = useAnimatedStyle(() => {
    // animatedIndex: 0 = minimized (12%), 1 = expanded (50%)
    const sheetScale = interpolate(
      sheetAnimatedIndex.value,
      [0, 1],
      [1, 0.5],
      Extrapolation.CLAMP,
    );
    const scale = Math.min(enterScale.value, sheetScale);
    const sheetTranslateY = interpolate(
      sheetAnimatedIndex.value,
      [0, 1],
      [0, -SCREEN_HEIGHT * 0.25],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateY: sheetTranslateY },
        { scale },
      ],
      opacity: cardOpacity.value,
    };
  });

  // Use snapshot for instant render, singleSpecies as authoritative once loaded
  const species = singleSpecies ?? speciesSnapshot ?? allSpecies?.find((s) => s.id === speciesId);
  const userCard = cards?.find((c) => c.species_id === speciesId);
  const sightings = (sightingsData ?? []).sort(
    (a, b) =>
      new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime(),
  );

  // Show loading overlay while species data is resolving
  // Card renders at opacity 0 below so images start loading immediately
  if (!species) {
    return (
      <View style={styles.container}>
        <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, styles.overlayBg]} />
        </Animated.View>
      </View>
    );
  }

  const isSpotted = !!userCard;
  const dataReady = !cardsLoading && !sightingsLoading;
  const lastSighting = sightings[0];
  const firstSighting = sightings.length > 0 ? sightings[sightings.length - 1] : null;

  return (
    <View style={styles.container} testID="card-detail-screen">
      {/* Blurred dark overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.overlayBg]} />
      </Animated.View>

      {/* Tap backdrop — minimize sheet if expanded, otherwise close */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => {
          if (sheetIndex > 0) {
            bottomSheetRef.current?.snapToIndex(0);
          } else {
            handleBack();
          }
        }}
        testID="card-detail-backdrop"
      />

      {/* Top bar — absolute, above everything */}
      <View
        style={[styles.topBarSafe, { paddingTop: insets.top }]}
        pointerEvents="box-none"
      >
        <View style={styles.topBar} pointerEvents="box-none">
          <Pressable
            style={styles.backBtn}
            onPress={handleBack}
            testID="card-detail-back"
          >
            <ChevronLeft size={24} color={Colors.white} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      {/* Bottom sheet — absolute bottom, overlays card */}

      <SafeAreaView style={styles.cardArea} pointerEvents="box-none">
        <Animated.View
          style={[styles.cardRow, cardAnimStyle]}
          pointerEvents="box-none"
        >
          <View style={styles.cardWrapper}>
            <GestureCardContainer
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
              maxAngle={MAX_ANGLE}
              onRotationChange={handleRotationChange}
            >
              <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
                <BirdCard
                  data={{
                    speciesName: species.common_name,
                    familyName: species.family,
                    speciesType: species.species_type_name,
                    habitat: species.habitat_name,
                    conservationTier: species.conservation_status as any,
                    photoUri: isSpotted && !showAsLocked
                      ? (userCard?.hero_photo_url ?? (species as any).illustration_url ?? null)
                      : ((species as any).illustration_url ?? null),
                    size: species.size,
                    about: species.about_text,
                    firstSight: isSpotted
                      ? `${formatDate(userCard!.first_seen_at)}${firstSighting?.setting ? `, ${firstSighting.setting}` : ""}${firstSighting?.named_location ? `, ${firstSighting.named_location}` : ""}`
                      : undefined,
                    sightingCount: userCard?.sighting_count,
                    locked: isAllCardsUnlocked() ? false : (dataReady && !isSpotted),
                    rarity: species.rarity,
                    allPhotos: isSpotted && !showAsLocked && sightings.length > 1 ? sightings.map((s) => s.photo_url) : undefined,
                    photoQuality: !showAsLocked ? lastSighting?.photo_quality : undefined,
                    illustrationUrl: (species as any).illustration_url,
                    illustrationAttribution: (species as any).illustration_attribution,
                  }}
                  onAudioPress={() => {
                    Toast.show({
                      type: "info",
                      text1: "Coming soon",
                      text2: "Bird calls will be available in a future update.",
                    });
                  }}
                  testID="card-detail-bird-card"
                />
                <ShinyCardOverlay
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT}
                  borderRadius={BorderRadius["2xl"]}
                  gradientCenter={gradientCenter}
                  intensity={RarityConfig[species.rarity ?? "common"].shimmerIntensity}
                  hue={RarityConfig[species.rarity ?? "common"].shimmerHue}
                />
              </View>
            </GestureCardContainer>
          </View>
        </Animated.View>
      </SafeAreaView>

      {/* Bottom Sheet */}
      <BottomSheet
        key={speciesId}
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={setSheetIndex}
        animatedIndex={sheetAnimatedIndex}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
        style={styles.sheetContainer}
      >
          <BottomSheetScrollView
            contentContainerStyle={styles.sheetContent}
            scrollEnabled={sheetIndex > 0}
          >
            {isSpotted && sightings.length > 0 ? (
              <>
                {/* Header */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => bottomSheetRef.current?.snapToIndex(sheetIndex === 0 ? 1 : 0)}
                >
                <View style={styles.sheetSummaryRow}>
                  <MapPin size={22} color={Colors.coral} strokeWidth={2} />
                  <View style={styles.sightingInfo}>
                    <Text variant="semiBold" size="lg" color={Colors.ink}>
                      Your sightings
                    </Text>
                    <Text variant="regular" size="xs" color={Colors.inkSoft}>
                      {`${sightings.length} spot${sightings.length === 1 ? "" : "s"}${uniqueLocations(sightings) > 1 ? ` across ${uniqueLocations(sightings)} locations` : ""} · since ${formatShortDate(userCard!.first_seen_at)}`}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.expandBtn}
                    onPress={() =>
                      bottomSheetRef.current?.snapToIndex(
                        sheetIndex < 1 ? 1 : 0,
                      )
                    }
                    testID="card-detail-expand-sheet"
                  >
                    <ChevronUp
                      size={20}
                      color={Colors.inkSoft}
                      strokeWidth={2}
                      style={undefined}
                    />
                  </Pressable>
                </View>
                </TouchableOpacity>

                {/* Recent sightings */}
                <View style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
                  <Text
                    variant="semiBold"
                    size="xs"
                    color={Colors.inkFaint}
                    style={{ textTransform: "uppercase", letterSpacing: 1 }}
                  >
                    Recent sightings
                  </Text>
                  {sightings.length > 3 && (
                    <Text variant="semiBold" size="xs" color={Colors.sage}>
                      {`View all ${sightings.length} →`}
                    </Text>
                  )}
                </View>

                {sightings.slice(0, 5).map((sighting) => (
                  <View
                    key={sighting.id}
                    style={styles.sightingRow}
                    testID={`sighting-${sighting.id}`}
                  >
                    {sighting.photo_url ? (
                      <View style={styles.sightingPhoto}>
                        <Image
                          source={{ uri: sighting.photo_url }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                          cachePolicy="disk"
                        />
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.sightingPhoto,
                          {
                            backgroundColor: Colors.sageTint,
                            alignItems: "center",
                            justifyContent: "center",
                          },
                        ]}
                      >
                        <MapPin
                          size={16}
                          color={Colors.sage}
                          strokeWidth={1.5}
                        />
                      </View>
                    )}
                    <View style={styles.sightingInfo}>
                      <Text variant="semiBold" size="sm" color={Colors.ink}>
                        {`${getRelativeLabel(sighting.captured_at)} · ${formatTime(sighting.captured_at)}`}
                      </Text>
                      <Text variant="regular" size="xs" color={Colors.inkSoft}>
                        {sighting.named_location ?? "Unknown location"}
                      </Text>
                    </View>
                    <ChevronRightSmall
                      size={16}
                      color={Colors.inkFaint}
                      strokeWidth={1.5}
                    />
                  </View>
                ))}

                {/* Map placeholder — only at highest snap */}
                <View style={styles.mapPreview} testID="card-detail-map">
                  <USStatesMap
                    highlightedStates={speciesStates ?? []}
                    highlightColor={Colors.coral}
                    width="100%"
                    height={160}
                  />
                </View>

                {/* Distinguishing feature */}
                {species.distinguishing_feature && (
                  <View style={{ marginTop: Spacing.md }}>
                    <InfoCard
                      icon={<Eye size={20} color={Colors.sage} strokeWidth={2} />}
                      title="How to identify"
                      description={species.distinguishing_feature}
                      testID="card-detail-distinguishing"
                    />
                  </View>
                )}
              </>
            ) : (
              <>
                {/* Not spotted */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => bottomSheetRef.current?.snapToIndex(sheetIndex === 0 ? 1 : 0)}
                >
                <View
                  style={[
                    styles.sheetSummaryRow,
                    { paddingVertical: Spacing.md },
                  ]}
                >
                  <MapPin size={22} color={Colors.inkFaint} strokeWidth={2} />
                  <View style={styles.sightingInfo}>
                    <Text variant="semiBold" size="lg" color={Colors.ink}>
                      Not yet spotted
                    </Text>
                    <Text variant="regular" size="xs" color={Colors.inkSoft}>
                      Swipe up to see where to find them
                    </Text>
                  </View>
                  <Pressable
                    style={styles.expandBtn}
                    onPress={() =>
                      bottomSheetRef.current?.snapToIndex(
                        sheetIndex < 1 ? 1 : 0,
                      )
                    }
                    testID="card-detail-expand-sheet-empty"
                  >
                    <ChevronUp
                      size={20}
                      color={Colors.inkSoft}
                      strokeWidth={2}
                      style={undefined}
                    />
                  </Pressable>
                </View>
                </TouchableOpacity>

                <View
                  style={[styles.mapPreview, { marginTop: Spacing.lg }]}
                  testID="card-detail-map-empty"
                >
                  <USStatesMap
                    highlightedStates={speciesStates ?? []}
                    width="100%"
                    height={280}
                  />
                </View>

                {/* Distinguishing feature */}
                {species.distinguishing_feature && (
                  <View style={{ marginTop: Spacing.md }}>
                    <InfoCard
                      icon={<Eye size={20} color={Colors.sage} strokeWidth={2} />}
                      title="How to identify"
                      description={species.distinguishing_feature}
                      testID="card-detail-distinguishing-empty"
                    />
                  </View>
                )}
              </>
            )}
          </BottomSheetScrollView>
      </BottomSheet>

      <Toast config={toastConfig} topOffset={60} />
    </View>
  );
};

function uniqueLocations(
  sightings: { named_location: string | null }[],
): number {
  return new Set(sightings.map((s) => s.named_location).filter(Boolean)).size;
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getRelativeLabel(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayBg: {
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  topBarSafe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  cardArea: {
    flex: 1,
    justifyContent: "center",
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
  cardWrapper: {
    marginHorizontal: Spacing.sm,
  },
  sheetContainer: {
    zIndex: 10,
  },
  sheetBackground: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  sheetHandle: {
    backgroundColor: Colors.paper,
    width: 36,
  },
  sheetContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["4xl"],
  },
  sheetSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingBottom: Spacing["3xl"],
  },
  locationPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
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
  expandBtn: {
    minWidth: 32,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.paper,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    flexGrow: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sightingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.paper,
  },
  sightingPhoto: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  sightingInfo: {
    flex: 1,
    flexShrink: 1,
    gap: 2,
  },
  mapPreview: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.paper,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});

export default CardDetailScreen;
