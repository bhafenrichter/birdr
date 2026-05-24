import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CaptureHubScreen from "../../screens/CaptureHubScreen";
import CaptureFlowStack from "./CaptureFlowStack";
import StreakDetailScreen from "../../screens/StreakDetailScreen";

export type CaptureStackParamList = {
  CaptureHub: undefined;
  CaptureFlow: undefined;
  StreakDetail: undefined;
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
  </Stack.Navigator>
);

export default CaptureStack;
