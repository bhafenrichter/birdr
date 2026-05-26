import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import { Colors, Spacing } from "../../theme";
import { Text, PrimaryButton } from "../../components/atoms";
import { identifyBird, confirmSighting } from "../../services/api";
import { useAuth } from "../../contexts/AuthProvider";
import type { CaptureFlowParamList } from "../../navigation/stacks/CaptureFlowStack";
import type { IdentifyBirdResponse } from "../../types/api";

type Nav = NativeStackNavigationProp<CaptureFlowParamList>;
type Route = RouteProp<CaptureFlowParamList, "Identifying">;

export const IdentifyingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { photoUri } = route.params;
  const { refreshProfile } = useAuth();
  const [status, setStatus] = useState<"identifying" | "error">("identifying");
  const [retryCount, setRetryCount] = useState(0);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    (async () => {
      try {
        // Get location
        let location: { lat: number; lon: number } | undefined;
        try {
          const { status: locStatus } = await Location.getForegroundPermissionsAsync();
          if (locStatus === "granted") {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            location = { lat: loc.coords.latitude, lon: loc.coords.longitude };
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

        // Branch on confidence
        switch (result.result) {
          case "auto_accepted": {
            const candidate = result.candidates[0];
            if (candidate.species_id) {
              // Auto-confirm the sighting
              navigation.replace("CardReveal", {
                photoUri,
                speciesId: candidate.species_id,
                commonName: candidate.common_name,
                conservationStatus: candidate.conservation_status ?? "LC",
                location,
              });
            }
            break;
          }

          case "pick_top_3":
            navigation.replace("CandidatePicker", {
              photoUri,
              candidates: result.candidates,
              location,
            });
            break;

          case "retry":
            navigation.replace("TryAgain", { photoUri });
            break;
        }
      } catch (e: any) {
        if (e.status === 402) {
          // Quota exceeded — show hard paywall
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
            <Text
              variant="semiBold"
              size="lg"
              color={Colors.white}
              testID="identifying-error-title"
            >
              Something went wrong
            </Text>
            <View style={{ marginTop: Spacing.xl, width: "60%" }}>
              <PrimaryButton
                label="Try again"
                onPress={() => {
                  called.current = false;
                  setStatus("identifying");
                  setRetryCount((c) => c + 1);
                }}
                testID="identifying-retry"
              />
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
});

export default IdentifyingScreen;
