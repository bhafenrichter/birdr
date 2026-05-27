import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import { AlertCircle } from "lucide-react-native";
import { Colors, Spacing, BorderRadius } from "../../theme";
import { Text, PrimaryButton } from "../../components/atoms";
import { identifyBird, confirmSighting } from "../../services/api";
import { useAuth } from "../../contexts/AuthProvider";
import { usePostHog } from "../../contexts/PostHogProvider";
import type { CaptureFlowParamList } from "../../navigation/stacks/CaptureFlowStack";
import type { IdentifyBirdResponse } from "../../types/api";

type Nav = NativeStackNavigationProp<CaptureFlowParamList>;
type Route = RouteProp<CaptureFlowParamList, "Identifying">;

export const IdentifyingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { photoUri } = route.params;
  const { refreshProfile } = useAuth();
  const posthog = usePostHog();
  const [status, setStatus] = useState<"identifying" | "error">("identifying");
  const [retryCount, setRetryCount] = useState(0);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    (async () => {
      try {
        // Get location — request permission if not yet granted
        let location: { lat: number; lon: number } | undefined;
        try {
          let { status: locStatus } = await Location.getForegroundPermissionsAsync();
          if (locStatus !== "granted") {
            const response = await Location.requestForegroundPermissionsAsync();
            locStatus = response.status;
          }
          if (locStatus === "granted") {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            location = { lat: loc.coords.latitude, lon: loc.coords.longitude };
          } else {
            Toast.show({
              type: "info",
              text1: "Location unavailable",
              text2: "Your sighting won't include a location. Enable in Settings.",
            });
          }
        } catch {
          // Location unavailable — proceed without it
        }

        // Call identify-bird
        const imageFile = {
          uri: photoUri,
          type: "image/jpeg",
          name: "capture.jpg",
        };

        const result: IdentifyBirdResponse = await identifyBird(
          imageFile,
          location
        );

        // Refresh profile to get updated quota
        await refreshProfile();

        posthog.capture("identification_completed", {
          result: result.result,
          top_confidence: result.candidates[0]?.confidence ?? 0,
          candidate_count: result.candidates.length,
          photo_quality: result.photo_quality,
          is_screen_photo: result.is_screen_photo,
          captures_remaining: result.captures_remaining,
        });

        // Block screen photos — show shame card
        if (result.is_screen_photo) {
          posthog.capture("screen_photo_blocked");
          navigation.replace("ShameCard");
          return;
        }

        // Branch on confidence
        switch (result.result) {
          case "auto_accepted": {
            const candidate = result.candidates[0];
            if (candidate.species_id) {
              navigation.replace("CardReveal", {
                photoUri,
                speciesId: candidate.species_id,
                commonName: candidate.common_name,
                conservationStatus: candidate.conservation_status ?? "LC",
                location,
                setting: result.setting ?? undefined,
                photo_quality: result.photo_quality,
              });
            }
            break;
          }

          case "pick_top_3":
            navigation.replace("CandidatePicker", {
              photoUri,
              candidates: result.candidates,
              location,
              setting: result.setting ?? undefined,
              photo_quality: result.photo_quality,
            });
            break;

          case "retry":
            navigation.replace("TryAgain", { photoUri });
            break;
        }
      } catch (e: any) {
        if (e.status === 402) {
          posthog.capture("quota_exceeded");
          navigation.replace("HardPaywall");
          return;
        }
        setStatus("error");
      }
    })();
  }, [retryCount]);

  return (
    <View style={styles.container} testID="identifying-screen">
      {/* Dimmed photo background */}
      <Image
        source={{ uri: photoUri }}
        style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
        contentFit="cover"
        testID="identifying-photo"
      />

      <View style={styles.content}>
        {status === "identifying" ? (
          <>
            <ActivityIndicator
              size="large"
              color={Colors.saffron}
              testID="identifying-spinner"
            />
            <Text
              variant="semiBold"
              size="lg"
              color={Colors.white}
              testID="identifying-label"
              style={{ marginTop: Spacing.lg }}
            >
              Identifying...
            </Text>
          </>
        ) : (
          <>
            <View style={styles.errorCard}>
              <AlertCircle size={32} color={Colors.coral} strokeWidth={1.5} />
              <Text
                variant="semiBold"
                size="lg"
                color={Colors.white}
                align="center"
                testID="identifying-error-title"
                style={{ marginTop: Spacing.md }}
              >
                Something went wrong
              </Text>
              <Text
                variant="regular"
                size="sm"
                color="rgba(255,255,255,0.6)"
                align="center"
                style={{ marginTop: Spacing.xs }}
              >
                We couldn't identify this photo. Try again or retake.
              </Text>
            </View>

            <View style={styles.errorButtons}>
              <PrimaryButton
                title="Try again"
                size="lg"
                fullWidth
                onPress={() => {
                  called.current = false;
                  setStatus("identifying");
                  setRetryCount((c) => c + 1);
                }}
                testID="identifying-retry"
              />
              <Pressable
                style={({ pressed }) => [styles.retakeBtn, pressed && { opacity: 0.7 }]}
                onPress={() => navigation.goBack()}
                testID="identifying-retake"
              >
                <Text variant="medium" size="md" color={Colors.white}>
                  Retake photo
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorCard: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing["3xl"],
    paddingHorizontal: Spacing.xl,
    marginHorizontal: Spacing.xl,
  },
  errorButtons: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 50 : 30,
    left: Spacing.xl,
    right: Spacing.xl,
    gap: Spacing.md,
  },
  retakeBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});

export default IdentifyingScreen;
