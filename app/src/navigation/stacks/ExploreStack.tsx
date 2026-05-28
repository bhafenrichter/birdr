import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExploreScreen from "../../screens/ExploreScreen";
import LocationPickerScreen from "../../screens/LocationPickerScreen";
import CardDetailScreen from "../../screens/CardDetailScreen";

export type ExploreStackParamList = {
  ExploreHome: { lat?: number; lon?: number; name?: string } | undefined;
  LocationPicker: undefined;
  CardDetail: { speciesId: string; showAsLocked?: boolean };
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export const ExploreStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ExploreHome" component={ExploreScreen} />
    <Stack.Screen
      name="LocationPicker"
      component={LocationPickerScreen}
      options={{
        presentation: "modal",
        contentStyle: { backgroundColor: "#EAF5E5" },
      }}
    />
    <Stack.Screen
      name="CardDetail"
      component={CardDetailScreen}
      options={{
        presentation: "transparentModal",
        animation: "none",
      }}
    />
  </Stack.Navigator>
);

export default ExploreStack;
