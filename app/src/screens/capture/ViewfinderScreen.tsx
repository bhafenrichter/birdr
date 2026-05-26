import React, { useRef, useState, useCallback } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { X, Zap, ZapOff, ImagePlus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors, Spacing, BorderRadius, Shadows, Fonts, FontSizes } from "../../theme";
import { Text, CircleBtn, Pill } from "../../components/atoms";
import { useAuth } from "../../contexts/AuthProvider";
import type { CaptureFlowParamList } from "../../navigation/stacks/CaptureFlowStack";

type Nav = NativeStackNavigationProp<CaptureFlowParamList>;

const ZOOM_LEVELS = [1, 2, 3] as const;

export const ViewfinderScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { profile } = useAuth();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);
  const [zoom, setZoom] = useState<(typeof ZOOM_LEVELS)[number]>(1);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);

  const dailyUsed = profile?.daily_captures_used ?? 0;
  const isFree = (profile?.subscription_tier ?? "free") === "free";
  const capturesRemaining = isFree ? Math.max(0, 3 - dailyUsed) : null;

  const handleTakePhoto = useCallback(async () => {
    if (isTakingPhoto || !cameraRef.current) return;
    setIsTakingPhoto(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      if (photo) {
        navigation.navigate("PhotoPreview", { photoUri: photo.uri });
      }
    } finally {
      setIsTakingPhoto(false);
    }
  }, [isTakingPhoto, navigation]);

  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      navigation.navigate("PhotoPreview", { photoUri: result.assets[0].uri });
    }
  }, [navigation]);

  const handleClose = useCallback(() => {
    navigation.getParent()?.goBack();
  }, [navigation]);

  // Permission not yet granted
  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer} testID="viewfinder-permission">
        <Text
          variant="semiBold"
          size="lg"
          color={Colors.ink}
          align="center"
          testID="viewfinder-permission-title"
        >
          Camera access needed
        </Text>
        <Text
          variant="regular"
          size="sm"
          color={Colors.inkSoft}
          align="center"
          testID="viewfinder-permission-body"
          style={{ marginTop: Spacing.sm, marginBottom: Spacing.xl }}
        >
          birdr needs camera access to photograph birds for identification.
        </Text>
        <Pressable
          style={styles.permissionButton}
          onPress={requestPermission}
          testID="viewfinder-permission-button"
        >
          <Text variant="semiBold" size="base" color={Colors.white} testID="viewfinder-permission-button-label">
            Grant access
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="viewfinder-screen">
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flash ? "on" : "off"}
        zoom={(zoom - 1) / 10}
        testID="viewfinder-camera"
      />

      {/* Top controls */}
      <View style={styles.topBar}>
        <CircleBtn
          icon={X}
          size={48}
          backgroundColor="rgba(0,0,0,0.4)"
          color={Colors.white}
          onPress={handleClose}
          testID="viewfinder-close"
        />

        {capturesRemaining !== null && (
          <View style={styles.quotaPill} testID="viewfinder-quota">
            <Text
              variant="semiBold"
              size="base"
              color={capturesRemaining === 0 ? Colors.coral : Colors.white}
              testID="viewfinder-quota-text"
            >
              {`${capturesRemaining} of 3 left`}
            </Text>
          </View>
        )}

        <CircleBtn
          icon={flash ? Zap : ZapOff}
          size={48}
          backgroundColor="rgba(0,0,0,0.4)"
          color={Colors.white}
          onPress={() => setFlash(!flash)}
          testID="viewfinder-flash"
        />
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        {/* Zoom pills */}
        <View style={styles.zoomRow}>
          {ZOOM_LEVELS.map((level) => (
            <Pressable
              key={level}
              style={[
                styles.zoomPill,
                zoom === level && styles.zoomPillActive,
              ]}
              onPress={() => {
                setZoom(level);
                Haptics.selectionAsync();
              }}
              testID={`viewfinder-zoom-${level}`}
            >
              <Text
                variant={zoom === level ? "semiBold" : "regular"}
                size="sm"
                color={zoom === level ? Colors.sage : Colors.white}
                testID={`viewfinder-zoom-${level}-label`}
              >
                {`${level}×`}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Shutter row: dev upload + shutter */}
        <View style={styles.shutterRow}>
          {/* Dev-only: pick from gallery */}
          {__DEV__ && (
            <Pressable
              style={styles.devUploadBtn}
              onPress={handlePickImage}
              testID="viewfinder-dev-upload"
            >
              <ImagePlus size={24} color={Colors.white} strokeWidth={1.5} />
            </Pressable>
          )}

          {/* Shutter button */}
          <Pressable
            style={({ pressed }) => [
              styles.shutter,
              pressed && { transform: [{ scale: 0.92 }] },
            ]}
            onPress={handleTakePhoto}
            disabled={isTakingPhoto}
            testID="viewfinder-shutter"
            accessible
            accessibilityRole="button"
            accessibilityLabel="Take photo"
          >
            <View style={styles.shutterInner} />
          </Pressable>

          {/* Spacer to balance the row */}
          {__DEV__ && <View style={{ width: 48 }} />}
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
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  permissionButton: {
    backgroundColor: Colors.sage,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing["2xl"],
    borderRadius: BorderRadius.full,
  },
  topBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quotaPill: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: BorderRadius.full,
  },
  bottomBar: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: Spacing.xl,
  },
  zoomRow: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  zoomPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  zoomPillActive: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  shutterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: Spacing["3xl"],
  },
  devUploadBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.md,
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.ink,
  },
});

export default ViewfinderScreen;
