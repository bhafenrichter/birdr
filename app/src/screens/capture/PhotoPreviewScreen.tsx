import React from "react";
import { View, StyleSheet, Platform, Pressable } from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Colors, Spacing, BorderRadius, Shadows } from "../../theme";
import { Text, PrimaryButton } from "../../components/atoms";
import type { CaptureFlowParamList } from "../../navigation/stacks/CaptureFlowStack";

type Nav = NativeStackNavigationProp<CaptureFlowParamList>;
type Route = RouteProp<CaptureFlowParamList, "PhotoPreview">;

export const PhotoPreviewScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { photoUri } = route.params;

  const handleRetake = () => {
    navigation.goBack();
  };

  const handleIdentify = () => {
    navigation.navigate("Identifying", { photoUri });
  };

  return (
    <View style={styles.container} testID="photo-preview-screen">
      {/* Full-bleed photo */}
      <Image
        source={{ uri: photoUri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        testID="photo-preview-image"
      />

      {/* Bottom action bar */}
      <View style={styles.actionBar}>
        <Pressable
          style={({ pressed }) => [styles.retakeBtn, pressed && { opacity: 0.7 }]}
          onPress={handleRetake}
          testID="photo-preview-retake"
          accessible
          accessibilityRole="button"
          accessibilityLabel="Retake"
        >
          <Text variant="medium" size="md" color={Colors.white} testID="photo-preview-retake-label">
            Retake
          </Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            title="Identify"
            size="lg"
            onPress={handleIdentify}
            fullWidth
            testID="photo-preview-identify"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  actionBar: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 50 : 30,
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  retakeBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});

export default PhotoPreviewScreen;
