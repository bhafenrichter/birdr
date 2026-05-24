import React from "react";
import { View, ViewStyle } from "react-native";
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

// ── Types ──────────────────────────────────────────────────────────────────

export interface BirdCardData {
  speciesName: string;
  familyName: string;
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
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.lg,
          paddingBottom: Spacing.sm,
        }}>
          <View style={{ flex: 1, marginRight: Spacing.sm }}>
            <Text
              variant="regular"
              size="xs"
              color={Colors.inkFaint}
              testID={`${testID}-family`}
            >
              {isLocked ? "???" : data.familyName}
            </Text>
            <Text
              variant="bold"
              size="lg"
              color={isLocked ? Colors.inkFaint : Colors.ink}
              testID={`${testID}-name`}
            >
              {isLocked ? "???" : data.speciesName}
            </Text>
          </View>
          <HabitatPill
            habitat={data.habitat}
            onPress={onHabitatPress}
            testID={`${testID}-habitat-pill`}
          />
        </View>

        {/* Hero photo with tier-color border */}
        <View style={{
          marginHorizontal: Spacing.lg,
          borderRadius: BorderRadius.lg,
          borderWidth: 2,
          borderColor: tierColor,
          overflow: "hidden",
          aspectRatio: 4 / 3,
          backgroundColor: isLocked ? Colors.sageTint : Colors.paper,
        }}>
          {isLocked ? (
            <View style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Text
                variant="bold"
                size="3xl"
                color={Colors.inkFaint}
                testID={`${testID}-locked-placeholder`}
              >
                ?
              </Text>
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
            <View style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: Colors.paper,
            }}>
              <Text variant="regular" size="sm" color={Colors.inkFaint} testID={`${testID}-no-photo`}>
                No photo
              </Text>
            </View>
          )}
        </View>

        {/* Body text: Size, About, First Sight — inline label: value */}
        {!isLocked && (
          <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}>
            {data.size && (
              <View style={{ marginBottom: Spacing.sm }} testID={`${testID}-size`}>
                <Text variant="regular" size="sm" color={Colors.ink} testID={`${testID}-size-text`}>
                  <Text variant="bold" size="base" color={Colors.ink} testID={`${testID}-size-label`}>
                    {"Size: "}
                  </Text>
                  {data.size}
                </Text>
              </View>
            )}
            {data.about && (
              <View style={{ marginBottom: Spacing.sm }} testID={`${testID}-about`}>
                <Text variant="regular" size="base" color={Colors.ink} testID={`${testID}-about-text`}>
                  <Text variant="bold" size="base" color={Colors.ink} testID={`${testID}-about-label`}>
                    {"About: "}
                  </Text>
                  {data.about}
                </Text>
              </View>
            )}
            {data.firstSight && (
              <View style={{ marginBottom: Spacing.sm }} testID={`${testID}-firstsight`}>
                <Text variant="regular" size="base" color={Colors.ink} testID={`${testID}-firstsight-text`}>
                  <Text variant="bold" size="base" color={Colors.ink} testID={`${testID}-firstsight-label`}>
                    {"First Sight: "}
                  </Text>
                  {data.firstSight}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer: badges evenly spaced */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-evenly",
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.lg,
        }}>
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
        overflow: "hidden",
        ...Shadows.sm,
      }}
      testID={testID}
    >
      {/* Photo in tier-color frame */}
      <View style={{
        backgroundColor: tierColor,
        padding: 3,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
      }}>
        <View style={{
          borderTopLeftRadius: BorderRadius.xl - 2,
          borderTopRightRadius: BorderRadius.xl - 2,
          overflow: "hidden",
          aspectRatio: 1,
          backgroundColor: isLocked ? Colors.sageTint : Colors.paper,
        }}>
          {isLocked ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text variant="bold" size="xl" color={Colors.inkFaint} testID={`${testID}-locked`}>
                ?
              </Text>
            </View>
          ) : data.photoUri ? (
            <Image
              source={{ uri: data.photoUri }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={200}
              testID={`${testID}-thumb-photo`}
            />
          ) : (
            <View style={{ flex: 1, backgroundColor: Colors.paper }} />
          )}
        </View>
      </View>

      {/* Details panel below */}
      <View style={{
        backgroundColor: Colors.cardBody,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.sm,
        borderBottomLeftRadius: BorderRadius.xl,
        borderBottomRightRadius: BorderRadius.xl,
      }}>
        <Text
          variant="medium"
          size="xs"
          color={isLocked ? Colors.inkFaint : Colors.ink}
          numberOfLines={1}
          testID={`${testID}-thumb-name`}
        >
          {isLocked ? "???" : data.speciesName}
        </Text>
        {!isLocked && data.sightingCount != null && data.sightingCount > 1 && (
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
