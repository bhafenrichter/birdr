import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { Colors, Spacing, BorderRadius, Shadows } from "../theme";
import { Text, PrimaryButton, GhostButton } from "../components/atoms";
import { useAuth } from "../contexts/AuthProvider";

export const SignOutConfirmScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} testID="sign-out-confirm-screen">
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <LogOut size={28} color={Colors.coral} strokeWidth={2} />
        </View>
        <Text
          variant="bold"
          size="xl"
          color={Colors.ink}
          align="center"
          testID="sign-out-title"
          style={{ marginTop: Spacing.lg }}
        >
          Sign out?
        </Text>
        <Text
          variant="regular"
          size="base"
          color={Colors.inkSoft}
          align="center"
          testID="sign-out-body"
          style={{ marginTop: Spacing.sm }}
        >
          You'll need to sign in again to access your collection.
        </Text>
      </View>

      <View style={styles.buttons}>
        <PrimaryButton
          title="Sign out"
          size="lg"
          fullWidth
          onPress={handleSignOut}
          testID="sign-out-confirm"
        />
        <GhostButton
          title="Cancel"
          size="lg"
          fullWidth
          onPress={() => navigation.goBack()}
          testID="sign-out-cancel"
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["3xl"],
    paddingVertical: Spacing["3xl"],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  buttons: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["2xl"],
    gap: Spacing.md,
  },
});

export default SignOutConfirmScreen;
