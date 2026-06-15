import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Camera, MapPin, Bell } from "lucide-react-native";
import * as CameraModule from "expo-camera";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Colors, Spacing } from "../../theme";
import { Text, PrimaryButton, CheckboxCard } from "../../components/atoms";
import { usePostHog } from "../../contexts/PostHogProvider";
import type { OnboardingStackParamList } from "../../navigation/stacks/OnboardingStack";

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

const PERMISSIONS = [
  {
    key: "camera",
    icon: Camera,
    name: "Camera",
    rationale: "So you can photograph birds for identification.",
    color: Colors.sage,
    badge: undefined,
  },
  {
    key: "location",
    icon: MapPin,
    name: "Location",
    rationale: "To record where you spotted each bird and power your personal map.",
    color: Colors.sky,
    badge: "Optional",
  },
  {
    key: "notifications",
    icon: Bell,
    name: "Notifications",
    rationale: "Streak reminders and achievement alerts.",
    color: Colors.coral,
    badge: "Optional",
  },
];

export const PermissionsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const posthog = usePostHog();
  const [granted, setGranted] = useState<Record<string, boolean>>({
    camera: false,
    location: false,
    notifications: false,
  });

  // Check existing permissions on mount
  useEffect(() => {
    (async () => {
      const [cameraStatus, locationStatus, notifStatus] = await Promise.all([
        CameraModule.Camera.getCameraPermissionsAsync(),
        Location.getForegroundPermissionsAsync(),
        Notifications.getPermissionsAsync(),
      ]);

      setGranted({
        camera: cameraStatus.status === "granted",
        location: locationStatus.status === "granted",
        notifications: notifStatus.status === "granted",
      });
    })();
  }, []);

  const requestPermission = useCallback(async (key: string) => {
    if (granted[key]) return;

    try {
      let result;
      switch (key) {
        case "camera":
          result = await CameraModule.Camera.requestCameraPermissionsAsync();
          break;
        case "location":
          result = await Location.requestForegroundPermissionsAsync();
          break;
        case "notifications":
          result = await Notifications.requestPermissionsAsync();
          break;
      }
      if (result?.status === "granted") {
        setGranted((prev) => ({ ...prev, [key]: true }));
        posthog.capture("permission_granted", { permission: key });
      } else {
        posthog.capture("permission_denied", { permission: key });
      }
    } catch {}
  }, [granted, posthog]);

  const handleContinue = useCallback(() => {
    posthog.capture("onboarding_step_completed", { step: "permissions", camera: granted.camera, location: granted.location, notifications: granted.notifications });
    navigation.navigate("Complete");
  }, [navigation, posthog, granted]);

  return (
    <SafeAreaView style={styles.container} testID="permissions-screen">
      <View style={styles.content}>
        <Text
          variant="bold"
          size="2xl"
          color={Colors.ink}
          testID="permissions-title"
        >
          A few permissions
        </Text>
        <Text
          variant="regular"
          size="sm"
          color={Colors.inkSoft}
          testID="permissions-subtitle"
          style={{ marginTop: Spacing.sm }}
        >
          birdr works best with these enabled
        </Text>

        <View style={styles.permissionList}>
          {PERMISSIONS.map((perm) => (
            <CheckboxCard
              key={perm.key}
              icon={
                <View style={[styles.iconCircle, { backgroundColor: perm.color }]}>
                  <perm.icon size={20} color={Colors.white} strokeWidth={2} />
                </View>
              }
              title={perm.name}
              description={perm.rationale}
              checked={granted[perm.key]}
              onPress={() => requestPermission(perm.key)}
              badge={perm.badge}
              testID={`permissions-${perm.key}`}
            />
          ))}
        </View>
      </View>

      <View style={styles.ctaWrapper}>
        <PrimaryButton
          title="Continue"
          size="lg"
          fullWidth
          onPress={handleContinue}
          disabled={!granted.camera}
          testID="permissions-continue"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["4xl"],
  },
  permissionList: {
    marginTop: Spacing["3xl"],
    gap: Spacing.lg,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaWrapper: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
});

export default PermissionsScreen;
