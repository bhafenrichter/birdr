import React, { useState, useCallback } from "react";
import {
  View,
  ViewStyle,
  ImageSourcePropType,
  LayoutChangeEvent,
  Dimensions,
  Pressable,
} from "react-native";
import { Pressable as GHPressable } from "react-native-gesture-handler";
import { Camera } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.6;
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Colors,
  ConservationTierColors,
  RarityConfig,
  Spacing,
  BorderRadius,
  Shadows,
  Fonts,
  FontSizes,
} from "../../theme";
import type { ConservationTier } from "../../theme";
import type { Rarity, PhotoQuality } from "../../types/api";
import { Text } from "../atoms/Text";
import { ConservationBadge } from "../atoms/ConservationBadge";
import { AudioBadge } from "../atoms/AudioBadge";
import { HabitatPill } from "../atoms/HabitatPill";
import { ShinyCardOverlay } from "./ShinyCardOverlay";

// ── Habitat background images ─────────────────────────────────────────────

const HABITAT_BACKGROUNDS: Record<string, ImageSourcePropType> = {
  Forests: require("../../../assets/habitats/forest.jpeg"),
  "Grasslands & farmland": require("../../../assets/habitats/grasslands.jpeg"),
  "Grasslands & Farmland": require("../../../assets/habitats/grasslands.jpeg"),
  "Deserts & scrublands": require("../../../assets/habitats/dessert.jpeg"),
  "Deserts & Scrublands": require("../../../assets/habitats/dessert.jpeg"),
  Wetlands: require("../../../assets/habitats/wetlands.jpeg"),
  Freshwater: require("../../../assets/habitats/wetlands.jpeg"),
  "Coasts & ocean": require("../../../assets/habitats/beach.jpeg"),
  "Coasts & Ocean": require("../../../assets/habitats/beach.jpeg"),
  Mountains: require("../../../assets/habitats/mountains.jpeg"),
  Tundra: require("../../../assets/habitats/tundra.jpeg"),
  "Cities & towns": require("../../../assets/habitats/city.jpeg"),
  "Cities & Towns": require("../../../assets/habitats/city.jpeg"),
};

function getHabitatBackground(habitat: string): ImageSourcePropType | null {
  return HABITAT_BACKGROUNDS[habitat] ?? null;
}

const HABITAT_COLORS: Record<string, string> = {
  Forests: "rgba(34, 100, 34, 1)",
  "Grasslands & farmland": "rgba(124, 152, 66, 1)",
  "Grasslands & Farmland": "rgba(124, 152, 66, 1)",
  "Deserts & scrublands": "rgba(194, 154, 88, 1)",
  "Deserts & Scrublands": "rgba(194, 154, 88, 1)",
  Wetlands: "rgba(60, 120, 100, 1)",
  Freshwater: "rgba(50, 120, 150, 1)",
  "Coasts & ocean": "rgba(60, 140, 170, 1)",
  "Coasts & Ocean": "rgba(60, 140, 170, 1)",
  Mountains: "rgba(100, 110, 130, 1)",
  Tundra: "rgba(160, 180, 190, 1)",
  "Cities & towns": "rgba(110, 110, 110, 1)",
  "Cities & Towns": "rgba(110, 110, 110, 1)",
};

function getHabitatColor(habitat: string): string {
  return HABITAT_COLORS[habitat] ?? "rgba(0, 141, 143, 1)";
}

// ── Photo quality config ─────────────────────────────────────────────────

const PHOTO_QUALITY_CONFIG: Record<string, { label: string; colors: [string, string] }> = {
  pristine: { label: "Pristine", colors: ["#CE93D8", "#7B1FA2"] },
  good: { label: "Good", colors: ["#64B5F6", "#1565C0"] },
  fair: { label: "Fair", colors: ["#A8D8A8", "#4CAF50"] },
  poor: { label: "Poor", colors: ["#9E9E9E", "#616161"] },
};

// ── Types ──────────────────────────────────────────────────────────────────

export interface BirdCardData {
  speciesName: string;
  familyName: string;
  speciesType?: string;
  habitat: string;
  conservationTier: ConservationTier;
  photoUri?: string | null;
  size?: string;
  about?: string;
  firstSight?: string;
  sightingCount?: number;
  locked?: boolean;
  rarity?: Rarity;
  illustrationUrl?: string | null;
  illustrationAttribution?: string | null;
  photoQuality?: PhotoQuality | null;
  /** All photo URIs for carousel (expanded card only) */
  allPhotos?: string[];
  /** Override border colors (used for shame cards) */
  shameBorder?: [string, string];
  /** Show the shame photo instead of normal photo */
  shamePhoto?: boolean;
}

export interface BirdCardProps {
  data: BirdCardData;
  onAudioPress?: () => void;
  onHabitatPress?: () => void;
  /** Compact variant for reveal/repeat screens — smaller text */
  compact?: boolean;
  testID: string;
}

// ── Full BirdCard (card detail) ────────────────────────────────────────────

export const BirdCard: React.FC<BirdCardProps> = ({
  data,
  onAudioPress,
  onHabitatPress,
  compact = false,
  testID,
}) => {
  const tierColor = ConservationTierColors[data.conservationTier];
  const isLocked = data.locked;
  const rc = RarityConfig[data.rarity ?? "common"];
  const borderColors = data.shameBorder ?? rc.borderColors;

  return (
    <View
      style={{ flex: 1, borderRadius: BorderRadius["2xl"], ...Shadows.md }}
      testID={testID}
    >
      <LinearGradient
        colors={[...borderColors] as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          borderRadius: BorderRadius["2xl"],
          padding: 8,
        }}
      >
        {/* Inner card body */}
        <View
          style={{
            flex: 1,
            borderRadius: BorderRadius["2xl"] - 4,
            backgroundColor: "transparent",
            overflow: "hidden",
          }}
        >
          {/* Habitat background — covers entire card */}
          {getHabitatBackground(data.habitat) && (
            <Image
              source={getHabitatBackground(data.habitat)!}
              style={{
                position: "absolute",
                width: "120%",
                height: "120%",
                top: "-10%",
                left: "-10%",
              }}
              contentFit="cover"
              testID={`${testID}-habitat-bg`}
            />
          )}

          {!isLocked && <GlossySheen />}

          {/* Header: family + name left, rarity badge right */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              paddingHorizontal: Spacing.lg,
              paddingTop: Spacing.lg,
              paddingBottom: Spacing.sm,
            }}
          >
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              {!compact && (
                <Text
                  variant="medium"
                  size="sm"
                  color="rgba(255,255,255,0.85)"
                  style={{
                    textShadowColor: "rgba(0,0,0,0.6)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                  }}
                  testID={`${testID}-family`}
                >
                  {data.speciesType || data.familyName}
                </Text>
              )}
              <Text
                variant="bold"
                size={compact ? "md" : "lg"}
                color={Colors.white}
                style={{
                  marginTop: -2,
                  textShadowColor: "rgba(0,0,0,0.6)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
                testID={`${testID}-name`}
              >
                {data.speciesName}
              </Text>
            </View>
            <LinearGradient
              colors={[...borderColors] as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingHorizontal: compact ? Spacing.sm : Spacing.md,
                paddingVertical: Spacing.xs,
                borderRadius: BorderRadius.md,
                marginTop: 2,
              }}
            >
              <Text
                variant="bold"
                size={compact ? "xs" : "sm"}
                color={Colors.white}
                testID={`${testID}-rarity`}
              >
                {rc.label}
              </Text>
            </LinearGradient>
          </View>

          {/* Hero photo with rarity gradient border */}
          <View style={{ marginHorizontal: Spacing.lg }}>
            <LinearGradient
              colors={[...borderColors] as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: BorderRadius.lg,
                padding: 4,
              }}
            >
              <View
                style={{
                  borderRadius: BorderRadius.lg - 2,
                  overflow: "hidden",
                  aspectRatio: 4 / 3,
                  backgroundColor: isLocked
                    ? getHabitatColor(data.habitat)
                    : Colors.paper,
                }}
              >
                {isLocked ? (
                  <View style={{ flex: 1 }}>
                    {data.illustrationUrl && (
                      <Image
                        source={{ uri: data.illustrationUrl }}
                        style={{ position: "absolute", width: "100%", height: "100%" }}
                        contentFit="cover"
                        testID={`${testID}-illustration`}
                      />
                    )}
                    <View
                      style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(0,0,0,0.45)",
                      }}
                    >
                      <Text
                        variant="bold"
                        size="3xl"
                        color={Colors.white}
                        testID={`${testID}-locked-placeholder`}
                      >
                        ?
                      </Text>
                      {data.illustrationAttribution && (
                        <Text
                          variant="regular"
                          size="xs"
                          color="rgba(255,255,255,0.5)"
                          style={{ position: "absolute", bottom: 4, left: 6 }}
                          testID={`${testID}-attribution`}
                        >
                          {`\u00A9 ${data.illustrationAttribution}`}
                        </Text>
                      )}
                    </View>
                  </View>
                ) : data.shamePhoto ? (
                  <Image
                    source={require("../../../assets/pixel-pigeon.jpg")}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    testID={`${testID}-shame-photo`}
                  />
                ) : data.allPhotos && data.allPhotos.length > 1 ? (
                  <PhotoCarousel
                    photos={data.allPhotos}
                    photoQuality={data.photoQuality}
                    testID={testID}
                  />
                ) : data.photoUri ? (
                  <>
                    <ThumbImage uri={data.photoUri} testID={`${testID}-photo`} />
                    {data.photoQuality && PHOTO_QUALITY_CONFIG[data.photoQuality] && (
                      <PhotoQualityBadge quality={data.photoQuality} />
                    )}
                  </>
                ) : (
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: Colors.paper,
                    }}
                    testID={`${testID}-no-photo`}
                  >
                    <ImageSkeleton color="rgba(0,0,0,0.06)" />
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>

          {/* Body text: Size, About, First Sight — inline label: value */}
          <View
            style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}
          >
            {data.about && (
              <View
                style={{ marginBottom: Spacing.sm }}
                testID={`${testID}-about`}
              >
                <Text
                  variant="bold"
                  size="md"
                  color={Colors.white}
                  style={{
                    lineHeight: 20,
                    textShadowColor: "rgba(0,0,0,0.5)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                  testID={`${testID}-about-text`}
                >
                  <Text
                    variant="extraBold"
                    size="md"
                    color={Colors.white}
                    testID={`${testID}-about-label`}
                  >
                    {"About: "}
                  </Text>
                  {data.about}
                </Text>
              </View>
            )}
            {(data.firstSight || !isLocked) && (
              <View
                style={{ marginBottom: Spacing.sm }}
                testID={`${testID}-firstsight`}
              >
                {data.firstSight ? (
                  <Text
                    variant="bold"
                    size="md"
                    color={Colors.white}
                    style={{
                      lineHeight: 20,
                      textShadowColor: "rgba(0,0,0,0.5)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }}
                    testID={`${testID}-firstsight-text`}
                  >
                    <Text
                      variant="extraBold"
                      size="md"
                      color={Colors.white}
                      testID={`${testID}-firstsight-label`}
                    >
                      {"First Sight: "}
                    </Text>
                    {data.firstSight}
                  </Text>
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      variant="extraBold"
                      size="md"
                      color={Colors.white}
                      style={{
                        textShadowColor: "rgba(0,0,0,0.5)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}
                    >
                      {"First Sight: "}
                    </Text>
                    <View
                      style={{
                        height: 12,
                        width: 120,
                        backgroundColor: "rgba(255,255,255,0.25)",
                        borderRadius: 3,
                      }}
                    />
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Footer: badges evenly spaced (hidden in compact) */}
          {!compact && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-evenly",
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.lg,
              }}
            >
              <ConservationBadge
                tier={data.conservationTier}
                size={44}
                testID={`${testID}-conservation-badge`}
              />
              <AudioBadge
                size={44}
                onPress={onAudioPress}
                testID={`${testID}-audio-badge`}
              />
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

// ── BirdCardThumb (collection grid) ────────────────────────────────────────

export interface BirdCardThumbProps {
  data: BirdCardData;
  onPress?: () => void;
  testID: string;
}

export const BirdCardThumb: React.FC<BirdCardThumbProps> = ({
  data,
  onPress,
  testID,
}) => {
  const tierColor = ConservationTierColors[data.conservationTier];
  const isLocked = data.locked;
  const rc = RarityConfig[data.rarity ?? "common"];
  const borderColors = data.shameBorder ?? rc.borderColors;
  const [cardSize, setCardSize] = useState({ w: 0, h: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== cardSize.w || height !== cardSize.h) {
      setCardSize({ w: width, h: height });
    }
  };

  return (
    <View
      style={{
        borderRadius: BorderRadius.xl,
        aspectRatio: CARD_WIDTH / CARD_HEIGHT,
        ...Shadows.sm,
      }}
      onLayout={onLayout}
      testID={testID}
    >
      {/* Gradient border */}
      <LinearGradient
        colors={[...borderColors] as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          borderRadius: BorderRadius.xl,
          padding: 6,
        }}
      >
        {/* Inner card body */}
        <View
          style={{
            flex: 1,
            borderRadius: BorderRadius.xl - 3,
            overflow: "hidden",
            backgroundColor: "transparent",
          }}
        >
          {/* Habitat background — covers entire card */}
          {getHabitatBackground(data.habitat) && (
            <Image
              source={getHabitatBackground(data.habitat)!}
              style={{
                position: "absolute",
                width: "120%",
                height: "120%",
                top: "-10%",
                left: "-10%",
              }}
              contentFit="cover"
              testID={`${testID}-habitat-bg`}
            />
          )}

          {/* Type + Name + Rarity badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              paddingHorizontal: Spacing.sm,
              paddingTop: Spacing.sm,
              paddingBottom: Spacing.xs,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                variant="semiBold"
                size="sm"
                color={Colors.white}
                style={{
                  textShadowColor: "rgba(0,0,0,0.7)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
                testID={`${testID}-thumb-name`}
              >
                {data.speciesName}
              </Text>
            </View>
            <LinearGradient
              colors={[...borderColors] as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingHorizontal: 4,
                paddingVertical: 2,
                borderRadius: BorderRadius.sm,
                marginLeft: Spacing.xs,
              }}
            >
              <Text
                variant="bold"
                size="xs"
                color={Colors.white}
                testID={`${testID}-rarity`}
              >
                {rc.badge}
              </Text>
            </LinearGradient>
          </View>

          {/* Photo / locked area — top portion */}
          <View
            style={{
              flex: 1,
              paddingHorizontal: Spacing.sm,
              paddingBottom: Spacing.xs,
            }}
          >
            {isLocked ? (
              <LinearGradient
                colors={[...borderColors] as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  borderRadius: BorderRadius.lg,
                  padding: 4,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    borderRadius: BorderRadius.lg - 2,
                    backgroundColor: getHabitatColor(data.habitat),
                    overflow: "hidden",
                  }}
                >
                  {data.illustrationUrl && (
                    <Image
                      source={{ uri: data.illustrationUrl }}
                      style={{ position: "absolute", width: "100%", height: "100%" }}
                      contentFit="cover"
                      testID={`${testID}-illustration`}
                    />
                  )}
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(0,0,0,0.45)",
                    }}
                  >
                    <Text
                      variant="bold"
                      size="xl"
                      color="rgba(255,255,255,0.7)"
                      testID={`${testID}-locked`}
                    >
                      ?
                    </Text>
                    {data.illustrationAttribution && (
                      <Text
                        variant="regular"
                        size="xs"
                        color="rgba(255,255,255,0.4)"
                        style={{ position: "absolute", bottom: 2, left: 4, fontSize: 7 }}
                      >
                        {`\u00A9 ${data.illustrationAttribution}`}
                      </Text>
                    )}
                  </View>
                </View>
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={[...borderColors] as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  borderRadius: BorderRadius.lg,
                  padding: 4,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    borderRadius: BorderRadius.lg - 2,
                    overflow: "hidden",
                  }}
                >
                  {data.shamePhoto ? (
                    <Image
                      source={require("../../../assets/pixel-pigeon.jpg")}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                      testID={`${testID}-shame-photo`}
                    />
                  ) : data.photoUri ? (
                    <ThumbImage uri={data.photoUri} testID={`${testID}-thumb-photo`} />
                  ) : (
                    <View
                      style={{ flex: 1, backgroundColor: Colors.sageTint }}
                    />
                  )}
                </View>
              </LinearGradient>
            )}
          </View>

          {/* Bottom detail area */}
          <View
            style={{
              flex: 1,
              paddingHorizontal: Spacing.sm,
              paddingVertical: Spacing.sm,
              justifyContent: "space-between",
            }}
          >
            {/* Skeleton placeholder lines */}
            <View testID={`${testID}-thumb-skeleton`}>
              <View
                style={{
                  height: 6,
                  width: "90%",
                  backgroundColor: "rgba(255,255,255,0.25)",
                  borderRadius: 3,
                  marginBottom: 5,
                }}
              />
              <View
                style={{
                  height: 6,
                  width: "70%",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 3,
                  marginBottom: 5,
                }}
              />
              <View
                style={{
                  height: 6,
                  width: "80%",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: 3,
                }}
              />
            </View>
            {!isLocked && data.sightingCount != null && data.sightingCount > 0 && (
              <Text
                variant="semiBold"
                size="xs"
                color={Colors.white}
                style={{
                  textShadowColor: "rgba(0,0,0,0.6)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
                testID={`${testID}-thumb-count`}
              >
                {data.sightingCount === 1
                  ? "★ 1 sighting"
                  : `★ ${data.sightingCount} sightings`}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
      {cardSize.w > 0 && (
        <ShinyCardOverlay
          width={cardSize.w}
          height={cardSize.h}
          borderRadius={BorderRadius.xl}
          gradientCenter={{ x: cardSize.w / 2, y: cardSize.h / 2 }}
          intensity={rc.shimmerIntensity}
          noColor
        />
      )}
    </View>
  );
};

// ── Image with loading skeleton ───────────────────────────────────────────

const ThumbImage: React.FC<{ uri: string; testID: string }> = ({
  uri,
  testID,
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={{ width: "100%", height: "100%" }}>
      {!loaded && <ImageSkeleton />}
      <Image
        source={{ uri }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        transition={200}
        onLoadEnd={() => setLoaded(true)}
        testID={testID}
      />
    </View>
  );
};

// ── Photo Carousel (expanded card with multiple sightings) ────────────────

const PhotoCarousel: React.FC<{
  photos: string[];
  photoQuality?: PhotoQuality | null;
  testID: string;
}> = ({ photos, photoQuality, testID }) => {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* Loading skeleton */}
      {!loaded && <ImageSkeleton />}
      {/* Current photo */}
      <Image
        source={{ uri: photos[index] }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        transition={200}
        onLoadEnd={() => setLoaded(true)}
        testID={`${testID}-carousel-${index}`}
      />

      {/* Bottom-right controls: dots + arrows */}
      <View
        style={{
          position: "absolute",
          bottom: 6,
          right: 6,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.45)",
          borderRadius: 14,
          paddingHorizontal: 8,
          paddingVertical: 4,
          gap: 6,
        }}
      >
        <GHPressable
          onPress={() => { setLoaded(false); setIndex((i) => Math.max(0, i - 1)); }}
          disabled={index === 0}
          hitSlop={10}
          style={{ paddingHorizontal: 4, justifyContent: "center" }}
        >
          <Text
            variant="bold"
            size="lg"
            color={index === 0 ? "rgba(255,255,255,0.3)" : Colors.white}
          >
            ‹
          </Text>
        </GHPressable>

        <Text variant="semiBold" size="sm" color={Colors.white} style={{ lineHeight: 20 }}>
          {`${index + 1}/${photos.length}`}
        </Text>

        <GHPressable
          onPress={() => { setLoaded(false); setIndex((i) => Math.min(photos.length - 1, i + 1)); }}
          disabled={index === photos.length - 1}
          hitSlop={10}
          style={{ paddingHorizontal: 4, justifyContent: "center" }}
        >
          <Text
            variant="bold"
            size="lg"
            color={index === photos.length - 1 ? "rgba(255,255,255,0.3)" : Colors.white}
          >
            ›
          </Text>
        </GHPressable>
      </View>

      {/* Photo quality badge — bottom left */}
      {photoQuality && PHOTO_QUALITY_CONFIG[photoQuality] && (
        <PhotoQualityBadge quality={photoQuality} />
      )}
    </View>
  );
};

// ── Glossy sheen overlay ───────────────────────────────────────────────────

// ── Photo quality badge ───────────────────────────────────────────────────

const PhotoQualityBadge: React.FC<{ quality: PhotoQuality }> = ({ quality }) => {
  const config = PHOTO_QUALITY_CONFIG[quality];
  if (!config) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 6,
        left: 6,
      }}
    >
      <LinearGradient
        colors={[...config.colors] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 16,
          gap: 5,
        }}
      >
        <Camera size={14} color={Colors.white} strokeWidth={2.5} />
        <Text
          variant="bold"
          size="sm"
          color={Colors.white}
        >
          {config.label}
        </Text>
      </LinearGradient>
    </View>
  );
};

const GlossySheen: React.FC = () => (
  <View
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
      pointerEvents: "none",
    }}
  >
    <LinearGradient
      colors={[
        "rgba(255,255,255,0.18)",
        "rgba(255,255,255,0.04)",
        "rgba(255,255,255,0)",
        "rgba(255,255,255,0.06)",
      ]}
      locations={[0, 0.35, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    />
    {/* Specular band */}
    <LinearGradient
      colors={[
        "rgba(255,255,255,0)",
        "rgba(255,255,255,0.12)",
        "rgba(255,255,255,0)",
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.5 }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "40%",
      }}
    />
  </View>
);

// ── Image loading skeleton ────────────────────────────────────────────────

const ImageSkeleton: React.FC<{ color?: string }> = ({
  color = "rgba(255,255,255,0.15)",
}) => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
};

export default BirdCard;
