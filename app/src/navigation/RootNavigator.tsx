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

  // Listen for onboarding completion
  useEffect(() => {
    if (isSignedIn && onboardingComplete === false) {
      // After sign-in during onboarding, the Permissions screen will advance
      // When OnboardingStack reaches "Complete", mark it done
    }
  }, [isSignedIn]);

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

  // Already signed in → skip onboarding, go to main app
  if (isSignedIn) {
    if (!onboardingComplete) {
      AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    }
    return <TabNavigator />;
  }

  // Not signed in → show onboarding / sign-in
  return (
    <OnboardingStack
      initialRouteName={onboardingComplete ? "SignIn" : "Welcome"}
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
