import React, { createContext, useContext, useEffect } from "react";
import {
  PostHogProvider as PostHogReactNativeProvider,
  usePostHog as usePostHogClient,
} from "posthog-react-native";
import { ENV } from "../config/env";
import { setErrorReporter } from "../services/logger";

type PostHogContextType = {
  capture: (event: string, properties?: Record<string, any>) => void;
  screen: (screenName: string, properties?: Record<string, any>) => void;
  identify: (distinctId: string, properties?: Record<string, any>) => void;
  register: (properties: Record<string, any>) => void;
  reset: () => void;
};

const PostHogContext = createContext<PostHogContextType>({
  capture: () => {},
  screen: () => {},
  identify: () => {},
  register: () => {},
  reset: () => {},
});

const PostHogContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const posthog = usePostHogClient();
  const isDevelopment = __DEV__;

  // Wire logger errors to PostHog
  useEffect(() => {
    setErrorReporter((event, properties) => {
      if (!isDevelopment) {
        posthog?.capture(event, properties);
      }
    });
  }, [posthog, isDevelopment]);

  const value: PostHogContextType = {
    capture: (event, properties) => {
      if (!isDevelopment) {
        posthog?.capture(event, properties);
      } else {
        console.log(`[PostHog DEV] ${event}`, properties);
      }
    },
    screen: (screenName, properties) => {
      if (!isDevelopment) {
        posthog?.screen(screenName, properties);
      } else {
        console.log(`[PostHog DEV] screen: ${screenName}`, properties);
      }
    },
    identify: (distinctId, properties) => {
      if (!isDevelopment) {
        posthog?.identify(distinctId, properties);
      } else {
        console.log(`[PostHog DEV] identify: ${distinctId}`, properties);
      }
    },
    register: (properties) => {
      if (!isDevelopment) {
        posthog?.register(properties);
      } else {
        console.log(`[PostHog DEV] register:`, properties);
      }
    },
    reset: () => {
      if (!isDevelopment) {
        posthog?.reset();
      } else {
        console.log(`[PostHog DEV] reset`);
      }
    },
  };

  return (
    <PostHogContext.Provider value={value}>{children}</PostHogContext.Provider>
  );
};

export const PostHogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (!ENV.POSTHOG_API_KEY) {
    // No API key — fall back to stub so the app still runs
    return (
      <PostHogContext.Provider
        value={{
          capture: (e, p) => { if (__DEV__) console.log(`[PostHog stub] ${e}`, p); },
          screen: (s, p) => { if (__DEV__) console.log(`[PostHog stub] screen: ${s}`, p); },
          identify: (id, p) => { if (__DEV__) console.log(`[PostHog stub] identify: ${id}`, p); },
          register: (p) => { if (__DEV__) console.log(`[PostHog stub] register:`, p); },
          reset: () => { if (__DEV__) console.log(`[PostHog stub] reset`); },
        }}
      >
        {children}
      </PostHogContext.Provider>
    );
  }

  return (
    <PostHogReactNativeProvider
      apiKey={ENV.POSTHOG_API_KEY}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
      }}
      options={{
        host: ENV.POSTHOG_HOST,
        captureAppLifecycleEvents: true,
        enableSessionReplay: true,
        flushAt: 5,
        flushInterval: 30,
      }}
    >
      <PostHogContextProvider>{children}</PostHogContextProvider>
    </PostHogReactNativeProvider>
  );
};

export const usePostHog = () => useContext(PostHogContext);
