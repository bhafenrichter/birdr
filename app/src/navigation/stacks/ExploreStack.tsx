import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExploreScreen from "../../screens/ExploreScreen";
import LocationPickerScreen from "../../screens/LocationPickerScreen";

export type ExploreStackParamList = {
  ExploreHome: { lat?: number; lon?: number; name?: string } | undefined;
  LocationPicker: undefined;
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export const ExploreStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ExploreHome" component={ExploreScreen} />
    <Stack.Screen
      name="LocationPicker"
      component={LocationPickerScreen}
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

export default ExploreStack;
