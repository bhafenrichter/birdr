import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { Camera, Sun, Maximize } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Shadows } from "../../theme";
import { Text, PrimaryButton, GhostButton } from "../../components/atoms";
import type { CaptureFlowParamList } from "../../navigation/stacks/CaptureFlowStack";

type Route = RouteProp<CaptureFlowParamList, "TryAgain">;

export const TryAgainScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { photoUri } = route.params;

  const tips = [
    { icon: Sun, text: "Make sure the bird is well-lit" },
    { icon: Maximize, text: "Get as close as possible" },
    { icon: Camera, text: "Keep the bird centered in frame" },
  ];

  return (
    <View style={styles.container} testID="try-again-screen">
      {/* Photo thumbnail */}
      <View style={styles.photoWrapper}>
        <Image
          source={{ uri: photoUri }}
          style={styles.photo}
          contentFit="cover"
          testID="try-again-photo"
        />
      </View>

      <Text
        variant="semiBold"
        size="xl"
        color={Colors.ink}
        align="center"
        testID="try-again-title"
      >
        Couldn't identify this one
      </Text>
      <Text
        variant="regular"
        size="sm"
        color={Colors.inkSoft}
        align="center"
        testID="try-again-subtitle"
        style={{ marginTop: Spacing.sm }}
      >
        Try again with a clearer photo
      </Text>

      {/* Tips */}
      <View style={styles.tipsCard} testID="try-again-tips">
        {tips.map((tip, i) => (
          <View key={i} style={styles.tipRow} testID={`try-again-tip-${i}`}>
            <tip.icon size={20} color={Colors.sage} strokeWidth={1.5} />
            <Text variant="regular" size="sm" color={Colors.ink} testID={`try-again-tip-${i}-text`}>
              {tip.text}
            </Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <PrimaryButton
          title="Try again"
          size="lg"
          fullWidth
          onPress={() => navigation.goBack()}
          testID="try-again-retry"
        />
        <GhostButton
          title="Close"
          size="lg"
          fullWidth
          onPress={() => navigation.getParent()?.goBack()}
          testID="try-again-close"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === "ios" ? 80 : 60,
    alignItems: "center",
  },
  photoWrapper: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  tipsCard: {
    alignSelf: "stretch",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    gap: Spacing.lg,
    ...Shadows.sm,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  actions: {
    alignSelf: "stretch",
    gap: Spacing.sm,
    marginTop: Spacing["3xl"],
  },
});

export default TryAgainScreen;
