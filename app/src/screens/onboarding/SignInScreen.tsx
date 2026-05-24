import React, { useEffect } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors, Spacing, BorderRadius, Shadows, Fonts, FontSizes } from "../../theme";
import { Text } from "../../components/atoms";
import { useAuth } from "../../contexts/AuthProvider";
import type { OnboardingStackParamList } from "../../navigation/stacks/OnboardingStack";
import AppleLogo from "../../../assets/apple-logo.svg";
import GoogleLogo from "../../../assets/google-logo.svg";

export const SignInScreen: React.FC = () => {
  const { signInWithApple, signInWithGoogle, isSignedIn } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();

  useEffect(() => {
    if (isSignedIn) {
      navigation.navigate("Permissions");
    }
  }, [isSignedIn, navigation]);

  return (
    <SafeAreaView style={styles.container} testID="sign-in-screen">
      <View style={styles.content}>
        {/* Wordmark */}
        <Text
          variant="bold"
          size="3xl"
          color={Colors.sage}
          align="center"
          testID="sign-in-wordmark"
        >
          birdr
        </Text>
        <Text
          variant="regular"
          size="base"
          color={Colors.inkSoft}
          align="center"
          testID="sign-in-tagline"
          style={{ marginTop: Spacing.sm }}
        >
          Your personal bird collection
        </Text>
      </View>

      <View style={styles.buttons}>
        {/* Continue with Apple */}
        <Pressable
          style={styles.appleButton}
          onPress={signInWithApple}
          testID="sign-in-apple"
          accessible
          accessibilityRole="button"
          accessibilityLabel="Continue with Apple"
        >
          <AppleLogo width={20} height={20} style={styles.buttonIcon} />
          <Text variant="semiBold" size="base" color={Colors.white} testID="sign-in-apple-label">
            Continue with Apple
          </Text>
        </Pressable>

        {/* Continue with Google */}
        <Pressable
          style={styles.googleButton}
          onPress={signInWithGoogle}
          testID="sign-in-google"
          accessible
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          <GoogleLogo width={20} height={20} style={styles.buttonIcon} />
          <Text variant="semiBold" size="base" color={Colors.ink} testID="sign-in-google-label">
            Continue with Google
          </Text>
        </Pressable>
      </View>

      {/* Legal */}
      <View style={styles.legal}>
        <Text
          variant="regular"
          size="xs"
          color={Colors.inkFaint}
          align="center"
          testID="sign-in-legal"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
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
    alignItems: "center",
    justifyContent: "center",
  },
  buttons: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.ink,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.paper,
    ...Shadows.sm,
  },
  legal: {
    paddingHorizontal: Spacing["3xl"],
    paddingVertical: Spacing.xl,
  },
});

export default SignInScreen;
