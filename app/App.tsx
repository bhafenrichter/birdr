import React, { useCallback, useEffect } from "react";
import { View, LogBox } from "react-native";
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
import { BottomSheetProvider } from "./src/contexts/BottomSheetProvider";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { toastConfig } from "./src/config/toast";

// Keep the splash screen visible while we load fonts
SplashScreen.preventAutoHideAsync();

// Suppress yellow warning banner in dev
LogBox.ignoreAllLogs(true);

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
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationProvider>
            <PostHogProvider>
              <AuthProvider>
                <RevenueCatProvider>
                  <HapticProvider>
                    <BottomSheetProvider>
                      <RootNavigator />
                    </BottomSheetProvider>
                  </HapticProvider>
                </RevenueCatProvider>
              </AuthProvider>
            </PostHogProvider>
          </NavigationProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
      <Toast config={toastConfig} topOffset={60} />
    </View>
  );
}
