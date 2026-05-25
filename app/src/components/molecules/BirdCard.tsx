import React from "react";
import { View, ViewStyle, ImageSourcePropType } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Colors,
  ConservationTierColors,
  Spacing,
  BorderRadius,
  Shadows,
  Fonts,
  FontSizes,
} from "../../theme";
import type { ConservationTier } from "../../theme";
import { Text } from "../atoms/Text";
import { ConservationBadge } from "../atoms/ConservationBadge";
import { AudioBadge } from "../atoms/AudioBadge";
import { SightingBadge } from "../atoms/SightingBadge";
import { HabitatPill } from "../atoms/HabitatPill";

// ── Habitat background images ─────────────────────────────────────────────

const HABITAT_BACKGROUNDS: Record<string, ImageSourcePropType> = {
  "Forests": require("../../../assets/habitats/forest.jpeg"),
  "Grasslands & farmland": require("../../../assets/habitats/grasslands.jpeg"),
  "Grasslands & Farmland": require("../../../assets/habitats/grasslands.jpeg"),
  "Deserts & scrublands": require("../../../assets/habitats/dessert.jpeg"),
  "Deserts & Scrublands": require("../../../assets/habitats/dessert.jpeg"),
  "Wetlands": require("../../../assets/habitats/wetlands.jpeg"),
  "Freshwater": require("../../../assets/habitats/wetlands.jpeg"),
  "Coasts & ocean": require("../../../assets/habitats/beach.jpeg"),
  "Coasts & Ocean": require("../../../assets/habitats/beach.jpeg"),
  "Mountains": require("../../../assets/habitats/mountains.jpeg"),
  "Tundra": require("../../../assets/habitats/tundra.jpeg"),
  "Cities & towns": require("../../../assets/habitats/city.jpeg"),
  "Cities & Towns": require("../../../assets/habitats/city.jpeg"),
};

function getHabitatBackground(habitat: string): ImageSourcePropType | null {
  return HABITAT_BACKGROUNDS[habitat] ?? null;
}

const HABITAT_COLORS: Record<string, string> = {
  "Forests": "rgba(34, 100, 34, 1)",
  "Grasslands & farmland": "rgba(124, 152, 66, 1)",
  "Grasslands & Farmland": "rgba(124, 152, 66, 1)",
  "Deserts & scrublands": "rgba(194, 154, 88, 1)",
  "Deserts & Scrublands": "rgba(194, 154, 88, 1)",
  "Wetlands": "rgba(60, 120, 100, 1)",
  "Freshwater": "rgba(50, 120, 150, 1)",
  "Coasts & ocean": "rgba(60, 140, 170, 1)",
  "Coasts & Ocean": "rgba(60, 140, 170, 1)",
  "Mountains": "rgba(100, 110, 130, 1)",
  "Tundra": "rgba(160, 180, 190, 1)",
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

  const outerFrame: ViewStyle = {
    borderRadius: BorderRadius["2xl"],
    backgroundColor: tierColor,
    padding: 4,
    ...Shadows.md,
  };

  const innerBody: ViewStyle = {
    borderRadius: BorderRadius["2xl"] - 2,
    backgroundColor: Colors.cardBody,
    overflow: "hidden",
  };

  return (
    <View style={outerFrame} testID={testID}>
      {/* Glossy sheen overlay */}
      <View style={innerBody}>
        <GlossySheen />

        {/* Header: family + name left, habitat pill right */}
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
              variant="regular"
              size="xs"
              color={Colors.inkFaint}
              testID={`${testID}-family`}
            >
              {data.familyName}
            </Text>
            <Text
              variant="bold"
              size="lg"
              color={Colors.ink}
              testID={`${testID}-name`}
            >
              {data.speciesName}
            </Text>
          </View>
          <HabitatPill
            habitat={data.habitat}
            onPress={onHabitatPress}
            testID={`${testID}-habitat-pill`}
          />
        </View>

        {/* Hero photo with tier-color border */}
        <View
          style={{
            marginHorizontal: Spacing.lg,
            borderRadius: BorderRadius.lg,
            borderWidth: 2,
            borderColor: tierColor,
            overflow: "hidden",
            aspectRatio: 4 / 3,
            backgroundColor: Colors.paper,
          }}
        >
          {isLocked ? (
            <View style={{ flex: 1 }}>
              {getHabitatBackground(data.habitat) && (
                <Image
                  source={getHabitatBackground(data.habitat)!}
                  style={{ position: "absolute", width: "120%", height: "120%", top: "-10%", left: "-10%" }}
                  contentFit="cover"
                  testID={`${testID}-habitat-bg`}
                />
              )}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.4)"]}
                style={{ position: "absolute", width: "100%", height: "100%" }}
              />
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
            </View>
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
                variant="regular"
                size="sm"
                color={Colors.ink}
                testID={`${testID}-size-text`}
              >
                <Text
                  variant="bold"
                  size="base"
                  color={Colors.ink}
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
                variant="regular"
                size="base"
                color={Colors.ink}
                testID={`${testID}-about-text`}
              >
                <Text
                  variant="bold"
                  size="base"
                  color={Colors.ink}
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
                variant="regular"
                size="base"
                color={Colors.ink}
                testID={`${testID}-firstsight-text`}
              >
                <Text
                  variant="bold"
                  size="base"
                  color={Colors.ink}
                  testID={`${testID}-firstsight-label`}
                >
                  {"First Sight: "}
                </Text>
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

  return (
    <View
      style={{
        borderRadius: BorderRadius.xl,
        aspectRatio: 3 / 5,
        ...Shadows.sm,
      }}
      testID={testID}
    >
      {/* Gradient border */}
      <LinearGradient
        colors={["#f8e15c", "#edb915"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          borderRadius: BorderRadius.xl,
          padding: 8,
        }}
      >
      {/* Inner card body */}
      <View
        style={{
          flex: 1,
          borderRadius: BorderRadius.xl - 3,
          overflow: "hidden",
          backgroundColor: isLocked ? "transparent" : Colors.cardBody,
        }}
      >
        {/* Habitat background — covers entire card when locked */}
        {isLocked && getHabitatBackground(data.habitat) && (
          <Image
            source={getHabitatBackground(data.habitat)!}
            style={{ position: "absolute", width: "120%", height: "120%", top: "-10%", left: "-10%" }}
            contentFit="cover"
            testID={`${testID}-habitat-bg`}
          />
        )}

        {/* Type + Name at top */}
        <View
          style={{
            paddingHorizontal: Spacing.sm,
            paddingTop: Spacing.sm,
            paddingBottom: Spacing.xs,
            justifyContent: "center",
          }}
        >
          {data.speciesType && (
            <Text
              variant="regular"
              size="xs"
              color={isLocked ? "rgba(255,255,255,0.75)" : Colors.inkFaint}
              style={isLocked ? { textShadowColor: "rgba(0,0,0,1)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 } : undefined}
              testID={`${testID}-thumb-type`}
            >
              {data.speciesType}
            </Text>
          )}
          <Text
            variant="semiBold"
            size="xs"
            color={isLocked ? Colors.white : Colors.ink}
            style={isLocked ? { textShadowColor: "rgba(0,0,0,1)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 } : undefined}
            testID={`${testID}-thumb-name`}
          >
            {data.speciesName}
          </Text>
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
              colors={["#f8e15c", "#edb915"]}
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
              colors={["#f8e15c", "#edb915"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flex: 1,
                borderRadius: BorderRadius.lg,
                padding: 4,
              }}
            >
              <View style={{ flex: 1, borderRadius: BorderRadius.lg - 2, overflow: "hidden" }}>
                {data.photoUri ? (
                  <Image
                    source={{ uri: data.photoUri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={200}
                    testID={`${testID}-thumb-photo`}
                  />
                ) : (
                  <View style={{ flex: 1, backgroundColor: Colors.sageTint }} />
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
          {!isLocked &&
            data.sightingCount != null &&
            data.sightingCount > 1 && (
              <Text
                variant="regular"
                size="xs"
                color={Colors.saffron}
                testID={`${testID}-thumb-count`}
              >
                {`★${data.sightingCount}`}
              </Text>
            )}
        </View>
      </View>
      </LinearGradient>
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
