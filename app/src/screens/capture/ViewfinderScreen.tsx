import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as ScreenOrientation from "expo-screen-orientation";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { X, ImagePlus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Spacing, BorderRadius, Shadows } from "../../theme";
import { Text, CircleBtn } from "../../components/atoms";
import { useAuth } from "../../contexts/AuthProvider";
import type { CaptureFlowParamList } from "../../navigation/stacks/CaptureFlowStack";

type Nav = NativeStackNavigationProp<CaptureFlowParamList>;

const ZOOM_LEVELS = [1, 2, 3] as const;

export const ViewfinderScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { profile } = useAuth();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [zoom, setZoom] = useState<(typeof ZOOM_LEVELS)[number]>(1);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const isFocused = useIsFocused();

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const dailyUsed = profile?.daily_captures_used ?? 0;
  const isFree = (profile?.subscription_tier ?? "free") === "free";
  const capturesRemaining = isFree ? Math.max(0, 3 - dailyUsed) : null;

  // Unlock orientation when this screen is focused, lock back on leave
  useEffect(() => {
    if (isFocused) {
      ScreenOrientation.unlockAsync();
    }
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    };
  }, [isFocused]);

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
        // Lock back to portrait before navigating
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP,
        );
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
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
      navigation.navigate("PhotoPreview", { photoUri: result.assets[0].uri });
    }
  }, [navigation]);

  const handleClose = useCallback(async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    );
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
          <Text
            variant="semiBold"
            size="base"
            color={Colors.white}
            testID="viewfinder-permission-button-label"
          >
            Grant access
          </Text>
        </Pressable>
      </View>
    );
  }

  // ── Landscape layout ────────────────────────────────────────────────────
  if (isLandscape) {
    return (
      <View style={styles.container} testID="viewfinder-screen-landscape">
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          flash="off"
          zoom={(zoom - 1) / 10}
          testID="viewfinder-camera"
        />

        <SafeAreaView style={styles.landscapeOverlay} pointerEvents="box-none">
          {/* Left column: close + quota */}
          <View style={styles.landscapeLeftColumn}>
            <Animated.View
              style={styles.landscapeTopRow}
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
              key="landscape-top"
            >
              <CircleBtn
                icon={X}
                size={44}
                backgroundColor="rgba(0,0,0,0.4)"
                color={Colors.white}
                onPress={handleClose}
                testID="viewfinder-close"
              />
              {capturesRemaining !== null && (
                <View style={styles.quotaPill} testID="viewfinder-quota">
                  <Text
                    variant="semiBold"
                    size="sm"
                    color={
                      capturesRemaining === 0 ? Colors.coral : Colors.white
                    }
                  >
                    {`${capturesRemaining} of 3 left`}
                  </Text>
                </View>
              )}
            </Animated.View>
          </View>

          {/* Right side: zoom + shutter */}
          <Animated.View
            style={styles.landscapeRightBar}
            entering={FadeIn.delay(100).duration(300)}
            exiting={FadeOut.duration(200)}
            key="landscape-controls"
          >
            <View style={styles.landscapeZoomColumn}>
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
                  >
                    {`${level}×`}
                  </Text>
                </Pressable>
              ))}
            </View>

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

            {__DEV__ && (
              <Pressable
                style={styles.devUploadBtn}
                onPress={handlePickImage}
                testID="viewfinder-dev-upload"
              >
                <ImagePlus size={22} color={Colors.white} strokeWidth={1.5} />
              </Pressable>
            )}
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Portrait layout ─────────────────────────────────────────────────────
  return (
    <View style={styles.container} testID="viewfinder-screen">
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash="off"
        zoom={(zoom - 1) / 10}
        testID="viewfinder-camera"
      />

      {/* Top controls */}
      <Animated.View
        style={styles.topBar}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        key="portrait-top"
      >
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

        <View style={{ width: 48 }} />
      </Animated.View>

      {/* Bottom controls */}
      <Animated.View
        style={styles.bottomBar}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        key="portrait-bottom"
      >
        {/* Zoom pills */}
        <View style={styles.zoomRow}>
          {ZOOM_LEVELS.map((level) => (
            <Pressable
              key={level}
              style={[styles.zoomPill, zoom === level && styles.zoomPillActive]}
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

        {/* Shutter row */}
        <View style={styles.shutterRow}>
          {__DEV__ && (
            <Pressable
              style={styles.devUploadBtn}
              onPress={handlePickImage}
              testID="viewfinder-dev-upload"
            >
              <ImagePlus size={24} color={Colors.white} strokeWidth={1.5} />
            </Pressable>
          )}

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

          {__DEV__ && <View style={{ width: 48 }} />}
        </View>
      </Animated.View>
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

  // ── Portrait ──────────────────────────────────────────────────────────
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

  // ── Landscape ─────────────────────────────────────────────────────────
  landscapeOverlay: {
    ...StyleSheet.absoluteFill,
    flex: 1,
    flexDirection: "row",
  },
  landscapeLeftColumn: {
    flex: 1,
    padding: Spacing.xl,
  },
  landscapeTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  landscapeRightBar: {
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xl,
  },
  landscapeZoomColumn: {
    gap: Spacing.sm,
  },
});

export default ViewfinderScreen;
