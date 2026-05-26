import React from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { X, ChevronRight, RefreshCw } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Shadows, Fonts, FontSizes } from "../../theme";
import { Text, Pill } from "../../components/atoms";
import type { CaptureFlowParamList } from "../../navigation/stacks/CaptureFlowStack";
import type { IdentifyCandidate } from "../../types/api";

type Nav = NativeStackNavigationProp<CaptureFlowParamList>;
type Route = RouteProp<CaptureFlowParamList, "CandidatePicker">;

export const CandidatePickerScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { photoUri, candidates, location, setting, photo_quality } = route.params;

  const handleSelect = (candidate: IdentifyCandidate) => {
    if (!candidate.species_id) return;
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

      {/* Candidate rows */}
      <View style={styles.candidates}>
        {candidates.slice(0, 3).map((candidate, index) => {
          const isTop = index === 0;
          return (
            <Pressable
              key={candidate.species_id ?? index}
              style={[
                styles.candidateRow,
                isTop && styles.candidateRowTop,
              ]}
              onPress={() => handleSelect(candidate)}
              testID={`candidate-row-${index}`}
            >
              {/* Reference image placeholder */}
              <View style={styles.candidateAvatar}>
                <Text variant="bold" size="lg" color={Colors.white} testID={`candidate-avatar-${index}`}>
                  {candidate.common_name.charAt(0)}
                </Text>
              </View>

              <View style={styles.candidateInfo}>
                {isTop && (
                  <Pill
                    label="Most likely"
                    color={Colors.white}
                    backgroundColor={Colors.saffron}
                    size="sm"
                    testID="candidate-most-likely"
                  />
                )}
                <Text
                  variant="medium"
                  size="base"
                  color={Colors.ink}
                  testID={`candidate-name-${index}`}
                >
                  {candidate.common_name}
                </Text>
                {candidate.distinguishing_feature && (
                  <Text
                    variant="regular"
                    size="xs"
                    color={Colors.inkSoft}
                    testID={`candidate-feature-${index}`}
                  >
                    {candidate.distinguishing_feature}
                  </Text>
                )}
              </View>

              <ChevronRight size={18} color={Colors.inkFaint} />
            </Pressable>
          );
        })}
      </View>

      {/* None of these match */}
      <View style={styles.divider} />
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
    height: "30%",
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
  candidates: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  candidateRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  candidateRowTop: {
    borderWidth: 1.5,
    borderColor: Colors.saffron,
  },
  candidateAvatar: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  candidateInfo: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.paper,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  noneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
});

export default CandidatePickerScreen;
