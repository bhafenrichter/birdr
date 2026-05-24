import React, { useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Camera, MapPin, Bell } from "lucide-react-native";
import * as CameraModule from "expo-camera";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Colors, Spacing, BorderRadius, Shadows } from "../../theme";
import { Text, PrimaryButton } from "../../components/atoms";
import type { OnboardingStackParamList } from "../../navigation/stacks/OnboardingStack";

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

const PERMISSIONS = [
  {
    icon: Camera,
    name: "Camera",
    rationale: "So you can photograph birds for identification.",
    color: Colors.sage,
    required: true,
  },
  {
    icon: MapPin,
    name: "Location",
    rationale:
      "To record where you spotted each bird. Used in your personal map and regional achievements.",
    color: Colors.sky,
    required: true,
  },
  {
    icon: Bell,
    name: "Notifications",
    rationale: "Streak reminders and achievement alerts.",
    color: Colors.coral,
    required: false,
  },
];

export const PermissionsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const handleContinue = useCallback(async () => {
    // Request permissions sequentially (Camera → Location → Notifications)
    try {
      await CameraModule.Camera.requestCameraPermissionsAsync();
    } catch {}

    try {
      await Location.requestForegroundPermissionsAsync();
    } catch {}

    try {
      await Notifications.requestPermissionsAsync();
    } catch {}

    navigation.navigate("TutorialCapture");
  }, [navigation]);

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

        {/* Permission rows */}
        <View style={styles.permissionList}>
          {PERMISSIONS.map((perm, i) => (
            <View
              key={perm.name}
              style={styles.permissionRow}
              testID={`permissions-row-${i}`}
            >
              <View
                style={[
                  styles.permissionIcon,
                  { backgroundColor: perm.color },
                ]}
              >
                <perm.icon size={20} color={Colors.white} strokeWidth={2} />
              </View>
              <View style={styles.permissionInfo}>
                <View style={styles.permissionNameRow}>
                  <Text
                    variant="semiBold"
                    size="base"
                    color={Colors.ink}
                    testID={`permissions-name-${i}`}
                  >
                    {perm.name}
                  </Text>
                  {!perm.required && (
                    <Text
                      variant="regular"
                      size="xs"
                      color={Colors.inkFaint}
                      testID={`permissions-optional-${i}`}
                    >
                      Optional
                    </Text>
                  )}
                </View>
                <Text
                  variant="regular"
                  size="sm"
                  color={Colors.inkSoft}
                  testID={`permissions-rationale-${i}`}
                >
                  {perm.rationale}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Continue */}
      <View style={styles.ctaWrapper}>
        <PrimaryButton
          title="Continue"
          size="lg"
          fullWidth
          onPress={handleContinue}
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
    gap: Spacing.xl,
  },
  permissionRow: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  permissionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionInfo: {
    flex: 1,
    gap: 2,
  },
  permissionNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  ctaWrapper: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
});

export default PermissionsScreen;
