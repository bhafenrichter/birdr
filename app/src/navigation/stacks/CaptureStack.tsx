import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CaptureHubScreen from "../../screens/CaptureHubScreen";

export type CaptureStackParamList = {
  CaptureHub: undefined;
};

const Stack = createNativeStackNavigator<CaptureStackParamList>();

export const CaptureStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CaptureHub" component={CaptureHubScreen} />
  </Stack.Navigator>
);

export default CaptureStack;
