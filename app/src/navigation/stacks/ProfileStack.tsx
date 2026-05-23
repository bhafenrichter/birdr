import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../../screens/ProfileScreen";
import AchievementsScreen from "../../screens/AchievementsScreen";
import StreakDetailScreen from "../../screens/StreakDetailScreen";
import SubscriptionScreen from "../../screens/SubscriptionScreen";

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Achievements: undefined;
  StreakDetail: undefined;
  Subscription: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileHome" component={ProfileScreen} />
    <Stack.Screen name="Achievements" component={AchievementsScreen} />
    <Stack.Screen name="StreakDetail" component={StreakDetailScreen} />
    <Stack.Screen name="Subscription" component={SubscriptionScreen} />
  </Stack.Navigator>
);

export default ProfileStack;
