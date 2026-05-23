import React, { useCallback, useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "@expo-google-fonts/plus-jakarta-sans";
import {
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import Toast from "react-native-toast-message";

import { NavigationProvider } from "./src/navigation/NavigationProvider";
import { PostHogProvider } from "./src/contexts/PostHogProvider";
import { AuthProvider } from "./src/contexts/AuthProvider";
import { RevenueCatProvider } from "./src/contexts/RevenueCatProvider";
import { HapticProvider } from "./src/contexts/HapticProvider";
import { TabNavigator } from "./src/navigation/TabNavigator";
import { toastConfig } from "./src/config/toast";

// Keep the splash screen visible while we load fonts
SplashScreen.preventAutoHideAsync();

/**
 * Provider hierarchy (per CLAUDE.md):
 * GestureHandlerRootView > NavigationProvider > PostHog > Auth > RevenueCat > HapticFeedback > App
 */
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null; // Native splash screen stays visible
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <NavigationProvider>
          <PostHogProvider>
            <AuthProvider>
              <RevenueCatProvider>
                <HapticProvider>
                  <TabNavigator />
                </HapticProvider>
              </RevenueCatProvider>
            </AuthProvider>
          </PostHogProvider>
        </NavigationProvider>
      </SafeAreaProvider>
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
}
