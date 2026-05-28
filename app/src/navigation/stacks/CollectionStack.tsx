import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CollectionScreen from "../../screens/CollectionScreen";
import CardDetailScreen from "../../screens/CardDetailScreen";

export type CollectionStackParamList = {
  CollectionGrid: undefined;
  CardDetail: { speciesId: string; showAsLocked?: boolean };
};

const Stack = createNativeStackNavigator<CollectionStackParamList>();

export const CollectionStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CollectionGrid" component={CollectionScreen} />
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

export default CollectionStack;
