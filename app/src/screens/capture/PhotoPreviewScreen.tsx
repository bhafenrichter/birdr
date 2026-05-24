import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Colors, Spacing, BorderRadius } from "../../theme";
import { PrimaryButton, GhostButton } from "../../components/atoms";
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
        <GhostButton
          title="Retake"
          size="lg"
          onPress={handleRetake}
          testID="photo-preview-retake"
          style={{ flex: 1 }}
        />
        <PrimaryButton
          title="Identify"
          size="lg"
          onPress={handleIdentify}
          testID="photo-preview-identify"
          style={{ flex: 1 }}
        />
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
    gap: Spacing.md,
  },
});

export default PhotoPreviewScreen;
