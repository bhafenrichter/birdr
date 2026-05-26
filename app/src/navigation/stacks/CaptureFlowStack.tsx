import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ViewfinderScreen from "../../screens/capture/ViewfinderScreen";
import PhotoPreviewScreen from "../../screens/capture/PhotoPreviewScreen";
import IdentifyingScreen from "../../screens/capture/IdentifyingScreen";
import CandidatePickerScreen from "../../screens/capture/CandidatePickerScreen";
import TryAgainScreen from "../../screens/capture/TryAgainScreen";
import CardRevealScreen from "../../screens/capture/CardRevealScreen";
import HardPaywallScreen from "../../screens/capture/HardPaywallScreen";
import type { IdentifyCandidate, ConservationStatus, PhotoQuality } from "../../types/api";

export type CaptureFlowParamList = {
  Viewfinder: undefined;
  PhotoPreview: { photoUri: string };
  Identifying: { photoUri: string };
  CandidatePicker: {
    photoUri: string;
    candidates: IdentifyCandidate[];
    location?: { lat: number; lon: number };
    setting?: string;
    photo_quality?: PhotoQuality;
  };
  TryAgain: { photoUri: string };
  CardReveal: {
    photoUri: string;
    speciesId: string;
    commonName: string;
    conservationStatus: string;
    location?: { lat: number; lon: number };
    setting?: string;
    photo_quality?: PhotoQuality;
  };
  HardPaywall: undefined;
};

const Stack = createNativeStackNavigator<CaptureFlowParamList>();

export const CaptureFlowStack: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: "fade",
      gestureEnabled: false,
    }}
  >
    <Stack.Screen name="Viewfinder" component={ViewfinderScreen} />
    <Stack.Screen name="PhotoPreview" component={PhotoPreviewScreen} />
    <Stack.Screen name="Identifying" component={IdentifyingScreen} />
    <Stack.Screen name="CandidatePicker" component={CandidatePickerScreen} />
    <Stack.Screen name="TryAgain" component={TryAgainScreen} />
    <Stack.Screen name="CardReveal" component={CardRevealScreen} />
    <Stack.Screen
      name="HardPaywall"
      component={HardPaywallScreen}
      options={{ animation: "slide_from_bottom" }}
    />
  </Stack.Navigator>
);

export default CaptureFlowStack;
