# Feature Flags and Remote Configuration with ConfigCat

This document describes the feature flag and remote configuration architecture using ConfigCat for dynamic app configuration without app store releases.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Dependencies](#core-dependencies)
4. [ConfigCat Setup](#configcat-setup)
5. [Implementation Guide](#implementation-guide)
6. [Key Patterns](#key-patterns)
7. [Usage Examples](#usage-examples)
8. [Best Practices](#best-practices)

---

## Overview

### Configuration Flow

1. **ConfigCat initializes** when user authenticates with `customerId`
2. **Config values are fetched** from ConfigCat servers (AutoPoll mode)
3. **Configs update automatically** in background without user action
4. **Default values used** if ConfigCat is unreachable
5. **Type-safe access** to config values throughout app
6. **User-targeted configs** - different values for different users
7. **Environment separation** - development and production configs

### Key Principles

- **User-based targeting** - configure features per user via `customerId`
- **Type safety** - strongly typed config keys and values
- **Default values required** - app works even if ConfigCat is down
- **AutoPoll mode** - automatic background updates
- **Environment separation** - separate dev and production configs
- **No app updates needed** - change configs without app store release
- **Gradual rollouts** - enable features for subset of users
- **Kill switches** - disable features instantly in production

### Use Cases

- **Feature Flags** - toggle features on/off without code deployment
- **Staggered Rollouts** - release features to 10%, 50%, 100% of users
- **Kill Switches** - disable broken features instantly
- **A/B Testing** - show different experiences to different users
- **API Keys** - store third-party API keys (e.g., payment SDKs, analytics services)
- **Configuration Values** - app settings, limits, thresholds

> **Note:** The examples in this document reference specific services (RevenueCat, Stripe) and features. Replace these with your own third-party integrations and app-specific configuration needs.

### Integration with Other Services

ConfigCat integrates with authentication and subscriptions:

- **Authentication** - `customerId` from AuthProvider targets configs → See `authentication-pattern.md`
- **Subscriptions** - Store RevenueCat API keys in ConfigCat → See `subscription-pattern.md`
- **Provider Hierarchy** - ConfigProvider nested inside AuthProvider for customerId access
- **Feature Flags** - Use ConfigCat (not PostHog) for feature flag management → See `posthog-pattern.md`

---

## Architecture

```
┌─────────────────────┐
│  ConfigCat Cloud    │ ← Centralized config management
└──────────┬──────────┘
           │ HTTP polling (AutoPoll mode)
           │
┌──────────▼──────────┐
│  ConfigProvider     │ ← React Context managing configs
└──────────┬──────────┘
           │
           ├──► Fetches configs on user login
           ├──► Auto-refreshes in background
           ├──► Targets user by customerId
           └──► Provides type-safe access
           
┌──────────▼──────────┐
│   Application       │
└──────────┬──────────┘
           │
           └──► useConfigValue(ConfigKeys.FeatureName)
```

**Provider Hierarchy:**

ConfigProvider **must** be nested inside `AuthProvider`:

```tsx
<SentryProvider>
  <PostHogProvider>
    <AuthProvider>       {/* Provides user.customerId */}
      <ConfigProvider>   {/* Uses customerId for targeting */}
        <App />
      </ConfigProvider>
    </AuthProvider>
  </PostHogProvider>
</SentryProvider>
```

---

## Core Dependencies

### Required NPM Packages

```json
{
  "configcat-js": "^9.6.0"
}
```

### Installation

```bash
npm install configcat-js
```

---

## ConfigCat Setup

### 1. Create ConfigCat Account

1. Go to [configcat.com](https://configcat.com/) and create account
2. Create a new product (e.g., "MyApp")
3. ConfigCat automatically creates two configs:
   - **Production** - for production builds
   - **Test** - for development/staging builds

### 2. Get SDK Keys

1. In ConfigCat dashboard → **SDK Key**
2. Copy SDK keys for both environments:
   - **Production** SDK Key
   - **Test** (Development) SDK Key

### 3. Configure Environment Variables

Add to your `.env` file:

```bash
# Development
EXPO_PUBLIC_CONFIG_CAT_KEY=configcat-sdk-1/DEVELOPMENT_KEY_HERE

# Production (set in build configuration)
EXPO_PUBLIC_CONFIG_CAT_KEY=configcat-sdk-1/PRODUCTION_KEY_HERE
```

**Environment-specific keys:**

Create separate `.env` files:

```bash
# .env.development
EXPO_PUBLIC_CONFIG_CAT_KEY=configcat-sdk-1/DEVELOPMENT_KEY

# .env.production
EXPO_PUBLIC_CONFIG_CAT_KEY=configcat-sdk-1/PRODUCTION_KEY
```

### 4. Create Feature Flags in ConfigCat

#### Example: Boolean Feature Flag

1. In ConfigCat dashboard → **Create Feature Flag**
2. Name: `New Dashboard Layout`
3. Key: `newDashboardLayout`
4. Type: **Boolean**
5. Default value: `false`
6. Save

#### Example: String Config (API Key)

1. Create **Setting** (not feature flag)
2. Name: `RevenueCat Apple API Key`
3. Key: `revenecatAppleApiKey`
4. Type: **String**
5. Default value: `""`
6. Save

#### Example: Number Config

1. Create **Setting**
2. Name: `Max Transactions Limit`
3. Key: `maxTransactionsLimit`
4. Type: **Number**
5. Default value: `1000`
6. Save

#### Example: JSON Config

1. Create **Setting**
2. Name: `Pricing Config`
3. Key: `pricingConfig`
4. Type: **String** (store JSON as string)
5. Default value: `{"monthly": 4.99, "annual": 49.99}`
6. Save

### 5. Set Up Targeting Rules

Target specific users by `customerId`:

1. Click on a feature flag
2. Go to **Targeting** tab
3. Add targeting rule:
   - **If User.Identifier** (this is `customerId`)
   - **IS ONE OF**
   - `cust_123, cust_456, cust_789`
   - **Then serve**: `true`
4. Set default for all other users: `false`

**Example: Gradual Rollout (10% of users)**

1. Targeting → **Add percentage-based rule**
2. Serve `true` to **10%** of users
3. Serve `false` to **90%** of users

---

## Implementation Guide

### Step 1: Define Config Keys Enum

**File: `src/contexts/config.tsx`**

```typescript
import React, { createContext, useContext, useEffect, useState } from "react";
import * as configcat from "configcat-js";
import * as Sentry from "@sentry/react-native";
import { useAuth } from "./auth";

/**
 * Enum for all configuration keys.
 * Add new keys here when creating configs in ConfigCat dashboard.
 */
export enum ConfigKeys {
  // API Keys
  RevenueCatGoogleApiKey = "revenecatGoogleApiKey",
  RevenueCatAppleApiKey = "revenecatAppleApiKey",
}

/**
 * Default configuration values.
 * CRITICAL: Every config key MUST have a default value.
 * These are used when ConfigCat is unreachable or during initialization.
 */
const defaultConfigValues = {
  // API Keys - empty strings as defaults
  [ConfigKeys.RevenueCatGoogleApiKey]: "",
  [ConfigKeys.RevenueCatAppleApiKey]: "",
  
  // Feature Flags - false by default (features disabled)
  [ConfigKeys.NewDashboardLayout]: false,
  [ConfigKeys.EnableAdvancedReports]: false,
  [ConfigKeys.ShowBetaFeatures]: false,
  [ConfigKeys.RevenueCatProOverride]: false,
  
  // Numeric Configs - sensible defaults
  [ConfigKeys.MaxTransactionsLimit]: 1000,
  [ConfigKeys.ApiTimeout]: 30000, // 30 seconds
  
  // JSON Configs - empty objects as JSON strings
  [ConfigKeys.PricingConfig]: "{}",
  [ConfigKeys.FeatureLimits]: "{}",
};

/**
 * Type for the configuration values map.
 * Inferred from defaultConfigValues for type safety.
 */
type ConfigValuesMap = typeof defaultConfigValues;

const ConfigContext = createContext<ConfigValuesMap>(defaultConfigValues);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<ConfigValuesMap>(defaultConfigValues);
  const { user } = useAuth();

  useEffect(() => {
    // Only initialize ConfigCat when user is authenticated
    if (!user?.customerId) return;

    // Get SDK key from environment
    const sdkKey = process.env.EXPO_PUBLIC_CONFIG_CAT_KEY || "";
    
    if (!sdkKey) {
      console.warn("ConfigCat SDK key not found. Using default values.");
      return;
    }

    // Initialize ConfigCat client
    const configCatClient = configcat.getClient(
      sdkKey,
      configcat.PollingMode.AutoPoll, // Auto-refresh in background
      {
        // Set default user for targeting
        defaultUser: {
          identifier: user.customerId, // CRITICAL: Use customerId for targeting
          custom: {
            userId: user.id,
            email: user.email,
            // Add other user attributes for targeting
          },
        },
        
        // AutoPoll configuration
        pollIntervalSeconds: 60, // Check for updates every 60 seconds
        
        // Log level
        logger: configcat.createConsoleLogger(
          __DEV__ ? configcat.LogLevel.Info : configcat.LogLevel.Error
        ),
      }
    );

    /**
     * Fetch all configuration values from ConfigCat.
     * Refreshes configs when user logs in.
     */
    async function fetchConfigValues() {
      try {
        const fetchedValues: Partial<ConfigValuesMap> = {};

        // Fetch all config values
        for (const key of Object.values(ConfigKeys)) {
          const value = await configCatClient.getValueAsync(
            key,
            defaultConfigValues[key], // Fallback to default
            {
              identifier: user.customerId,
              custom: {
                userId: user.id,
                email: user.email,
              },
            }
          );

          fetchedValues[key] = value;
        }

        // Update config state
        setConfig((prevConfig) => ({
          ...prevConfig,
          ...(fetchedValues as ConfigValuesMap),
        }));

        console.log("ConfigCat: Configs loaded successfully");
      } catch (error) {
        console.error("ConfigCat: Failed to fetch configs", error);
        
        // Log error to Sentry
        Sentry.captureException(error, {
          contexts: { config: { action: "fetchConfigValues" } },
        });
        
        // App continues with default values
      }
    }

    fetchConfigValues();

    // Cleanup: dispose client when component unmounts or user changes
    return () => {
      configCatClient.dispose();
    };
  }, [user?.customerId]); // Re-fetch when user changes

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

/**
 * Hook to access a specific configuration value.
 * Type-safe access to config values.
 * 
 * @param key - Configuration key from ConfigKeys enum
 * @returns Configuration value with correct type
 * 
 * @example
 * const apiKey = useConfigValue(ConfigKeys.RevenueCatAppleApiKey);
 * const isEnabled = useConfigValue(ConfigKeys.NewDashboardLayout);
 */
export const useConfigValue = <K extends ConfigKeys>(
  key: K
): ConfigValuesMap[K] => {
  const values = useContext(ConfigContext);
  return values[key];
};

/**
 * Hook to access all configuration values at once.
 * Useful when you need multiple config values.
 * 
 * @returns All configuration values
 */
export const useConfig = (): ConfigValuesMap => {
  return useContext(ConfigContext);
};
```

---

### Step 2: Wrap App with ConfigProvider

**File: `App.tsx`**

```typescript
import { SentryProvider } from "./src/contexts/sentry";
import { PostHogProvider } from "./src/contexts/posthog";
import { AuthProvider } from "./src/contexts/auth";
import { ConfigProvider } from "./src/contexts/config";

function App() {
  return (
    <SentryProvider config={SENTRY_CONFIG}>
      <PostHogProvider apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY!}>
        <AuthProvider>
          <ConfigProvider>
            <RestOfYourApp />
          </ConfigProvider>
        </AuthProvider>
      </PostHogProvider>
    </SentryProvider>
  );
}
```

**Critical Hierarchy:**
- `AuthProvider` must wrap `ConfigProvider` (provides `user.customerId`)
- ConfigProvider fetches configs when user logs in

---

### Step 3: Use Config Values Throughout App

**Example: Feature Flag**

```typescript
import { useConfigValue, ConfigKeys } from "../contexts/config";

function DashboardScreen() {
  const showNewLayout = useConfigValue(ConfigKeys.NewDashboardLayout);

  return showNewLayout ? <NewDashboard /> : <OldDashboard />;
}
```

**Example: API Key**

```typescript
import { useConfigValue, ConfigKeys } from "../contexts/config";

function SubscriptionProvider() {
  const googleApiKey = useConfigValue(ConfigKeys.RevenueCatGoogleApiKey);
  const appleApiKey = useConfigValue(ConfigKeys.RevenueCatAppleApiKey);

  const apiKey = Platform.OS === "ios" ? appleApiKey : googleApiKey;

  return <RevenueCat apiKey={apiKey} />;
}
```

**Example: Numeric Config**

```typescript
import { useConfigValue, ConfigKeys } from "../contexts/config";

function TransactionsList() {
  const maxLimit = useConfigValue(ConfigKeys.MaxTransactionsLimit);

  const transactions = data.slice(0, maxLimit);

  return <FlatList data={transactions} />;
}
```

**Example: JSON Config**

```typescript
import { useConfigValue, ConfigKeys } from "../contexts/config";

function PricingScreen() {
  const pricingConfigString = useConfigValue(ConfigKeys.PricingConfig);
  
  // Parse JSON string to object
  const pricing = JSON.parse(pricingConfigString || "{}");

  return (
    <View>
      <Text>Monthly: ${pricing.monthly}</Text>
      <Text>Annual: ${pricing.annual}</Text>
    </View>
  );
}
```

---

## Key Patterns

### 1. User Targeting by CustomerId

All configs are targeted by `customerId`:

```typescript
const configCatClient = configcat.getClient(sdkKey, PollingMode.AutoPoll, {
  defaultUser: {
    identifier: user.customerId, // CRITICAL: Use customerId
    custom: {
      userId: user.id,
      email: user.email,
    },
  },
});
```

**In ConfigCat Dashboard:**
- **User.Identifier** = `customerId`
- **User.Custom.userId** = Supabase user ID
- **User.Custom.email** = User email

---

### 2. Default Values are Required

Every config key **must** have a default value:

```typescript
const defaultConfigValues = {
  [ConfigKeys.NewFeature]: false,        // Default: feature disabled
  [ConfigKeys.ApiKey]: "",               // Default: empty string
  [ConfigKeys.MaxLimit]: 1000,           // Default: 1000
  [ConfigKeys.Config]: "{}",             // Default: empty JSON
};
```

**Why?**
- App works even if ConfigCat is unreachable
- Prevents null/undefined errors
- Provides fallback during initialization

---

### 3. Type-Safe Config Access

Using TypeScript enums and type inference:

```typescript
// ✅ Type-safe access
const apiKey = useConfigValue(ConfigKeys.RevenueCatAppleApiKey);
// Type: string

const isEnabled = useConfigValue(ConfigKeys.NewDashboardLayout);
// Type: boolean

const limit = useConfigValue(ConfigKeys.MaxTransactionsLimit);
// Type: number

// ❌ Compile error - key doesn't exist
const value = useConfigValue("nonExistentKey");
```

---

### 4. AutoPoll Mode

ConfigCat automatically refreshes configs in the background:

```typescript
configcat.getClient(sdkKey, configcat.PollingMode.AutoPoll, {
  pollIntervalSeconds: 60, // Check for updates every 60 seconds
});
```

**Benefits:**
- Configs update without user action
- No manual refresh needed
- Changes propagate within 1 minute

---

### 5. Environment Separation

Use different SDK keys for development and production:

```bash
# Development (.env.development)
EXPO_PUBLIC_CONFIG_CAT_KEY=configcat-sdk-1/DEV_KEY

# Production (.env.production)
EXPO_PUBLIC_CONFIG_CAT_KEY=configcat-sdk-1/PROD_KEY
```

**In ConfigCat:**
- **Test** environment for development
- **Production** environment for production

This prevents dev changes from affecting production.

---

### 6. Gradual Rollouts

Enable features for a percentage of users:

**In ConfigCat Dashboard:**
1. Feature Flag → Targeting
2. Add percentage rule:
   - Serve `true` to **10%** of users
   - Serve `false` to **90%** of users
3. Save

**Increase rollout gradually:**
- Day 1: 10%
- Day 3: 25%
- Day 7: 50%
- Day 14: 100%

---

### 7. Kill Switches

Instantly disable broken features:

**Setup:**
```typescript
// ConfigKeys
EnableBrokenFeature = "enableBrokenFeature"

// Default
[ConfigKeys.EnableBrokenFeature]: false
```

**In App:**
```typescript
const isFeatureEnabled = useConfigValue(ConfigKeys.EnableBrokenFeature);

if (isFeatureEnabled) {
  return <BrokenFeature />;
}

return <FallbackFeature />;
```

**To Disable:**
1. Go to ConfigCat dashboard
2. Set `enableBrokenFeature` to `false`
3. Feature disabled within 60 seconds (AutoPoll interval)
4. No app update needed!

---

## Usage Examples

### Boolean Feature Flag

```typescript
import { useConfigValue, ConfigKeys } from "../contexts/config";

function SettingsScreen() {
  const showBetaFeatures = useConfigValue(ConfigKeys.ShowBetaFeatures);

  return (
    <View>
      <SettingsList />
      
      {showBetaFeatures && (
        <Section title="Beta Features">
          <BetaFeature1 />
          <BetaFeature2 />
        </Section>
      )}
    </View>
  );
}
```

---

### String Config (API Key)

```typescript
import { useConfigValue, ConfigKeys } from "../contexts/config";
import { Platform } from "react-native";

function PaymentProvider() {
  const googleApiKey = useConfigValue(ConfigKeys.RevenueCatGoogleApiKey);
  const appleApiKey = useConfigValue(ConfigKeys.RevenueCatAppleApiKey);

  useEffect(() => {
    const apiKey = Platform.OS === "ios" ? appleApiKey : googleApiKey;
    
    if (apiKey) {
      initializePaymentSDK(apiKey);
    }
  }, [googleApiKey, appleApiKey]);

  return <App />;
}
```

---

### Numeric Config

```typescript
import { useConfigValue, ConfigKeys } from "../contexts/config";

function DataExportScreen() {
  const maxLimit = useConfigValue(ConfigKeys.MaxTransactionsLimit);
  const apiTimeout = useConfigValue(ConfigKeys.ApiTimeout);

  const exportData = async () => {
    const transactions = await fetchTransactions({ limit: maxLimit });
    
    await fetch("/api/export", {
      method: "POST",
      body: JSON.stringify(transactions),
      timeout: apiTimeout,
    });
  };

  return (
    <View>
      <Text>Max Export: {maxLimit} transactions</Text>
      <Button title="Export" onPress={exportData} />
    </View>
  );
}
```

---

### JSON Config

```typescript
import { useConfigValue, ConfigKeys } from "../contexts/config";

type PricingConfig = {
  monthly: number;
  annual: number;
  currency: string;
};

function PricingScreen() {
  const pricingConfigString = useConfigValue(ConfigKeys.PricingConfig);
  
  // Parse JSON with error handling
  const pricing: PricingConfig = useMemo(() => {
    try {
      return JSON.parse(pricingConfigString || "{}");
    } catch (error) {
      console.error("Failed to parse pricing config", error);
      return { monthly: 4.99, annual: 49.99, currency: "USD" };
    }
  }, [pricingConfigString]);

  return (
    <View>
      <Text>Monthly: {pricing.currency}{pricing.monthly}</Text>
      <Text>Annual: {pricing.currency}{pricing.annual}</Text>
      <Text>Save {Math.round((1 - (pricing.annual / 12) / pricing.monthly) * 100)}%</Text>
    </View>
  );
}
```

---

### Feature Limits Config

```typescript
// ConfigCat: featureLimits = {"freeTransactions": 50, "premiumTransactions": 10000}

import { useConfigValue, ConfigKeys } from "../contexts/config";

type FeatureLimits = {
  freeTransactions: number;
  premiumTransactions: number;
};

function TransactionsList() {
  const { subscription } = useSubscription();
  const limitsString = useConfigValue(ConfigKeys.FeatureLimits);
  
  const limits: FeatureLimits = useMemo(() => {
    try {
      return JSON.parse(limitsString || "{}");
    } catch {
      return { freeTransactions: 50, premiumTransactions: 10000 };
    }
  }, [limitsString]);

  const maxTransactions = subscription.isPremium 
    ? limits.premiumTransactions 
    : limits.freeTransactions;

  return (
    <View>
      <Text>Limit: {maxTransactions} transactions</Text>
      <TransactionList limit={maxTransactions} />
    </View>
  );
}
```

---

### Gradual Feature Rollout

```typescript
// ConfigCat: Roll out to 10% → 25% → 50% → 100% over time

function DashboardScreen() {
  const useNewDashboard = useConfigValue(ConfigKeys.NewDashboardLayout);

  return useNewDashboard ? <NewDashboard /> : <OldDashboard />;
}
```

**In ConfigCat:**
- Create percentage-based targeting rule
- Serve `true` to 10% of users initially
- Monitor analytics and error rates
- Gradually increase to 25%, 50%, 100%

---

### A/B Testing

```typescript
// ConfigCat: abTestVariant = "A" or "B" for different users

import { useConfigValue, ConfigKeys } from "../contexts/config";
import { usePostHog } from "../contexts/posthog";

enum ConfigKeys {
  CheckoutFlowVariant = "checkoutFlowVariant",
}

const defaultConfigValues = {
  [ConfigKeys.CheckoutFlowVariant]: "A",
};

function CheckoutScreen() {
  const variant = useConfigValue(ConfigKeys.CheckoutFlowVariant);
  const { capture } = usePostHog();

  useEffect(() => {
    // Track which variant user sees
    capture("ab_test_variant_shown", {
      test: "checkout_flow",
      variant: variant,
    });
  }, [variant]);

  return variant === "A" ? <CheckoutFlowA /> : <CheckoutFlowB />;
}
```

**In ConfigCat:**
- Create string config `checkoutFlowVariant`
- Targeting rule: 50% get "A", 50% get "B"
- Track conversions in PostHog
- Choose winning variant

---

### Kill Switch for Broken Feature

```typescript
import { useConfigValue, ConfigKeys } from "../contexts/config";

enum ConfigKeys {
  EnableAdvancedReports = "enableAdvancedReports",
}

function ReportsScreen() {
  const advancedReportsEnabled = useConfigValue(ConfigKeys.EnableAdvancedReports);

  if (!advancedReportsEnabled) {
    return (
      <View>
        <Text>Advanced reports are temporarily unavailable.</Text>
        <BasicReports />
      </View>
    );
  }

  return <AdvancedReports />;
}
```

**If feature breaks in production:**
1. Open ConfigCat dashboard
2. Set `enableAdvancedReports` to `false`
3. Feature disabled within 60 seconds
4. Fix bug, deploy update
5. Re-enable feature in ConfigCat

---

### Access Multiple Configs

```typescript
import { useConfig } from "../contexts/config";

function SettingsScreen() {
  const config = useConfig();

  return (
    <View>
      <Text>Max Limit: {config.maxTransactionsLimit}</Text>
      <Text>API Timeout: {config.apiTimeout}ms</Text>
      <Text>Beta Features: {config.showBetaFeatures ? "On" : "Off"}</Text>
    </View>
  );
}
```

---

## Best Practices

### 1. Always Provide Default Values

```typescript
// ✅ GOOD - Default value provided
const defaultConfigValues = {
  [ConfigKeys.NewFeature]: false,
};

// ❌ BAD - No default (app crashes if ConfigCat is down)
const defaultConfigValues = {
  [ConfigKeys.NewFeature]: undefined,
};
```

---

### 2. Use CustomerId for Targeting

```typescript
// ✅ GOOD - Targeting by customerId
defaultUser: {
  identifier: user.customerId,
}

// ❌ BAD - Using Supabase user ID
defaultUser: {
  identifier: user.id,
}
```

**Why `customerId`?**
- Links configs to your backend customer accounts
- Consistent with Sentry, PostHog, RevenueCat
- Allows targeting by subscription tier, account status, etc.

---

### 3. Use Descriptive Config Names

```typescript
// ✅ GOOD - Clear, descriptive names
enum ConfigKeys {
  EnableAdvancedReports = "enableAdvancedReports",
  MaxTransactionsLimit = "maxTransactionsLimit",
  RevenueCatAppleApiKey = "revenecatAppleApiKey",
}

// ❌ BAD - Vague names
enum ConfigKeys {
  Feature1 = "f1",
  Limit = "lim",
  Key = "k",
}
```

---

### 4. Separate Environments

```bash
# Use different SDK keys for dev and prod
EXPO_PUBLIC_CONFIG_CAT_KEY=configcat-sdk-1/DEV_KEY     # Development
EXPO_PUBLIC_CONFIG_CAT_KEY=configcat-sdk-1/PROD_KEY    # Production
```

This prevents accidentally changing production configs during development.

---

### 5. Use Feature Flags for Gradual Rollouts

Don't release features to 100% of users immediately:

1. Start at 10%
2. Monitor error rates, analytics
3. Increase to 25%, 50%, 100% gradually
4. Roll back instantly if issues arise

---

### 6. Document Config Keys

Add comments explaining each config:

```typescript
export enum ConfigKeys {
  // Feature flag for new dashboard UI (gradual rollout)
  NewDashboardLayout = "newDashboardLayout",
  
  // RevenueCat API keys (stored securely in ConfigCat)
  RevenueCatAppleApiKey = "revenecatAppleApiKey",
  RevenueCatGoogleApiKey = "revenecatGoogleApiKey",
  
  // Maximum transactions that can be exported (adjustable limit)
  MaxTransactionsLimit = "maxTransactionsLimit",
  
  // Kill switch for beta features (disable instantly if broken)
  ShowBetaFeatures = "showBetaFeatures",
}
```

---

### 7. Parse JSON Configs Safely

```typescript
// ✅ GOOD - Safe parsing with error handling
const config = useMemo(() => {
  try {
    return JSON.parse(configString || "{}");
  } catch (error) {
    console.error("Failed to parse config", error);
    return defaultConfig;
  }
}, [configString]);

// ❌ BAD - No error handling (crashes if JSON is invalid)
const config = JSON.parse(configString);
```

---

### 8. Use Type-Safe Enums

```typescript
// ✅ GOOD - Type-safe enum
const value = useConfigValue(ConfigKeys.NewFeature);

// ❌ BAD - Magic string (no type safety, prone to typos)
const value = useConfigValue("newFeature");
```

---

### 9. Test with Default Values

Ensure app works with default values:

1. Disable network connection
2. Launch app
3. Verify app works with default configs
4. Re-enable network
5. Verify configs update

---

### 10. Monitor ConfigCat Dashboard

Regularly review:
- **Targeting rules** - who gets which configs
- **Audit log** - track config changes
- **Evaluation analytics** - see which configs are used
- **Webhooks** - integrate with Slack/email for config changes

---

## Summary

This ConfigCat pattern provides:

✅ **User-based targeting** - configure features per user via `customerId`  
✅ **Type-safe access** - strongly typed config keys and values  
✅ **Default values** - app works even if ConfigCat is unreachable  
✅ **AutoPoll mode** - automatic background config updates  
✅ **Environment separation** - separate dev and production configs  
✅ **Feature flags** - toggle features without app updates  
✅ **Gradual rollouts** - release to 10%, 50%, 100% of users  
✅ **Kill switches** - disable broken features instantly  
✅ **API key storage** - store third-party keys securely  
✅ **A/B testing** - test different experiences  

**Next Steps:**
- Create ConfigCat account and get SDK keys
- Configure environment variables for dev and prod
- Define config keys in `ConfigKeys` enum with defaults
- Create feature flags in ConfigCat dashboard
- Set up targeting rules by `customerId`
- Use `useConfigValue()` throughout app
- Test gradual rollout with small percentage
- Monitor analytics and error rates
- Gradually increase rollout to 100%
