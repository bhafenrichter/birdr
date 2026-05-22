# Product Analytics with PostHog

This document describes the product analytics architecture using PostHog for tracking user behavior, events, and product insights in React Native applications.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Dependencies](#core-dependencies)
4. [PostHog Setup](#posthog-setup)
5. [Implementation Guide](#implementation-guide)
6. [Key Patterns](#key-patterns)
7. [Usage Examples](#usage-examples)
8. [Best Practices](#best-practices)

---

## Overview

### Analytics Flow

1. **PostHog initializes** at app startup with API key and configuration
2. **User identifies** when they authenticate via `customerId`
3. **Events are captured** throughout the app (clicks, navigation, custom events)
4. **Screens are tracked** automatically or manually
5. **Session replays recorded** (configurable) to replay user sessions
6. **Development events blocked** - no analytics sent in development mode
7. **User resets on logout** - clears identity and starts fresh session

### Key Principles

- **User identification via customerId** - link analytics to customer accounts
- **Development filtering** - prevent dev/test data from polluting production analytics
- **Automatic screen tracking** - capture screen views without manual instrumentation
- **Session replay** - record user sessions for debugging and UX analysis
- **Event-driven tracking** - capture user actions, conversions, and behaviors
- **Super properties** - global properties attached to all events
- **Privacy-first** - configurable session replay and data capture

### Integration with Other Services

PostHog integrates with your authentication and error tracking:

- **Authentication** - `customerId` from AuthProvider identifies users → See `authentication-pattern.md`
- **Error Tracking** - Use Sentry for errors, PostHog for analytics → See `sentry-pattern.md`
- **Feature Flags** - PostHog has feature flags, but we use ConfigCat → See `configcat-pattern.md`
- **Subscriptions** - Track subscription events with PostHog → See `subscription-pattern.md`
- **Provider Hierarchy** - PostHogProvider sits between Sentry and Auth providers

---

## Architecture

```
┌─────────────────────┐
│  PostHogProvider    │ ← Top-level analytics provider
└──────────┬──────────┘
           │
           ├──► PostHog SDK initialization
           ├──► Autocapture configuration
           ├──► Session replay setup
           └──► Development filtering
           
┌──────────▼──────────┐
│   AuthProvider      │ ← Identifies users via customerId
└──────────┬──────────┘
           │
           ├──► identify(customerId) on login
           └──► reset() on logout

┌──────────────────────────────┐
│   Application Code           │
└──────────┬───────────────────┘
           │
           ├──► capture() - Track custom events
           ├──► screen() - Track screen views
           ├──► identify() - Identify users
           ├──► register() - Set super properties
           └──► reset() - Clear user identity
```

**Provider Hierarchy:**

PostHogProvider should be placed high in the hierarchy, but after SentryProvider:

```tsx
<SentryProvider>       {/* Highest - error tracking */}
  <PostHogProvider>    {/* Analytics */}
    <AuthProvider>     {/* User identification */}
      <RestOfApp />
    </AuthProvider>
  </PostHogProvider>
</SentryProvider>
```

---

## Core Dependencies

### Required NPM Packages

```json
{
  "posthog-react-native": "^4.10.8"
}
```

### Installation

```bash
npm install posthog-react-native

# iOS additional steps
cd ios && pod install && cd ..
```

---

## PostHog Setup

### 1. Create PostHog Project

**Option A: PostHog Cloud (Recommended)**

1. Go to [posthog.com](https://posthog.com/) and create account
2. Create a new project
3. Copy your **Project API Key**
4. Copy your **Host URL** (usually `https://us.i.posthog.com` or `https://eu.i.posthog.com`)

**Option B: Self-Hosted**

1. Deploy PostHog to your infrastructure
2. Get your API key from project settings
3. Use your self-hosted URL as host

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# PostHog Configuration
EXPO_PUBLIC_POSTHOG_API_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### 3. Configure Session Replay (Optional)

In PostHog dashboard:
- Go to **Project Settings** → **Session Replay**
- Configure retention period
- Set sampling rate (100% for all sessions, or lower to sample)
- Enable/disable console log capture
- Configure network request capture

---

## Implementation Guide

### Step 1: Create PostHog Context

**File: `src/contexts/posthog.tsx`**

```typescript
import React, { createContext, useContext } from "react";
import {
  PostHogProvider as PostHogReactNativeProvider,
  usePostHog as usePostHogClient,
} from "posthog-react-native";

type PostHogContextType = {
  capture: (eventName: string, properties?: Record<string, any>) => void;
  identify: (distinctId: string, properties?: Record<string, any>) => void;
  screen: (screenName: string, properties?: Record<string, any>) => void;
  register: (properties: Record<string, any>) => void;
  unregister: (property: string) => void;
  reset: () => void;
  alias: (alias: string) => void;
  group: (groupType: string, groupKey: string, groupProperties?: Record<string, any>) => void;
};

const PostHogContext = createContext<PostHogContextType | undefined>(undefined);

interface PostHogProviderProps {
  children: React.ReactNode;
  apiKey: string;
  options?: {
    host?: string;
    enableSessionReplay?: boolean;
    captureScreens?: boolean;
    captureTouches?: boolean;
  };
}

/**
 * Inner component that has access to PostHog client.
 * Wraps PostHog methods with development filtering.
 */
const PostHogContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const posthog = usePostHogClient();

  // Check if we're in development environment
  const isDevelopment = __DEV__ || process.env.NODE_ENV === "development";

  const contextValue: PostHogContextType = {
    /**
     * Capture custom events.
     * Blocked in development to prevent test data pollution.
     * 
     * @param eventName - Name of the event (e.g., 'button_clicked', 'purchase_completed')
     * @param properties - Event properties/metadata
     */
    capture: (eventName: string, properties?: Record<string, any>) => {
      if (!isDevelopment) {
        posthog?.capture(eventName, properties);
      } else {
        console.log(`[PostHog DEV] Event: ${eventName}`, properties);
      }
    },

    /**
     * Identify the current user.
     * CRITICAL: Use customerId, not Supabase user ID.
     * Blocked in development.
     * 
     * @param distinctId - Unique user identifier (customerId)
     * @param properties - User properties (email, name, subscription tier, etc.)
     */
    identify: (distinctId: string, properties?: Record<string, any>) => {
      if (!isDevelopment) {
        posthog?.identify(distinctId, properties);
      } else {
        console.log(`[PostHog DEV] Identify: ${distinctId}`, properties);
      }
    },

    /**
     * Track screen views.
     * Automatically tracked if autocapture is enabled, but can be called manually.
     * Blocked in development.
     * 
     * @param screenName - Name of the screen
     * @param properties - Screen properties
     */
    screen: (screenName: string, properties?: Record<string, any>) => {
      if (!isDevelopment) {
        posthog?.screen(screenName, properties);
      } else {
        console.log(`[PostHog DEV] Screen: ${screenName}`, properties);
      }
    },

    /**
     * Register super properties.
     * These properties are attached to ALL future events until unregistered.
     * Useful for user tier, app version, platform, etc.
     * Blocked in development.
     * 
     * @param properties - Properties to register globally
     */
    register: (properties: Record<string, any>) => {
      if (!isDevelopment) {
        posthog?.register(properties);
      } else {
        console.log(`[PostHog DEV] Register:`, properties);
      }
    },

    /**
     * Unregister a super property.
     * 
     * @param property - Property key to unregister
     */
    unregister: (property: string) => {
      if (!isDevelopment) {
        posthog?.unregister(property);
      } else {
        console.log(`[PostHog DEV] Unregister: ${property}`);
      }
    },

    /**
     * Reset user identity.
     * Called on logout to clear user session and start fresh.
     * Blocked in development.
     */
    reset: () => {
      if (!isDevelopment) {
        posthog?.reset();
      } else {
        console.log(`[PostHog DEV] Reset`);
      }
    },

    /**
     * Create an alias for the current user.
     * Links anonymous ID to identified user ID.
     * 
     * @param alias - Alias to link to current user
     */
    alias: (alias: string) => {
      if (!isDevelopment) {
        posthog?.alias(alias);
      } else {
        console.log(`[PostHog DEV] Alias: ${alias}`);
      }
    },

    /**
     * Associate user with a group (organization, team, etc.).
     * 
     * @param groupType - Type of group (e.g., 'company', 'team')
     * @param groupKey - Unique identifier for the group
     * @param groupProperties - Properties of the group
     */
    group: (groupType: string, groupKey: string, groupProperties?: Record<string, any>) => {
      if (!isDevelopment) {
        posthog?.group(groupType, groupKey, groupProperties);
      } else {
        console.log(`[PostHog DEV] Group: ${groupType} - ${groupKey}`, groupProperties);
      }
    },
  };

  return (
    <PostHogContext.Provider value={contextValue}>
      {children}
    </PostHogContext.Provider>
  );
};

/**
 * PostHog Provider component.
 * Initializes PostHog SDK with configuration and wraps app.
 */
export const PostHogProvider: React.FC<PostHogProviderProps> = ({
  children,
  apiKey,
  options = {},
}) => {
  const {
    host = "https://us.i.posthog.com",
    enableSessionReplay = true,
    captureScreens = true,
    captureTouches = true,
  } = options;

  return (
    <PostHogReactNativeProvider
      apiKey={apiKey}
      autocapture={{
        captureScreens,   // Automatically track screen views
        captureTouches,   // Automatically track touch events
      }}
      options={{
        host,
        
        // Capture app lifecycle events (app opened, backgrounded, closed)
        captureAppLifecycleEvents: true,
        
        // Enable session replay (configurable)
        enableSessionReplay,
        
        // Flush events after 5 events or 30 seconds (whichever comes first)
        flushAt: 5,
        flushInterval: 30,
        
        // Disable error tracking (use Sentry instead)
        // This prevents duplicate error tracking
        errorTracking: undefined,
      }}
    >
      <PostHogContextProvider>{children}</PostHogContextProvider>
    </PostHogReactNativeProvider>
  );
};

/**
 * Hook to access PostHog analytics context.
 * Must be used within PostHogProvider.
 */
export const usePostHog = (): PostHogContextType => {
  const context = useContext(PostHogContext);
  if (context === undefined) {
    throw new Error("usePostHog must be used within a PostHogProvider");
  }
  return context;
};
```

---

### Step 2: Wrap App with PostHogProvider

**File: `App.tsx`**

```typescript
import { PostHogProvider } from "./src/contexts/posthog";
import { SentryProvider } from "./src/contexts/sentry";
import { AuthProvider } from "./src/contexts/auth";

function App() {
  return (
    <SentryProvider config={SENTRY_CONFIG}>
      <PostHogProvider 
        apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY!}
        options={{
          host: process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
          enableSessionReplay: true,      // Enable session replay
          captureScreens: true,           // Auto-track screen views
          captureTouches: true,           // Auto-track touch events
        }}
      >
        <AuthProvider>
          <RestOfYourApp />
        </AuthProvider>
      </PostHogProvider>
    </SentryProvider>
  );
}
```

**Provider Order:**
1. `SentryProvider` - Error tracking (highest priority)
2. `PostHogProvider` - Analytics
3. `AuthProvider` - User authentication (identifies users)

---

### Step 3: Identify Users in Auth Context

**File: `src/contexts/auth.tsx`**

Automatically identify users when they authenticate:

```typescript
import { usePostHog } from "./posthog";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { identify, reset } = usePostHog();
  const [user, setUserState] = useState<AuthUser | null>(null);

  /**
   * Update user state and identify in PostHog.
   */
  const updateUserWithProfile = useCallback(
    (supabaseUser: User, profileData: any) => {
      const authUser = {
        ...supabaseUser,
        customerId: profileData?.locatorId,
        isOnboarded: profileData?.isOnboarded,
      } as AuthUser;

      setUserState(authUser);

      // CRITICAL: Identify user in PostHog using customerId
      if (authUser.customerId) {
        identify(authUser.customerId, {
          email: authUser.email,
          userId: authUser.customerId,
          isOnboarded: authUser.isOnboarded,
          // Add any other user properties (subscription tier, etc.)
        });
      }
    },
    [identify]
  );

  /**
   * Sign out and reset PostHog identity.
   */
  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();

    // CRITICAL: Reset PostHog on logout
    reset();

    if (error) {
      setLoading(false);
      throw error;
    }

    setLoading(false);
  };

  // Rest of auth context...
};
```

**Why use `customerId`?**
- Links analytics to your backend customer accounts
- Consistent user identification across platforms
- Enables cross-device tracking
- Correlates with subscription, support, and CRM data

---

## Key Patterns

### 1. User Identification on Login

Always identify users with `customerId` when they authenticate:

```typescript
const { identify } = usePostHog();

const handleLogin = async () => {
  const user = await login(email, password);
  
  // Identify user in PostHog
  identify(user.customerId, {
    email: user.email,
    userId: user.customerId,
    subscriptionTier: user.subscriptionTier,
    isOnboarded: user.isOnboarded,
    signupDate: user.createdAt,
  });
};
```

---

### 2. Reset on Logout

Always reset PostHog identity when user logs out:

```typescript
const { reset } = usePostHog();

const handleLogout = async () => {
  await logout();
  
  // Clear PostHog identity
  reset();
};
```

This:
- Clears user identity
- Starts a new anonymous session
- Prevents cross-user data leakage

---

### 3. Event Tracking

Track important user actions throughout the app:

```typescript
const { capture } = usePostHog();

// Track button clicks
const handleAction = () => {
  capture("action_completed", {
    action_type: "feature_enabled",
    source: "settings_screen",
    value: "option_a",
  });
  
  performAction();
};

// Track feature usage
const handleProcess = () => {
  capture("data_processed", {
    process_type: "generation",
    item_count: 250,
    status: "success",
  });
  
  processData();
};
```

---

### 4. Super Properties

Register global properties that apply to all events:

```typescript
const { register, unregister } = usePostHog();

// Register super properties on app start
useEffect(() => {
  register({
    appVersion: "1.0.0",
    platform: Platform.OS,
    deviceType: DeviceInfo.getDeviceType(),
  });
}, []);

// Update super properties when user tier changes
useEffect(() => {
  if (subscription.isActive) {
    register({ userTier: "active" });
  } else {
    register({ userTier: "basic" });
  }
}, [subscription.isActive]);

// Unregister when no longer needed
useEffect(() => {
  return () => {
    unregister("temporaryProperty");
  };
}, []);
```

**Super properties are attached to ALL events until unregistered.**

---

### 5. Screen Tracking

Screens are automatically tracked if `captureScreens: true`, but you can manually track:

```typescript
const { screen } = usePostHog();

// Manual screen tracking
useEffect(() => {
  screen("ProfileScreen", {
    userSegment: "returning",
    screenLoadTime: Date.now() - startTime,
  });
}, []);
```

---

### 6. Development Filtering

All PostHog events are **automatically blocked in development**:

```typescript
const isDevelopment = __DEV__ || process.env.NODE_ENV === "development";

capture: (eventName, properties) => {
  if (!isDevelopment) {
    posthog?.capture(eventName, properties);
  } else {
    console.log(`[PostHog DEV] Event: ${eventName}`, properties);
  }
}
```

**Benefits:**
- ✅ Keeps production analytics clean
- ✅ No test/dev data in PostHog
- ✅ Console logs in dev for debugging
- ✅ Automatic filtering without manual checks

---

### 7. Session Replay

Session replay is enabled by default but configurable:

```tsx
<PostHogProvider
  apiKey={apiKey}
  options={{
    enableSessionReplay: true,  // Set to false to disable
  }}
>
  <App />
</PostHogProvider>
```

**Privacy Considerations:**
- Session replay captures screen content and user interactions
- Consider disabling for sensitive data (healthcare, finance)
- Use PostHog's privacy controls to mask sensitive fields
- Inform users about session recording in privacy policy

---

## Usage Examples

### Track Custom Events

```typescript
import { usePostHog } from "../contexts/posthog";

function CheckoutScreen() {
  const { capture } = usePostHog();

  const handlePurchase = async (product: Product) => {
    // Track purchase event
    capture("purchase_completed", {
      productId: product.id,
      productName: product.name,
      price: product.price,
      currency: "USD",
      quantity: 1,
    });

    await completePurchase(product);
  };

  return <Button onPress={handlePurchase} />;
}
```

---

### Track Feature Usage

```typescript
function SpecialFeature() {
  const { capture } = usePostHog();

  useEffect(() => {
    // Track feature view
    capture("feature_viewed", {
      feature_name: "analytics_dashboard",
      timestamp: new Date().toISOString(),
    });
  }, []);

  return <DashboardComponent />;
}
```

---

### Track User Flow

```typescript
function OnboardingFlow() {
  const { capture } = usePostHog();
  const [step, setStep] = useState(1);

  const nextStep = () => {
    // Track progress through onboarding
    capture("onboarding_step_completed", {
      step: step,
      totalSteps: 5,
    });

    setStep(step + 1);
  };

  return (
    <View>
      <OnboardingStep step={step} />
      <Button title="Next" onPress={nextStep} />
    </View>
  );
}
```

---

### Track Navigation

```typescript
import { useNavigation } from "@react-navigation/native";
import { usePostHog } from "../contexts/posthog";

function useNavigationTracking() {
  const navigation = useNavigation();
  const { screen } = usePostHog();

  useEffect(() => {
    const unsubscribe = navigation.addListener("state", () => {
      const currentRoute = navigation.getCurrentRoute();
      
      if (currentRoute) {
        screen(currentRoute.name, {
          params: currentRoute.params,
          timestamp: new Date().toISOString(),
        });
      }
    });

    return unsubscribe;
  }, [navigation, screen]);
}
```

---

### Track Conversion Funnels

```typescript
function SignupFunnel() {
  const { capture } = usePostHog();

  const trackFunnelStep = (step: string, data?: Record<string, any>) => {
    capture("signup_funnel", {
      step,
      ...data,
    });
  };

  return (
    <>
      {/* Step 1 */}
      <EmailInput 
        onSubmit={(email) => {
          trackFunnelStep("email_entered", { email });
          nextStep();
        }}
      />

      {/* Step 2 */}
      <PasswordInput 
        onSubmit={(password) => {
          trackFunnelStep("password_created");
          nextStep();
        }}
      />

      {/* Step 3 */}
      <ConfirmButton 
        onPress={() => {
          trackFunnelStep("account_created");
          createAccount();
        }}
      />
    </>
  );
}
```

---

### Register Super Properties

```typescript
function App() {
  const { register } = usePostHog();
  const { subscription } = useSubscription();

  // Register app-level properties
  useEffect(() => {
    register({
      appVersion: Application.nativeApplicationVersion,
      platform: Platform.OS,
      osVersion: Platform.Version,
    });
  }, []);

  // Update user tier property
  useEffect(() => {
    register({
      userTier: subscription.isActive ? "active" : "inactive",
      accountStatus: subscription.status,
    });
  }, [subscription]);

  return <YourApp />;
}
```

---

### Track Error Recovery

```typescript
function DataSyncComponent() {
  const { capture } = usePostHog();

  const syncData = async () => {
    try {
      await api.syncData();
      
      // Track successful sync
      capture("data_sync_success", {
        recordCount: data.length,
      });
    } catch (error) {
      // Track sync failure
      capture("data_sync_failed", {
        errorType: error.name,
        errorMessage: error.message,
      });
      
      // Retry logic...
    }
  };

  return <Button onPress={syncData} />;
}
```

---

### Track A/B Test Variant

```typescript
function FeatureWithABTest() {
  const { capture, register } = usePostHog();
  const variant = useABTestVariant("new_checkout_flow");

  useEffect(() => {
    // Register variant as super property
    register({ checkout_variant: variant });

    // Track variant assignment
    capture("ab_test_assigned", {
      testName: "new_checkout_flow",
      variant: variant,
    });
  }, [variant]);

  return variant === "A" ? <OldCheckout /> : <NewCheckout />;
}
```

---

### Track User Engagement

```typescript
function DashboardScreen() {
  const { capture } = usePostHog();
  const startTime = useRef(Date.now());

  useEffect(() => {
    // Track screen view duration on unmount
    return () => {
      const duration = Date.now() - startTime.current;
      
      capture("screen_engagement", {
        screen: "DashboardScreen",
        duration: duration,
        durationSeconds: Math.floor(duration / 1000),
      });
    };
  }, []);

  return <Dashboard />;
}
```

---

## Best Practices

### 1. Always Use CustomerId for Identification

```typescript
// ✅ GOOD - Using customerId
identify(user.customerId, {
  email: user.email,
  userId: user.customerId,
});

// ❌ BAD - Using Supabase user ID
identify(user.id, {
  email: user.email,
});
```

---

### 2. Reset on Logout

```typescript
// Always call reset() when user logs out
const handleLogout = async () => {
  await logout();
  reset(); // Clear PostHog identity
};
```

---

### 3. Use Descriptive Event Names

```typescript
// ✅ GOOD - Clear, specific event names
capture("feature_activated", { feature_type: "analytics" });
capture("item_created", { item_type: "resource", count: 50 });
capture("action_completed", { action: "save", entity: "profile" });

// ❌ BAD - Vague event names
capture("click", { button: "submit" });
capture("action", { type: "create" });
capture("event", { name: "generic" });
```

**Convention:** Use `noun_verb` format (e.g., `resource_created`, `data_processed`)

---

### 4. Include Relevant Properties

```typescript
// ✅ GOOD - Rich event properties
capture("purchase_completed", {
  productId: "prod_123",
  productName: "Premium Monthly",
  price: 4.99,
  currency: "USD",
  paymentMethod: "credit_card",
  isFirstPurchase: true,
});

// ❌ BAD - Missing context
capture("purchase_completed");
```

---

### 5. Use Super Properties for Global Context

```typescript
// Register properties that apply to all events
register({
  appVersion: "1.0.0",
  userTier: "active",
  userSegment: "engaged_user",
});

// These properties are automatically added to every event
capture("button_clicked");  
// Sent with: { appVersion: "1.0.0", userTier: "active", ... }
```

---

### 6. Don't Track Sensitive Data

```typescript
// ❌ BAD - Tracking sensitive data
capture("login_attempt", {
  email: user.email,
  password: user.password,  // NEVER track passwords
  ssn: user.ssn,            // NEVER track PII
});

// ✅ GOOD - Sanitized tracking
capture("login_attempt", {
  method: "email",
  success: true,
});
```

---

### 7. Track User Journey Milestones

```typescript
// Track key moments in user journey
capture("user_signed_up");
capture("user_onboarding_completed");
capture("first_action_completed");
capture("feature_unlocked");
capture("user_invited_contact");
```

These events help measure product-market fit and user activation.

---

### 8. Configure Session Replay Appropriately

```typescript
// Enable session replay for most apps
<PostHogProvider 
  options={{ enableSessionReplay: true }}
>

// Disable for sensitive data apps (healthcare, finance)
<PostHogProvider 
  options={{ enableSessionReplay: false }}
>
```

---

### 9. Test Events in Development

Development events are blocked, but you can verify with console logs:

```typescript
// In development, events log to console
capture("test_event", { test: true });
// Console: [PostHog DEV] Event: test_event { test: true }
```

---

### 10. Monitor PostHog Dashboard

Regularly review:
- **Insights** - User behavior and trends
- **Funnels** - Conversion rates through flows
- **Retention** - User retention over time
- **Session Recordings** - Watch user sessions
- **Live Events** - Real-time event stream

---

## Summary

This PostHog analytics pattern provides:

✅ **User identification** via `customerId` for consistent tracking  
✅ **Development filtering** - no test data in production analytics  
✅ **Automatic screen tracking** - capture screen views without manual code  
✅ **Session replay** - configurable recording of user sessions  
✅ **Event tracking** - capture custom events throughout the app  
✅ **Super properties** - global properties on all events  
✅ **Privacy controls** - configurable session replay and data capture  
✅ **Reset on logout** - clear identity for fresh sessions  
✅ **Integration with auth** - automatic user identification on login  

**Next Steps:**
- Create PostHog account and get API key
- Configure environment variables
- Implement PostHogProvider in your app
- Identify users in AuthProvider using `customerId`
- Track key events throughout your app
- Set up funnels and insights in PostHog dashboard
- Configure session replay settings
- Monitor analytics to understand user behavior
