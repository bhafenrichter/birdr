import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../../screens/ProfileScreen";
import AchievementsScreen from "../../screens/AchievementsScreen";
import StreakDetailScreen from "../../screens/StreakDetailScreen";
import SubscriptionScreen from "../../screens/SubscriptionScreen";
import SignOutConfirmScreen from "../../screens/SignOutConfirmScreen";

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Achievements: undefined;
  StreakDetail: undefined;
  Subscription: undefined;
  SignOutConfirm: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileHome" component={ProfileScreen} />
    <Stack.Screen name="Achievements" component={AchievementsScreen} />
    <Stack.Screen
      name="StreakDetail"
      component={StreakDetailScreen}
      options={{
        presentation: "formSheet",
        sheetGrabberVisible: true,
        sheetCornerRadius: 24,
        sheetExpandsWhenScrolledToEdge: false,
        sheetAllowedDetents: "fitToContents",
        contentStyle: { backgroundColor: "#EAF5E5" },
      }}
    />
    <Stack.Screen name="Subscription" component={SubscriptionScreen} />
    <Stack.Screen
      name="SignOutConfirm"
      component={SignOutConfirmScreen}
      options={{
        presentation: "formSheet",
        sheetGrabberVisible: true,
        sheetCornerRadius: 24,
        sheetExpandsWhenScrolledToEdge: false,
        sheetAllowedDetents: "fitToContents",
        contentStyle: { backgroundColor: "#EAF5E5" },
      }}
    />
  </Stack.Navigator>
);

export default ProfileStack;
