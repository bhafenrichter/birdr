import React, { createContext, useContext } from "react";

// Stub PostHog context — replace with real PostHog provider when ready
type PostHogContextType = {
  capture: (event: string, properties?: Record<string, any>) => void;
  screen: (screenName: string) => void;
};

const PostHogContext = createContext<PostHogContextType>({
  capture: () => {},
  screen: () => {},
});

export const PostHogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value: PostHogContextType = {
    capture: (event, properties) => {
      if (__DEV__) console.log("[PostHog stub]", event, properties);
    },
    screen: (screenName) => {
      if (__DEV__) console.log("[PostHog stub] screen:", screenName);
    },
  };

  return (
    <PostHogContext.Provider value={value}>{children}</PostHogContext.Provider>
  );
};

export const usePostHog = () => useContext(PostHogContext);
