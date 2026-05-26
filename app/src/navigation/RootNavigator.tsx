import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthProvider";
import { TabNavigator } from "./TabNavigator";
import { OnboardingStack } from "./stacks/OnboardingStack";
import { Colors } from "../theme";

const ONBOARDING_COMPLETE_KEY = "birdr_onboarding_complete";

export const RootNavigator: React.FC = () => {
  const { isSignedIn, isLoading: authLoading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY).then((value) => {
      setOnboardingComplete(value === "true");
    });
  }, []);

  if (authLoading || onboardingComplete === null) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.cream,
        }}
      >
        <ActivityIndicator size="large" color={Colors.sage} />
      </View>
    );
  }

  // Signed in AND onboarding complete → main app
  if (isSignedIn && onboardingComplete) {
    return <TabNavigator />;
  }

  // Not signed in, or signed in but still onboarding → show onboarding
  // New users sign in on the SignIn screen, then continue to Permissions/Tutorial
  const initialRoute = onboardingComplete
    ? "SignIn"
    : isSignedIn
      ? "Permissions"
      : "Welcome";

  return (
    <OnboardingStack
      initialRouteName={initialRoute}
      // @ts-expect-error screenListeners works at runtime but isn't in the type
      screenListeners={{
        state: (e: any) => {
          const routes = e.data?.state?.routes;
          if (routes?.length > 0) {
            const lastRoute = routes[routes.length - 1];
            if (lastRoute.name === "Complete") {
              AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
              setOnboardingComplete(true);
            }
          }
        },
      }}
    />
  );
};

export default RootNavigator;
