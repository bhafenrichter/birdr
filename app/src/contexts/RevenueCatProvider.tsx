import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Purchases, { LOG_LEVEL, CustomerInfo } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import { Platform } from "react-native";
import { ENV } from "../config/env";
import { logger } from "../services/logger";

type RevenueCatContextType = {
  isSubscribed: boolean;
  presentPaywall: () => Promise<void>;
};

const RevenueCatContext = createContext<RevenueCatContextType>({
  isSubscribed: false,
  presentPaywall: async () => {},
});

// TODO(birdr): Add REVENUECAT_API_KEY to env config
const RC_API_KEY = Platform.select({
  ios: ENV.REVENUECAT_IOS_API_KEY ?? "",
  android: ENV.REVENUECAT_ANDROID_API_KEY ?? "",
}) ?? "";

export const RevenueCatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!RC_API_KEY) {
      logger.warn("RevenueCat API key not configured, skipping init");
      return;
    }

    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey: RC_API_KEY });

    // Check initial subscription status
    Purchases.getCustomerInfo().then(updateSubscriptionStatus).catch(() => {});

    // Listen for changes
    const listener = (info: CustomerInfo) => updateSubscriptionStatus(info);
    Purchases.addCustomerInfoUpdateListener(listener);

    return () => Purchases.removeCustomerInfoUpdateListener(listener);
  }, []);

  const updateSubscriptionStatus = (info: CustomerInfo) => {
    const active = Object.keys(info.entitlements.active).length > 0;
    setIsSubscribed(active);
  };

  const presentPaywall = useCallback(async () => {
    try {
      await RevenueCatUI.presentPaywall();
    } catch (e: any) {
      logger.error("Failed to present paywall", { message: e.message });
    }
  }, []);

  return (
    <RevenueCatContext.Provider value={{ isSubscribed, presentPaywall }}>
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = () => useContext(RevenueCatContext);
