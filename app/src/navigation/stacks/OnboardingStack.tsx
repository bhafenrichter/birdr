import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeCarouselScreen from "../../screens/onboarding/WelcomeCarouselScreen";
import SignInScreen from "../../screens/onboarding/SignInScreen";
import PermissionsScreen from "../../screens/onboarding/PermissionsScreen";
import TutorialCaptureScreen from "../../screens/onboarding/TutorialCaptureScreen";

export type OnboardingStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  Permissions: undefined;
  TutorialCapture: undefined;
  Complete: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

// Placeholder complete screen that signals onboarding is done
const CompleteScreen: React.FC = () => null;

export const OnboardingStack: React.FC<{ initialRouteName?: keyof OnboardingStackParamList }> = ({
  initialRouteName = "Welcome",
  ...rest
}) => (
  <Stack.Navigator
    initialRouteName={initialRouteName}
    screenOptions={{
      headerShown: false,
      animation: "slide_from_right",
    }}
    {...rest}
  >
    <Stack.Screen name="Welcome" component={WelcomeCarouselScreen} />
    <Stack.Screen name="SignIn" component={SignInScreen} />
    <Stack.Screen name="Permissions" component={PermissionsScreen} />
    <Stack.Screen name="TutorialCapture" component={TutorialCaptureScreen} />
    <Stack.Screen
      name="Complete"
      component={CompleteScreen}
      options={{ gestureEnabled: false }}
    />
  </Stack.Navigator>
);

export default OnboardingStack;
