import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CaptureHubScreen from "../../screens/CaptureHubScreen";
import CaptureFlowStack from "./CaptureFlowStack";

export type CaptureStackParamList = {
  CaptureHub: undefined;
  CaptureFlow: undefined;
};

const Stack = createNativeStackNavigator<CaptureStackParamList>();

export const CaptureStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CaptureHub" component={CaptureHubScreen} />
    <Stack.Screen
      name="CaptureFlow"
      component={CaptureFlowStack}
      options={{
        presentation: "fullScreenModal",
        animation: "slide_from_bottom",
      }}
    />
  </Stack.Navigator>
);

export default CaptureStack;
