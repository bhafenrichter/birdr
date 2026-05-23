import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExploreScreen from "../../screens/ExploreScreen";

export type ExploreStackParamList = {
  ExploreHome: undefined;
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export const ExploreStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ExploreHome" component={ExploreScreen} />
  </Stack.Navigator>
);

export default ExploreStack;
