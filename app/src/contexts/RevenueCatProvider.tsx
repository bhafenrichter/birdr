import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import { ENV } from "../config/env";
import { logger } from "../services/logger";
import { useAuth } from "./AuthProvider";
import { usePostHog } from "./PostHogProvider";
import { useProfile } from "../hooks/useApi";

// ── Entitlement + Product IDs ─────────────────────────────────────────────

const ENTITLEMENT_ID = "Hoftware Pro";

// ── Context Type ──────────────────────────────────────────────────────────

type RevenueCatContextType = {
  /** Whether the user has an active "Hoftware Pro" entitlement */
  isSubscribed: boolean;
  /** Full customer info from RevenueCat */
  customerInfo: CustomerInfo | null;
  /** Current offering (contains monthly/yearly packages) */
  currentOffering: PurchasesOffering | null;
  /** Present the RevenueCat-hosted paywall UI */
  presentPaywall: () => Promise<void>;
  /** Present the RevenueCat Customer Center (manage subscription) */
  presentCustomerCenter: () => Promise<void>;
  /** Purchase a specific package */
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  /** Restore previous purchases */
  restorePurchases: () => Promise<boolean>;
  /** Whether RevenueCat is initialized */
  isReady: boolean;
};

const RevenueCatContext = createContext<RevenueCatContextType>({
  isSubscribed: false,
  customerInfo: null,
  currentOffering: null,
  presentPaywall: async () => {},
  presentCustomerCenter: async () => {},
  purchasePackage: async () => false,
  restorePurchases: async () => false,
  isReady: false,
});

// ── Provider ──────────────────────────────────────────────────────────────

export const RevenueCatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const posthog = usePostHog();
  const { data: profile } = useProfile();
  const [isReady, setIsReady] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] =
    useState<PurchasesOffering | null>(null);

  // ── Initialize RevenueCat ─────────────────────────────────────────────

  useEffect(() => {
    const apiKey = ENV.REVENUECAT_API_KEY;
    if (!apiKey) {
      logger.warn("RevenueCat API key not configured, skipping init");
      return;
    }

    const init = async () => {
      try {
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }

        Purchases.configure({ apiKey });
        logger.info("RevenueCat configured");

        // Fetch initial customer info
        const info = await Purchases.getCustomerInfo();
        handleCustomerInfoUpdate(info);

        // Fetch offerings
        const offerings = await Purchases.getOfferings();
        if (offerings.current) {
          setCurrentOffering(offerings.current);
          logger.info("RevenueCat offering loaded", {
            id: offerings.current.identifier,
            packages: offerings.current.availablePackages.length,
          });
        }

        setIsReady(true);
      } catch (e: any) {
        logger.error("RevenueCat init failed", { message: e.message });
      }
    };

    init();

    // Listen for customer info changes (purchases, renewals, cancellations)
    const listener = (info: CustomerInfo) => handleCustomerInfoUpdate(info);
    Purchases.addCustomerInfoUpdateListener(listener);

    return () => { Purchases.removeCustomerInfoUpdateListener(listener); };
  }, []);

  // ── Identify user with RevenueCat using customer_id ────────────────────

  useEffect(() => {
    if (!isReady || !profile?.customer_id) return;

    const identify = async () => {
      try {
        const { customerInfo: info } = await Purchases.logIn(profile.customer_id);
        handleCustomerInfoUpdate(info);

        // Set display name as an attribute for support/dashboard
        if (profile.display_name) {
          Purchases.setDisplayName(profile.display_name);
        }

        logger.info("RevenueCat user identified", {
          customerId: profile.customer_id,
        });
      } catch (e: any) {
        logger.error("RevenueCat logIn failed", { message: e.message });
      }
    };

    identify();
  }, [isReady, profile?.customer_id]);

  // ── Handle customer info updates ──────────────────────────────────────

  const handleCustomerInfoUpdate = (info: CustomerInfo) => {
    setCustomerInfo(info);
    const hasEntitlement = !!info.entitlements.active[ENTITLEMENT_ID];
    setIsSubscribed(hasEntitlement);
    logger.info("RevenueCat subscription status", {
      isSubscribed: hasEntitlement,
      activeEntitlements: Object.keys(info.entitlements.active),
    });
  };

  // ── Present RevenueCat Paywall ────────────────────────────────────────

  const presentPaywall = useCallback(async () => {
    try {
      logger.info("Presenting RevenueCat paywall");
      posthog.capture("paywall_shown", { trigger: "revenuecat_paywall" });
      const result = await RevenueCatUI.presentPaywall();
      logger.info("Paywall dismissed", { result });
    } catch (e: any) {
      logger.error("Failed to present paywall", { message: e.message });
    }
  }, [posthog]);

  // ── Present Customer Center ───────────────────────────────────────────

  const presentCustomerCenter = useCallback(async () => {
    try {
      logger.info("Presenting RevenueCat Customer Center");
      await RevenueCatUI.presentCustomerCenter();
    } catch (e: any) {
      logger.error("Failed to present Customer Center", {
        message: e.message,
      });
    }
  }, []);

  // ── Purchase a package ────────────────────────────────────────────────

  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      try {
        logger.info("Purchasing package", { id: pkg.identifier });
        const { customerInfo: info } = await Purchases.purchasePackage(pkg);
        handleCustomerInfoUpdate(info);
        const success = !!info.entitlements.active[ENTITLEMENT_ID];
        if (success) {
          posthog.capture("subscription_started", { package_id: pkg.identifier });
        }
        return success;
      } catch (e: any) {
        if (e.userCancelled) {
          logger.info("Purchase cancelled by user");
          return false;
        }
        logger.error("Purchase failed", { message: e.message, code: e.code });
        return false;
      }
    },
    []
  );

  // ── Restore purchases ─────────────────────────────────────────────────

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      logger.info("Restoring purchases");
      const info = await Purchases.restorePurchases();
      handleCustomerInfoUpdate(info);
      const restored = !!info.entitlements.active[ENTITLEMENT_ID];
      logger.info("Restore result", { isSubscribed: restored });
      return restored;
    } catch (e: any) {
      logger.error("Restore failed", { message: e.message });
      return false;
    }
  }, []);

  return (
    <RevenueCatContext.Provider
      value={{
        isSubscribed,
        customerInfo,
        currentOffering,
        presentPaywall,
        presentCustomerCenter,
        purchasePackage,
        restorePurchases,
        isReady,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = () => useContext(RevenueCatContext);
