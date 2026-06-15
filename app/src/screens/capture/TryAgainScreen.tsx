import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { Camera, Sun, Maximize } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Shadows } from "../../theme";
import { Text, PrimaryButton, GhostButton } from "../../components/atoms";
import type { CaptureFlowParamList } from "../../navigation/stacks/CaptureFlowStack";

type Route = RouteProp<CaptureFlowParamList, "TryAgain">;

const SCREEN_WIDTH = Dimensions.get("window").width;

export const TryAgainScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { photoUri, failedAttemptsExceeded = false } = route.params;

  const tips = [
    { icon: Sun, text: "Make sure the bird is well-lit" },
    { icon: Maximize, text: "Get as close as possible" },
    { icon: Camera, text: "Keep the bird centered in frame" },
  ];

  return (
    <SafeAreaView style={styles.container} testID="try-again-screen">
      {/* Top group: photo + text + tips */}
      <View style={styles.topGroup}>
        {/* Photo */}
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
          style={{ marginTop: Spacing.xl }}
        >
          {failedAttemptsExceeded ? "Too many failed attempts" : "Couldn't identify this one"}
        </Text>
        <Text
          variant="regular"
          size="sm"
          color={Colors.inkSoft}
          align="center"
          testID="try-again-subtitle"
          style={{ marginTop: Spacing.sm }}
        >
          {failedAttemptsExceeded
            ? "You've had too many unrecognised photos today. Come back tomorrow."
            : "Try again with a clearer photo"}
        </Text>

        {/* Tips — hide when blocked, they can't retry anyway */}
        {!failedAttemptsExceeded && (
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
        )}
      </View>

      {/* Bottom group: buttons */}
      <View style={styles.actions}>
        {!failedAttemptsExceeded && (
          <PrimaryButton
            title="Try again"
            size="lg"
            fullWidth
            onPress={() => navigation.goBack()}
            testID="try-again-retry"
          />
        )}
        <GhostButton
          title="Close"
          size="lg"
          fullWidth
          onPress={() => navigation.getParent()?.goBack()}
          testID="try-again-close"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    paddingHorizontal: Spacing.xl,
    justifyContent: "space-between",
  },
  topGroup: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  photoWrapper: {
    width: SCREEN_WIDTH * 0.65,
    aspectRatio: 4 / 3,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Shadows.md,
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
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
});

export default TryAgainScreen;
