import React, { useMemo } from "react";
import { View, StyleSheet, Pressable, Platform, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { X, RefreshCw } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Shadows } from "../../theme";
import { Text, Pill } from "../../components/atoms";
import { BirdCardThumb } from "../../components/molecules/BirdCard";
import { usePostHog } from "../../contexts/PostHogProvider";
import { useAllSpecies } from "../../hooks/useApi";
import type { CaptureFlowParamList } from "../../navigation/stacks/CaptureFlowStack";
import type { IdentifyCandidate } from "../../types/api";

type Nav = NativeStackNavigationProp<CaptureFlowParamList>;
type Route = RouteProp<CaptureFlowParamList, "CandidatePicker">;

export const CandidatePickerScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const posthog = usePostHog();
  const { photoUri, candidates, location, setting, photo_quality } = route.params;
  const { data: allSpecies } = useAllSpecies();

  const speciesMap = useMemo(() => {
    const map = new Map<string, any>();
    for (const sp of allSpecies ?? []) {
      map.set(sp.id, sp);
    }
    return map;
  }, [allSpecies]);

  const handleSelect = (candidate: IdentifyCandidate) => {
    if (!candidate.species_id) return;
    const index = candidates.indexOf(candidate);
    posthog.capture("candidate_selected", { species_id: candidate.species_id, common_name: candidate.common_name, candidate_index: index, confidence: candidate.confidence });
    navigation.replace("CardReveal", {
      photoUri,
      speciesId: candidate.species_id,
      commonName: candidate.common_name,
      conservationStatus: candidate.conservation_status ?? "LC",
      location,
      setting,
      photo_quality,
    });
  };

  const handleNoneMatch = () => {
    posthog.capture("candidate_rejected");
    navigation.replace("TryAgain", { photoUri });
  };

  const handleClose = () => {
    navigation.getParent()?.goBack();
  };

  return (
    <View style={styles.container} testID="candidate-picker-screen">
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={handleClose} testID="candidate-picker-close" hitSlop={12}>
          <X size={24} color={Colors.ink} />
        </Pressable>
        <Text variant="semiBold" size="base" color={Colors.ink} testID="candidate-picker-title">
          Identify
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* User's photo */}
      <View style={styles.photoWrapper}>
        <Image
          source={{ uri: photoUri }}
          style={styles.photo}
          contentFit="cover"
          testID="candidate-picker-photo"
        />
        <View style={styles.photoPill}>
          <Text variant="medium" size="xs" color={Colors.white} testID="candidate-picker-photo-label">
            Your photo
          </Text>
        </View>
      </View>

      {/* Heading */}
      <View style={styles.headingSection}>
        <Text variant="semiBold" size="lg" color={Colors.ink} testID="candidate-picker-heading">
          Pick the bird you spotted
        </Text>
        <Text
          variant="regular"
          size="sm"
          color={Colors.inkSoft}
          testID="candidate-picker-subheading"
          style={{ marginTop: Spacing.xs }}
        >
          A few species look alike — tap the closest match
        </Text>
      </View>

      {/* Candidate card thumbnails */}
      <ScrollView
        contentContainerStyle={styles.cardGrid}
        showsVerticalScrollIndicator={false}
      >
        {candidates.slice(0, 3).map((candidate, index) => {
          const sp = candidate.species_id ? speciesMap.get(candidate.species_id) : null;
          const isTop = index === 0;
          return (
            <View key={candidate.species_id ?? index} style={styles.cardCell}>
              {isTop && (
                <View style={styles.mostLikelyBadge}>
                  <Pill
                    label="Most likely"
                    color={Colors.white}
                    backgroundColor={Colors.saffron}
                    size="sm"
                    testID="candidate-most-likely"
                  />
                </View>
              )}
              <Pressable
                onPress={() => handleSelect(candidate)}
                testID={`candidate-row-${index}`}
              >
                <BirdCardThumb
                  data={{
                    speciesName: candidate.common_name,
                    familyName: sp?.family ?? "",
                    speciesType: sp?.species_type_name ?? "",
                    habitat: sp?.habitat_name ?? "",
                    conservationTier: (candidate.conservation_status ?? "LC") as any,
                    photoUri: null,
                    sightingCount: 0,
                    locked: false,
                    rarity: sp?.rarity as any,
                    illustrationUrl: sp?.illustration_url ?? null,
                  }}
                  testID={`candidate-thumb-${index}`}
                />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {/* None of these match */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.noneRow}
          onPress={handleNoneMatch}
          testID="candidate-none-match"
        >
          <RefreshCw size={18} color={Colors.inkSoft} />
          <Text variant="regular" size="base" color={Colors.inkSoft} testID="candidate-none-label">
            None of these match
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: Spacing.md,
  },
  photoWrapper: {
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    aspectRatio: 16 / 9,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPill: {
    position: "absolute",
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  headingSection: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  cardGrid: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  cardCell: {
    flex: 1,
  },
  mostLikelyBadge: {
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  noneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
});

export default CandidatePickerScreen;
