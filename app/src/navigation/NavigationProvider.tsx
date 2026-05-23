import React, { useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
}) => {
  const routeNameRef = useRef<string | undefined>(undefined);
  const navigationRef = useRef<any>(null);

  const getActiveRouteName = (state: any): string => {
    if (!state || !state.routes || state.routes.length === 0) return "Unknown";
    const route = state.routes[state.index];
    if (route.state) return getActiveRouteName(route.state);
    return route.name;
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        const state = navigationRef.current?.getRootState();
        if (state) {
          routeNameRef.current = getActiveRouteName(state);
        }
      }}
      onStateChange={() => {
        const state = navigationRef.current?.getRootState();
        if (state) {
          const currentRouteName = getActiveRouteName(state);
          if (routeNameRef.current !== currentRouteName) {
            // TODO(birdr): Wire PostHog screen tracking here
          }
          routeNameRef.current = currentRouteName;
        }
      }}
    >
      {children}
    </NavigationContainer>
  );
};

export default NavigationProvider;
