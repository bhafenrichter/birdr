# Subscription Management Pattern with RevenueCat

This document describes the subscription management architecture using RevenueCat for in-app purchases and subscription handling across iOS and Android platforms.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Dependencies](#core-dependencies)
4. [RevenueCat Setup](#revenuecat-setup)
5. [Implementation Guide](#implementation-guide)
6. [Key Patterns](#key-patterns)
7. [Usage Examples](#usage-examples)
8. [Best Practices](#best-practices)

---

## Overview

### Subscription Flow

1. **User authenticates** and has a valid `customerId`
2. **RevenueCat SDK initializes** with platform-specific API key and `customerId`
3. **Offerings are fetched** from RevenueCat (subscription plans, pricing)
4. **Premium status is determined** via RevenueCat entitlements and free trial checks
5. **Paywall is triggered** when user needs to subscribe or trial expires
6. **Purchase is processed** via RevenueCat's native paywall UI
7. **Subscription data syncs** across app, RevenueCat, and backend (if applicable)

### Key Principles

- **RevenueCat manages purchases** - all subscription/purchase logic via RevenueCat SDK
- **Platform-agnostic** - works seamlessly on iOS (App Store) and Android (Google Play)
- **Entitlements-based access control** - check entitlements, not products
- **Native paywall UI** - uses RevenueCat's pre-built paywall component
- **Context-based state management** - subscription state available app-wide
- **Free trial support** - built-in handling of trial periods
- **Restore purchases** - users can restore subscriptions on new devices

### Integration with Other Services

RevenueCat integrates with authentication, configuration, and analytics:

- **Authentication** - `customerId` from AuthProvider identifies purchases → See `authentication-pattern.md`
- **Configuration** - RevenueCat API keys stored in ConfigCat → See `configcat-pattern.md`
- **Analytics** - Track subscription events with PostHog → See `posthog-pattern.md`
- **Provider Hierarchy** - SubscriptionProvider nested inside Auth + Config providers

---

## Architecture

```
┌─────────────────────┐
│   AuthContext       │ ← Provides user.customerId
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  ConfigContext      │ ← Provides RevenueCat API keys
└──────────┬──────────┘
           │
┌──────────▼────────────────────┐
│  SubscriptionContext          │ ← Manages subscription state
└──────────┬────────────────────┘
           │
           ├──► RevenueCat SDK (Purchases)
           │    ├─► Fetch Offerings
           │    ├─► Get Customer Info
           │    ├─► Present Paywall
           │    ├─► Restore Purchases
           │    └─► Manage Subscriptions
           │
           └──► Backend API (optional)
                └─► Sync subscription status
```

**Important: Provider Hierarchy**

SubscriptionProvider **must** be nested inside:
1. `AuthProvider` - provides `user.customerId` 
2. `ConfigProvider` - provides RevenueCat API keys

```tsx
<AuthProvider>
  <ConfigProvider>
    <SubscriptionProvider>
      <YourApp />
    </SubscriptionProvider>
  </ConfigProvider>
</AuthProvider>
```

---

## Core Dependencies

### Required NPM Packages

```json
{
  "react-native-purchases": "^8.11.3",
  "react-native-purchases-ui": "^8.11.3"
}
```

### Installation

```bash
npm install react-native-purchases react-native-purchases-ui

# iOS additional steps
cd ios && pod install && cd ..
```

### Platform-Specific Configuration

#### iOS Configuration

Add to `ios/[YourApp]/Info.plist`:

```xml
<key>SKAdNetworkItems</key>
<array>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>cstr6suwn9.skadnetwork</string>
  </dict>
</array>
```

#### Android Configuration

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="com.android.vending.BILLING" />
```

---

## RevenueCat Setup

### 1. Create RevenueCat Account

1. Go to [revenuecat.com](https://www.revenuecat.com/) and create an account
2. Create a new project

### 2. Configure App Stores

#### iOS (App Store Connect)

1. In RevenueCat dashboard → Project Settings → Apple App Store
2. Enter your Bundle ID
3. Generate and upload App Store Connect API Key (Team Key)
4. Copy the **iOS API Key** (needed for app configuration)

#### Android (Google Play Console)

1. In RevenueCat dashboard → Project Settings → Google Play Store
2. Enter your Package Name
3. Upload Google Play Service Account JSON
4. Copy the **Android API Key** (needed for app configuration)

### 3. Create Products & Offerings

#### Create Products

1. In RevenueCat dashboard → Products
2. Click "New" → Select platform (iOS/Android)
3. Enter Product ID (e.g., `monthly_subscription`, `annual_subscription`)
4. Configure pricing in App Store Connect / Google Play Console
5. Import products into RevenueCat

#### Create Entitlements

1. In RevenueCat dashboard → Entitlements
2. Click "New Entitlement"
3. Name it (e.g., `pro`, `premium`)
4. Attach products to this entitlement

#### Create Offerings

Offerings are groups of packages (subscription options) presented to users.

1. In RevenueCat dashboard → Offerings
2. Click "New Offering"
3. Give it an identifier (e.g., `default`, `free_trial_complete`, `discounted_offer`)
4. Add packages:
   - **Monthly Package**: Attach monthly product, set identifier as `$rc_monthly`
   - **Annual Package**: Attach annual product, set identifier as `$rc_annual`
5. Set one offering as "Current" (default offering)

**Offering Strategy:**

- `default` - Your standard subscription offering
- `free_trial_complete` - Offering shown when free trial expires
- `discounted_offer` - Special promotional offering
- Custom offerings based on user segments

### 4. Configure Free Trials

Free trials are configured at the product level in App Store Connect / Google Play Console:

- **iOS**: Set up introductory offers in App Store Connect
- **Android**: Set up free trials in Google Play Console

RevenueCat automatically detects and handles these trial periods.

---

## Implementation Guide

### Step 1: Environment Variables & Configuration

You can source RevenueCat API keys from:
- **Environment variables** (simple approach)
- **ConfigCat** (recommended for dynamic configuration - see ConfigCat pattern documentation)

#### Option A: Environment Variables

```bash
# .env file
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_xxxxxxxxxxxxx
```

#### Option B: ConfigCat (Recommended)

See ConfigCat pattern documentation for setup details.

```typescript
// In ConfigProvider context
export enum ConfigKeys {
  RevenueCatGoogleApiKey = "revenecatGoogleApiKey",
  RevenueCatAppleApiKey = "revenecatAppleApiKey",
}
```

---

### Step 2: Create Subscription Context

**File: `src/contexts/subscription.tsx`**

```typescript
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
} from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { Linking, Platform } from "react-native";
import { useAuth } from "./auth";
import { ConfigKeys, useConfigValue } from "./config"; // or use env vars

// Subscription type representing current subscription state
type Subscription = {
  status: string;
  trialEndsAt?: Date;
  subscriptionExpiresAt?: Date;
  isPremium: boolean;
};

interface SubscriptionContextType {
  currentSubscription: Subscription;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  triggerPaywall: (offeringId?: string) => Promise<PAYWALL_RESULT | null>;
  isPremiumFeaturesAvailable: () => boolean;
  getCurrentSubscriptionPrice: () => string | null;
  cancelSubscription: () => Promise<void>;
  restorePurchases: () => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export const SubscriptionProvider: React.FC<{ 
  children: ReactNode;
  autoTriggerOnExpired?: boolean; // Optional: auto-show paywall when expired
}> = ({
  children,
  autoTriggerOnExpired = false, // Default to false - manually trigger paywall
}) => {
  const { user, refetchUser } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState<Subscription>({
    status: "Unknown",
    trialEndsAt: undefined,
    subscriptionExpiresAt: undefined,
    isPremium: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [allOfferings, setAllOfferings] = useState<{
    [key: string]: PurchasesOffering;
  }>({});

  // Get API keys from ConfigCat or environment variables
  const REVENUECAT_GOOGLE_API_KEY = useConfigValue(
    ConfigKeys.RevenueCatGoogleApiKey
  );
  // Or: const REVENUECAT_GOOGLE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
  
  const REVENUECAT_APPLE_API_KEY = useConfigValue(
    ConfigKeys.RevenueCatAppleApiKey
  );
  // Or: const REVENUECAT_APPLE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;

  /**
   * Syncs subscription data after purchase or restore.
   * Refetches user profile and RevenueCat customer info.
   */
  const syncSubscriptionData = async () => {
    try {
      // Refetch user data from backend (if applicable)
      if (refetchUser) {
        await refetchUser();
      }

      // Fetch latest customer info from RevenueCat
      const updatedCustomerInfo = await Purchases.getCustomerInfo();
      setCustomerInfo(updatedCustomerInfo);

      // Update subscription state based on RevenueCat entitlements
      const subscriptionStatus = getSubscriptionFromCustomerInfo(updatedCustomerInfo);
      setCurrentSubscription(subscriptionStatus);

      console.log("RevenueCat: Subscription data synced successfully");
    } catch (error) {
      console.error("Failed to sync subscription data:", error);
      // Log error to monitoring service (Sentry, etc.)
    }
  };

  /**
   * Fetches all available offerings from RevenueCat.
   */
  const fetchOfferings = async () => {
    const offeringsData = await Purchases.getOfferings();
    
    // Set current (default) offering
    if (offeringsData.current) {
      setOfferings(offeringsData.current);
    }

    // Store all offerings for later access by ID
    const allOfferingsMap: { [key: string]: PurchasesOffering } = {};
    Object.entries(offeringsData.all).forEach(([key, offering]) => {
      allOfferingsMap[key] = offering;
    });
    setAllOfferings(allOfferingsMap);

    return offeringsData;
  };

  /**
   * Extracts subscription information from RevenueCat CustomerInfo.
   * Uses entitlements to determine premium status.
   */
  const getSubscriptionFromCustomerInfo = (info: CustomerInfo): Subscription => {
    const activeEntitlements = Object.keys(info.entitlements.active);
    const isPremium = activeEntitlements.length > 0;

    // Get the first active entitlement (assuming single subscription model)
    const firstEntitlement = Object.values(info.entitlements.active)[0];

    return {
      status: isPremium ? "Active" : "Inactive",
      trialEndsAt: firstEntitlement?.expirationDate 
        ? new Date(firstEntitlement.expirationDate) 
        : undefined,
      subscriptionExpiresAt: firstEntitlement?.expirationDate 
        ? new Date(firstEntitlement.expirationDate) 
        : undefined,
      isPremium,
    };
  };

  /**
   * Initialize RevenueCat SDK when user is authenticated.
   */
  useEffect(() => {
    if (
      !user?.customerId ||
      !REVENUECAT_APPLE_API_KEY ||
      !REVENUECAT_GOOGLE_API_KEY
    ) {
      return;
    }

    const initializeRevenueCat = async () => {
      setIsLoading(true);

      try {
        // Select API key based on platform
        const apiKey =
          Platform.OS === "ios"
            ? REVENUECAT_APPLE_API_KEY
            : REVENUECAT_GOOGLE_API_KEY;

        if (apiKey) {
          // Configure RevenueCat with user's customer ID
          await Purchases.configure({
            apiKey,
            appUserID: user.customerId, // CRITICAL: Use customerId, not backend auth user ID
          });
          console.log(`RevenueCat: Initialized for ${Platform.OS}`);
        }

        // Set log level (ERROR for production, DEBUG for development)
        await Purchases.setLogLevel(LOG_LEVEL.ERROR);

        if (await Purchases.isConfigured()) {
          // Fetch customer info and offerings
          const updatedCustomerInfo = await Purchases.getCustomerInfo();
          setCustomerInfo(updatedCustomerInfo);
          await fetchOfferings();

          // Update subscription state
          const subscriptionStatus = getSubscriptionFromCustomerInfo(updatedCustomerInfo);
          setCurrentSubscription(subscriptionStatus);

          // Auto-trigger paywall if subscription expired (optional)
          if (autoTriggerOnExpired && !subscriptionStatus.isPremium) {
            triggerPaywall("free_trial_complete");
          }
        }
      } catch (error) {
        console.error("Failed to initialize RevenueCat:", error);
        // Log error to monitoring service
      } finally {
        setIsLoading(false);
      }
    };

    initializeRevenueCat();
  }, [REVENUECAT_APPLE_API_KEY, REVENUECAT_GOOGLE_API_KEY, user]);

  /**
   * Triggers the paywall UI for a specific offering.
   * 
   * @param offeringId - Optional offering identifier (e.g., 'free_trial_complete', 'discounted_offer')
   *                     If not provided, uses current (default) offering
   * @returns PAYWALL_RESULT indicating purchase, restore, cancel, or error
   */
  const triggerPaywall = async (
    offeringId?: string
  ): Promise<PAYWALL_RESULT | null> => {
    try {
      let targetOffering: PurchasesOffering | null = null;

      // Find the target offering by ID
      if (offeringId) {
        targetOffering = allOfferings[offeringId] || null;
        if (!targetOffering) {
          console.warn(
            `Offering '${offeringId}' not found. Refetching offerings...`
          );
          const offeringsData = await fetchOfferings();
          targetOffering = offeringsData.all[offeringId] || null;
        }
      } else {
        // Use current (default) offering
        targetOffering = offerings;
      }

      // If still no offering found, try fetching current offerings
      if (!targetOffering) {
        console.warn("No offerings available. Attempting to refetch.");
        const offeringsData = await fetchOfferings();
        targetOffering = offeringsData.current;
      }

      if (!targetOffering) {
        console.error("No offerings available. Cannot present paywall.");
        return PAYWALL_RESULT.ERROR;
      }

      // Present RevenueCat's native paywall UI
      const paywallResult = await RevenueCatUI.presentPaywall({
        offering: targetOffering,
      });

      // Sync subscription data if purchase or restore was successful
      if (
        paywallResult === PAYWALL_RESULT.PURCHASED ||
        paywallResult === PAYWALL_RESULT.RESTORED
      ) {
        console.log("Purchase successful, syncing subscription data...");
        await syncSubscriptionData();
      }

      return paywallResult;
    } catch (error: any) {
      // Handle case where paywall is already presented
      if (error.code === "26" || error.message?.includes("Paywall already presented")) {
        console.warn("Paywall is already presented.");
      } else {
        console.error("Failed to present paywall:", error);
      }
      return PAYWALL_RESULT.ERROR;
    }
  };

  /**
   * Checks if premium features are available to the user.
   * Combines active subscription status with free trial logic.
   * 
   * @returns true if user has premium access (via subscription or active trial)
   */
  const isPremiumFeaturesAvailable = (): boolean => {
    // Check if user has active entitlements
    if (customerInfo) {
      const activeEntitlements = Object.keys(customerInfo.entitlements.active);
      if (activeEntitlements.length > 0) {
        return true;
      }
    }

    // Fallback: Check trial end date
    if (currentSubscription.trialEndsAt) {
      return new Date() < currentSubscription.trialEndsAt;
    }

    return false;
  };

  /**
   * Gets the current subscription price as a formatted string.
   * 
   * @returns Formatted price string (e.g., "$4.99") or null
   */
  const getCurrentSubscriptionPrice = (): string | null => {
    if (!customerInfo) return null;

    // Get the active subscription from customer info
    const activeEntitlements = customerInfo.entitlements.active;
    if (Object.keys(activeEntitlements).length === 0) return null;

    // Get the first active entitlement (assuming single subscription)
    const firstEntitlement = Object.values(activeEntitlements)[0];
    if (!firstEntitlement) return null;

    const productId = firstEntitlement.productIdentifier;

    // Try to get pricing from current offerings
    if (offerings) {
      const product = offerings.availablePackages.find(
        (pkg) => pkg.product.identifier === productId
      );
      if (product) {
        return product.product.priceString;
      }
    }

    // Fallback: search all offerings
    for (const offering of Object.values(allOfferings)) {
      const product = offering.availablePackages.find(
        (pkg) => pkg.product.identifier === productId
      );
      if (product) {
        return product.product.priceString;
      }
    }

    return null;
  };

  /**
   * Opens platform-specific subscription management.
   * Users can cancel, modify, or view their subscription.
   */
  const cancelSubscription = async (): Promise<void> => {
    try {
      const info = await Purchases.getCustomerInfo();
      const managementUrl = info.managementURL;

      if (managementUrl) {
        // Opens App Store (iOS) or Google Play (Android) subscription management
        await Linking.openURL(managementUrl);
      } else {
        throw new Error("Unable to get subscription management URL");
      }
    } catch (error) {
      console.error("Failed to open subscription management:", error);
      throw error;
    }
  };

  /**
   * Restores previous purchases.
   * Useful when user reinstalls app or switches devices.
   * 
   * @returns true if purchases were restored, false otherwise
   */
  const restorePurchases = async (): Promise<boolean> => {
    try {
      console.log("Attempting to restore purchases...");
      const updatedCustomerInfo = await Purchases.restorePurchases();
      setCustomerInfo(updatedCustomerInfo);

      const activeEntitlements = Object.keys(
        updatedCustomerInfo.entitlements.active
      );

      if (activeEntitlements.length > 0) {
        console.log(
          `Successfully restored ${activeEntitlements.length} entitlement(s)`
        );
        await syncSubscriptionData();
        return true;
      } else {
        console.log("No active entitlements found to restore");
        return false;
      }
    } catch (error) {
      console.error("Failed to restore purchases:", error);
      return false;
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        currentSubscription,
        isPremiumFeaturesAvailable,
        isLoading,
        customerInfo,
        offerings,
        triggerPaywall,
        getCurrentSubscriptionPrice,
        cancelSubscription,
        restorePurchases,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

/**
 * Hook to access subscription context.
 * Must be used within SubscriptionProvider.
 */
export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};
```

---

### Step 3: Wrap App with SubscriptionProvider

**File: `App.tsx`**

```typescript
import { AuthProvider } from "./src/contexts/auth";
import { ConfigProvider } from "./src/contexts/config";
import { SubscriptionProvider } from "./src/contexts/subscription";

function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <SubscriptionProvider autoTriggerOnExpired={false}>
          <YourApp />
        </SubscriptionProvider>
      </ConfigProvider>
    </AuthProvider>
  );
}
```

**Important:** Note the provider hierarchy:
1. `AuthProvider` (provides `user.customerId`)
2. `ConfigProvider` (provides RevenueCat API keys)
3. `SubscriptionProvider` (uses both above)

---

## Key Patterns

### 1. Entitlements-Based Access Control

**DO NOT** check for specific product IDs. Always check entitlements:

```typescript
// ❌ WRONG - Checking product IDs
if (customerInfo.activeSubscriptions.includes('monthly_subscription')) {
  // Grant access
}

// ✅ CORRECT - Checking entitlements
const isPremium = isPremiumFeaturesAvailable();
if (isPremium) {
  // Grant access
}
```

**Why?**
- Entitlements are product-agnostic (works across monthly/annual/lifetime)
- Easier to manage multiple products
- RevenueCat best practice

---

### 2. Multiple Offerings Strategy

Create different offerings for different user scenarios:

**RevenueCat Dashboard Setup:**

- **`default`** - Standard offering for new users
  - Monthly: `$4.99/month`
  - Annual: `$49.99/year` (save 17%)

- **`free_trial_complete`** - Shown when trial expires
  - Emphasize benefits user experienced during trial
  - May include discount for immediate purchase

- **`discounted_offer`** - Promotional offering
  - Special pricing for campaigns
  - Limited-time offers

- **`win_back`** - Re-engagement for churned users
  - Lower pricing to win back canceled subscriptions

**Usage:**

```typescript
// Show default offering
await triggerPaywall();

// Show specific offering
await triggerPaywall('free_trial_complete');
```

---

### 3. Free Trial Handling

RevenueCat automatically detects free trials configured in App Store Connect / Google Play Console.

**Check if user is in trial:**

```typescript
const customerInfo = await Purchases.getCustomerInfo();
const activeEntitlements = customerInfo.entitlements.active;

// Get first active entitlement
const entitlement = Object.values(activeEntitlements)[0];

if (entitlement) {
  const isInTrial = entitlement.periodType === "TRIAL";
  const trialEndDate = new Date(entitlement.expirationDate);
  
  console.log(`Trial ends: ${trialEndDate}`);
}
```

**`isPremiumFeaturesAvailable()` function handles trials automatically:**

```typescript
const isPremiumFeaturesAvailable = (): boolean => {
  if (customerInfo) {
    const activeEntitlements = Object.keys(customerInfo.entitlements.active);
    if (activeEntitlements.length > 0) {
      return true; // Includes both trials and paid subscriptions
    }
  }
  return false;
};
```

---

### 4. Subscription Data Sync

After purchase or restore, sync data across systems:

```typescript
const syncSubscriptionData = async () => {
  try {
    // 1. Refetch user data from backend (if using backend API)
    await refetchUser();

    // 2. Fetch latest RevenueCat customer info
    const updatedCustomerInfo = await Purchases.getCustomerInfo();
    setCustomerInfo(updatedCustomerInfo);

    // 3. Update subscription state
    const subscriptionStatus = getSubscriptionFromCustomerInfo(updatedCustomerInfo);
    setCurrentSubscription(subscriptionStatus);
  } catch (error) {
    console.error("Sync failed:", error);
  }
};
```

---

### 5. Platform-Specific Management URL

RevenueCat provides platform-specific management URLs:

```typescript
const cancelSubscription = async () => {
  const info = await Purchases.getCustomerInfo();
  const managementUrl = info.managementURL;
  
  // iOS: Opens App Store subscription management
  // Android: Opens Google Play subscription management
  await Linking.openURL(managementUrl);
};
```

---

## Usage Examples

### Check Premium Access Before Feature

```typescript
import { useSubscription } from "../contexts/subscription";

function PremiumFeatureButton() {
  const { isPremiumFeaturesAvailable, triggerPaywall, isLoading } = useSubscription();

  const handlePress = () => {
    if (!isPremiumFeaturesAvailable()) {
      // Show paywall
      triggerPaywall();
      return;
    }

    // User has premium access - show feature
    navigateToPremiumFeature();
  };

  return (
    <Button 
      title="Use Premium Feature" 
      onPress={handlePress}
      disabled={isLoading}
    />
  );
}
```

---

### Show Subscription Status

```typescript
function SubscriptionStatusScreen() {
  const { 
    currentSubscription, 
    getCurrentSubscriptionPrice,
    isLoading 
  } = useSubscription();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const price = getCurrentSubscriptionPrice();

  return (
    <View>
      <Text>Status: {currentSubscription.status}</Text>
      {currentSubscription.isPremium && (
        <>
          <Text>Plan: {price}</Text>
          <Text>
            Renews: {currentSubscription.subscriptionExpiresAt?.toLocaleDateString()}
          </Text>
        </>
      )}
      {currentSubscription.trialEndsAt && new Date() < currentSubscription.trialEndsAt && (
        <Text>
          Free trial ends: {currentSubscription.trialEndsAt.toLocaleDateString()}
        </Text>
      )}
    </View>
  );
}
```

---

### Trigger Paywall with Specific Offering

```typescript
function UpgradePrompt() {
  const { triggerPaywall } = useSubscription();

  const showTrialExpiredOffer = async () => {
    const result = await triggerPaywall('free_trial_complete');
    
    if (result === PAYWALL_RESULT.PURCHASED) {
      console.log('User subscribed!');
      // Navigate to premium content
    } else if (result === PAYWALL_RESULT.CANCELLED) {
      console.log('User dismissed paywall');
    }
  };

  return (
    <View>
      <Text>Your free trial has ended</Text>
      <Button title="Continue with Premium" onPress={showTrialExpiredOffer} />
    </View>
  );
}
```

---

### Restore Purchases

```typescript
function RestorePurchasesButton() {
  const { restorePurchases } = useSubscription();
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const restored = await restorePurchases();
      
      if (restored) {
        alert('Subscription restored successfully!');
      } else {
        alert('No active subscriptions found to restore.');
      }
    } catch (error) {
      alert('Failed to restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Button 
      title={isRestoring ? "Restoring..." : "Restore Purchases"} 
      onPress={handleRestore}
      disabled={isRestoring}
    />
  );
}
```

---

### Manage Subscription (Cancel/Modify)

```typescript
function ManageSubscriptionButton() {
  const { cancelSubscription } = useSubscription();

  const handleManage = async () => {
    try {
      // Opens App Store (iOS) or Google Play (Android)
      await cancelSubscription();
    } catch (error) {
      alert('Unable to open subscription management');
    }
  };

  return (
    <Button 
      title="Manage Subscription" 
      onPress={handleManage}
    />
  );
}
```

---

### Conditional Rendering Based on Subscription

```typescript
function AppContent() {
  const { isPremiumFeaturesAvailable, isLoading } = useSubscription();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View>
      <StandardFeatures />
      
      {isPremiumFeaturesAvailable() ? (
        <PremiumFeatures />
      ) : (
        <UpgradeBanner />
      )}
    </View>
  );
}
```

---

### Get Offering Details

```typescript
function PricingScreen() {
  const { offerings } = useSubscription();

  if (!offerings) {
    return <Text>Loading pricing...</Text>;
  }

  return (
    <View>
      {offerings.availablePackages.map((pkg) => (
        <View key={pkg.identifier}>
          <Text>{pkg.product.title}</Text>
          <Text>{pkg.product.description}</Text>
          <Text>{pkg.product.priceString}</Text>
        </View>
      ))}
    </View>
  );
}
```

---

### Auto-Trigger Paywall on Expiration

Enable in provider setup:

```typescript
<SubscriptionProvider autoTriggerOnExpired={true}>
  <App />
</SubscriptionProvider>
```

When enabled, paywall automatically shows when subscription expires.

---

## Best Practices

### 1. Use Customer ID, Not User ID

**Always use `customerId` (your backend customer ID), not Supabase user ID:**

```typescript
// ✅ CORRECT
await Purchases.configure({
  apiKey,
  appUserID: user.customerId, // Your backend customer account ID
});

// ❌ WRONG
await Purchases.configure({
  apiKey,
  appUserID: user.id, // Supabase user ID - DO NOT USE
});
```

**Why?**
- Links RevenueCat purchases to your backend customer accounts
- Enables cross-platform subscription tracking
- Allows subscription data to sync with your backend

---

### 2. Check Entitlements, Not Products

Always use entitlements for access control:

```typescript
// ✅ CORRECT
const isPremium = isPremiumFeaturesAvailable();

// ❌ WRONG
const isPremium = customerInfo.activeSubscriptions.includes('monthly_plan');
```

---

### 3. Handle Edge Cases

**Paywall already presented:**

```typescript
try {
  await triggerPaywall();
} catch (error) {
  if (error.code === "26") {
    console.warn("Paywall already shown");
  }
}
```

**No offerings available:**

```typescript
if (!offerings) {
  console.warn("No offerings available");
  // Refetch offerings or show error
  await fetchOfferings();
}
```

---

### 4. Test Thoroughly

**Test scenarios:**
- ✅ New user starts free trial
- ✅ User purchases subscription during trial
- ✅ Trial expires → paywall shown
- ✅ User cancels subscription → access remains until expiration
- ✅ User restores purchases on new device
- ✅ Subscription auto-renews
- ✅ Payment fails → subscription lapses

**Use RevenueCat sandbox environment for testing.**

---

### 5. Error Logging

Log errors to monitoring service (Sentry, etc.):

```typescript
try {
  await Purchases.configure({ apiKey, appUserID });
} catch (error) {
  console.error("RevenueCat initialization failed:", error);
  // Log to Sentry or similar service
}
```

---

### 6. Backend Webhook Integration (Optional)

If using a backend API, set up RevenueCat webhooks:

1. In RevenueCat dashboard → Integrations → Webhooks
2. Add webhook URL: `https://api.yourdomain.com/webhooks/revenuecat`
3. Handle events: `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`

This keeps your backend subscription status in sync with RevenueCat.

---

### 7. Localization

RevenueCat automatically handles:
- Localized pricing
- Localized product descriptions
- Regional currency

Ensure product metadata is properly localized in App Store Connect / Google Play Console.

---

## Summary

This subscription pattern provides:

✅ **Cross-platform subscription management** - iOS and Android via single codebase  
✅ **Native paywall UI** - RevenueCat's pre-built, conversion-optimized paywalls  
✅ **Entitlements-based access** - Product-agnostic premium feature gating  
✅ **Free trial support** - Automatic detection and handling  
✅ **Multiple offerings** - Segment users with different subscription offers  
✅ **Restore purchases** - Seamless cross-device subscription access  
✅ **Subscription management** - Platform-native cancel/modify flows  
✅ **Context-based state** - Subscription status available app-wide  
✅ **Backend sync** - Optional integration with custom backend API  

**Next Steps:**
- Set up RevenueCat account and configure products
- Create offerings in RevenueCat dashboard
- Configure API keys (via environment or ConfigCat)
- Implement SubscriptionProvider in your app
- Test subscription flows in sandbox environment
- Set up backend webhooks (optional)
- Launch and monitor subscription metrics in RevenueCat dashboard
