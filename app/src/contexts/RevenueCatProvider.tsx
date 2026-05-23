import React, { createContext, useContext } from "react";

// Stub RevenueCat context — replace with real RevenueCat when ready
type RevenueCatContextType = {
  isSubscribed: boolean;
  dailyQuotaRemaining: number;
};

const RevenueCatContext = createContext<RevenueCatContextType>({
  isSubscribed: false,
  dailyQuotaRemaining: 3,
});

export const RevenueCatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value: RevenueCatContextType = {
    isSubscribed: false,
    dailyQuotaRemaining: 3,
  };

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = () => useContext(RevenueCatContext);
