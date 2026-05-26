import React, { useState, useCallback } from "react";
import {
  View,
  ViewStyle,
  ImageSourcePropType,
  LayoutChangeEvent,
  Dimensions,
  Pressable,
} from "react-native";

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
import type { Rarity } from "../../types/api";
import { Text } from "../atoms/Text";
import { ConservationBadge } from "../atoms/ConservationBadge";
import { AudioBadge } from "../atoms/AudioBadge";
import { SightingBadge } from "../atoms/SightingBadge";
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
  /** All photo URIs for carousel (expanded card only) */
  allPhotos?: string[];
}

export interface BirdCardProps {
  data: BirdCardData;
  onAudioPress?: () => void;
  onHabitatPress?: () => void;
  testID: string;
}

// ── Full BirdCard (card detail) ────────────────────────────────────────────

export const BirdCard: React.FC<BirdCardProps> = ({
  data,
  onAudioPress,
  onHabitatPress,
  testID,
}) => {
  const tierColor = ConservationTierColors[data.conservationTier];
  const isLocked = data.locked;
  const rc = RarityConfig[data.rarity ?? "common"];

  return (
    <View
      style={{ flex: 1, borderRadius: BorderRadius["2xl"], ...Shadows.md }}
      testID={testID}
    >
      <LinearGradient
        colors={[...rc.borderColors] as [string, string, ...string[]]}
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
              <Text
                variant="bold"
                size="lg"
                color={Colors.white}
                style={{
                  textShadowColor: "rgba(0,0,0,0.6)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
                testID={`${testID}-name`}
              >
                {data.speciesName}
              </Text>
            </View>
            {data.rarity && data.rarity !== "common" && (
              <View
                style={{
                  backgroundColor: rc.badgeColor,
                  paddingHorizontal: Spacing.sm,
                  paddingVertical: 2,
                  borderRadius: BorderRadius.sm,
                  marginTop: 2,
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
              </View>
            )}
          </View>

          {/* Hero photo with rarity gradient border */}
          <View style={{ marginHorizontal: Spacing.lg }}>
            <LinearGradient
              colors={[...rc.borderColors] as [string, string, ...string[]]}
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
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
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
                  </View>
                ) : data.allPhotos && data.allPhotos.length > 1 ? (
                  <PhotoCarousel photos={data.allPhotos} testID={testID} />
                ) : data.photoUri ? (
                  <Image
                    source={{ uri: data.photoUri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={200}
                    testID={`${testID}-photo`}
                  />
                ) : (
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: Colors.paper,
                    }}
                  >
                    <Text
                      variant="regular"
                      size="sm"
                      color={Colors.inkFaint}
                      testID={`${testID}-no-photo`}
                    >
                      No photo
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>

          {/* Body text: Size, About, First Sight — inline label: value */}
          <View
            style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}
          >
            {data.size && (
              <View
                style={{ marginBottom: Spacing.sm }}
                testID={`${testID}-size`}
              >
                <Text
                  variant="bold"
                  size="md"
                  color={Colors.white}
                  style={{
                    textShadowColor: "rgba(0,0,0,0.5)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                  testID={`${testID}-size-text`}
                >
                  <Text
                    variant="extraBold"
                    size="md"
                    color={Colors.white}
                    testID={`${testID}-size-label`}
                  >
                    {"Size: "}
                  </Text>
                  {data.size}
                </Text>
              </View>
            )}
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
            {data.firstSight && (
              <View
                style={{ marginBottom: Spacing.sm }}
                testID={`${testID}-firstsight`}
              >
                <Text
                  variant="bold"
                  size="base"
                  color={Colors.white}
                  style={{
                    textShadowColor: "rgba(0,0,0,0.5)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                  testID={`${testID}-firstsight-text`}
                >
                  {"First Sight: "}
                  {data.firstSight}
                </Text>
              </View>
            )}
          </View>

          {/* Footer: badges evenly spaced */}
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
            {!isLocked && (
              <>
                <AudioBadge
                  size={44}
                  onPress={onAudioPress}
                  testID={`${testID}-audio-badge`}
                />
                {data.sightingCount != null && data.sightingCount > 0 && (
                  <SightingBadge
                    count={data.sightingCount}
                    size={44}
                    testID={`${testID}-sighting-badge`}
                  />
                )}
              </>
            )}
          </View>
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
        colors={[...rc.borderColors] as [string, string, ...string[]]}
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
              {data.speciesType && (
                <Text
                  variant="regular"
                  size="xs"
                  color="rgba(255,255,255,0.85)"
                  style={{
                    textShadowColor: "rgba(0,0,0,0.6)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                  testID={`${testID}-thumb-type`}
                >
                  {data.speciesType}
                </Text>
              )}
              <Text
                variant="semiBold"
                size="xs"
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
            {data.rarity && data.rarity !== "common" && (
              <View
                style={{
                  backgroundColor: rc.badgeColor,
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
              </View>
            )}
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
                colors={[...rc.borderColors] as [string, string, ...string[]]}
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
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: BorderRadius.lg - 2,
                    backgroundColor: getHabitatColor(data.habitat),
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
                </View>
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={[...rc.borderColors] as [string, string, ...string[]]}
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
                  {data.photoUri ? (
                    <Image
                      source={{ uri: data.photoUri }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                      transition={200}
                      testID={`${testID}-thumb-photo`}
                    />
                  ) : (
                    <View
                      style={{ flex: 1, backgroundColor: Colors.sageTint }}
                    />
                  )}
                </View>
              </LinearGradient>
            )}
          </View>

          {/* Bottom detail area — bottom half */}
          <View
            style={{
              flex: 1,
              paddingHorizontal: Spacing.sm,
              paddingVertical: Spacing.sm,
            }}
          >
            {!isLocked && data.sightingCount != null && data.sightingCount > 1 ? (
              <Text
                variant="regular"
                size="xs"
                color={Colors.saffron}
                testID={`${testID}-thumb-count`}
              >
                {`★ ${data.sightingCount} sightings`}
              </Text>
            ) : (
              <View style={{ gap: 5 }} testID={`${testID}-thumb-skeleton`}>
                {/* Size skeleton */}
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isLocked
                        ? "rgba(255,255,255,0.4)"
                        : Colors.sageTint,
                    }}
                  />
                  <View
                    style={{
                      width: 44,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isLocked
                        ? "rgba(255,255,255,0.3)"
                        : Colors.sageTint,
                    }}
                  />
                </View>
                {/* About skeleton */}
                <View style={{ gap: 4 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: isLocked
                          ? "rgba(255,255,255,0.4)"
                          : Colors.sageTint,
                      }}
                    />
                    <View
                      style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: isLocked
                          ? "rgba(255,255,255,0.3)"
                          : Colors.sageTint,
                      }}
                    />
                  </View>
                  <View
                    style={{
                      width: "90%",
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isLocked
                        ? "rgba(255,255,255,0.25)"
                        : Colors.paper,
                    }}
                  />
                  <View
                    style={{
                      width: "75%",
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isLocked
                        ? "rgba(255,255,255,0.25)"
                        : Colors.paper,
                    }}
                  />
                  <View
                    style={{
                      width: "85%",
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isLocked
                        ? "rgba(255,255,255,0.2)"
                        : Colors.paper,
                    }}
                  />
                  <View
                    style={{
                      width: "60%",
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isLocked
                        ? "rgba(255,255,255,0.2)"
                        : Colors.paper,
                    }}
                  />
                </View>
              </View>
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
        />
      )}
    </View>
  );
};

// ── Glossy sheen overlay ───────────────────────────────────────────────────

// ── Photo Carousel (expanded card with multiple sightings) ────────────────

const PhotoCarousel: React.FC<{ photos: string[]; testID: string }> = ({
  photos,
  testID,
}) => {
  const [index, setIndex] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      {/* Current photo */}
      <Image
        source={{ uri: photos[index] }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        transition={200}
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
        <Pressable
          onPress={() => setIndex((i) => Math.max(0, i - 1))}
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
        </Pressable>

        <Text variant="semiBold" size="sm" color={Colors.white} style={{ lineHeight: 20 }}>
          {`${index + 1}/${photos.length}`}
        </Text>

        <Pressable
          onPress={() => setIndex((i) => Math.min(photos.length - 1, i + 1))}
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
        </Pressable>
      </View>
    </View>
  );
};

// ── Glossy sheen overlay ───────────────────────────────────────────────────

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

export default BirdCard;
