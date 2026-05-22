# Error Logging and Bug Tracking with Sentry

This document describes the error logging, bug tracking, and monitoring architecture using Sentry for React Native applications.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Dependencies](#core-dependencies)
4. [Sentry Setup](#sentry-setup)
5. [Implementation Guide](#implementation-guide)
6. [Key Patterns](#key-patterns)
7. [Usage Examples](#usage-examples)
8. [Best Practices](#best-practices)

---

## Overview

### Error Tracking Flow

1. **Sentry initializes** at app startup with DSN and configuration
2. **Errors and exceptions** are automatically captured throughout the app
3. **User identification** links errors to specific customer accounts
4. **Context and breadcrumbs** provide debugging trail
5. **Custom events and messages** track important app behaviors
6. **Errors are filtered** - development events are blocked from production Sentry

### Key Principles

- **Automatic error capture** - uncaught exceptions sent to Sentry automatically
- **User identification** - link errors to customer accounts via `customerId`
- **Rich context** - attach screen, action, and custom data to errors
- **Breadcrumb trail** - track user actions leading to errors
- **Development filtering** - prevent dev/debug events from polluting production data
- **Centralized logging** - context-based logging available app-wide
- **Structured error context** - standardized format for error metadata

### Integration with Other Services

Sentry integrates with your authentication and provider hierarchy:

- **Authentication** - `customerId` from AuthProvider identifies users → See `authentication-pattern.md`
- **Provider Hierarchy** - SentryProvider must be at top level to catch all errors
- **PostHog** - Use Sentry for errors, PostHog for analytics → See `posthog-pattern.md`
- **Error-only focus** - Let PostHog handle analytics, Sentry handles exceptions exclusively

---

## Architecture

```
┌─────────────────────┐
│  SentryProvider     │ ← Top-level provider, initializes Sentry SDK
└──────────┬──────────┘
           │
           ├──► Sentry.init() with DSN
           ├──► Set app context
           └──► Expose logging functions via context
           
┌──────────▼──────────┐
│   AuthProvider      │ ← Identifies user to Sentry
└──────────┬──────────┘
           │
           └──► setUser({ id: customerId })

┌──────────────────────────────┐
│   Application Code           │
└──────────┬───────────────────┘
           │
           ├──► logError() - Capture exceptions
           ├──► logMessage() - Log informational messages
           ├──► logEvent() - Track custom events + breadcrumbs
           ├──► addBreadcrumb() - Add navigation/action trail
           ├──► setTag() - Add searchable tags
           └──► setContext() - Add structured context data
```

**Provider Hierarchy:**

SentryProvider **must** be at the **top level** to capture all errors:

```tsx
<SentryProvider>      {/* HIGHEST - catches all errors */}
  <AuthProvider>      {/* Identifies users */}
    <RestOfApp />
  </AuthProvider>
</SentryProvider>
```

---

## Core Dependencies

### Required NPM Packages

```json
{
  "@sentry/react-native": "~6.14.0"
}
```

### Installation

```bash
npm install @sentry/react-native

# Run Sentry wizard for automatic setup
npx @sentry/wizard -i reactNative -p ios android

# iOS additional steps
cd ios && pod install && cd ..
```

The wizard will:
- Create `sentry.properties` configuration files
- Add Sentry to your native build configurations
- Configure source maps upload for error stack traces

---

## Sentry Setup

### 1. Create Sentry Project

1. Go to [sentry.io](https://sentry.io/) and create account
2. Create a new project:
   - **Platform**: React Native
   - **Alert frequency**: Configure based on preference
3. Copy your **DSN** (Data Source Name) - looks like:
   ```
   https://examplePublicKey@o0.ingest.sentry.io/0
   ```

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Sentry Configuration
EXPO_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# App versioning (optional, for better error tracking)
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_BUILD_NUMBER=1
```

### 3. Set Up Alerts (Optional)

In Sentry dashboard:
- **Alerts** → Create new alert rules
- Configure for critical errors, new issues, regression detection
- Set up integrations (Slack, email, etc.)

---

## Implementation Guide

### Step 1: Create Sentry Configuration

**File: `src/lib/sentryConfig.ts`**

```typescript
import { Platform } from "react-native";

// Sentry configuration
export const SENTRY_CONFIG = {
  // Sentry DSN from environment variable
  dsn:
    process.env.EXPO_PUBLIC_SENTRY_DSN ||
    "https://your-dsn@sentry.io/project-id",

  // Environment (development, staging, production)
  environment: process.env.NODE_ENV || "development",

  // Debug mode (only in development)
  debug: __DEV__,

  // Auto session tracking (tracks app sessions and crashes)
  enableAutoSessionTracking: true,

  // Out of memory tracking (iOS only)
  enableOutOfMemoryTracking: Platform.OS === "ios",
};

// Common tags that can be set globally
export const COMMON_TAGS = {
  platform: Platform.OS,
  version: Platform.Version.toString(),
  environment: process.env.NODE_ENV || "development",
};

// Common contexts for device information
export const COMMON_CONTEXTS = {
  device: {
    platform: Platform.OS,
    version: Platform.Version,
    constants: Platform.constants,
  },
};
```

---

### Step 2: Create Sentry Context

**File: `src/contexts/sentry.tsx`**

```typescript
import React, { createContext, useContext, useEffect, ReactNode } from "react";
import * as Sentry from "@sentry/react-native";

// Types for Sentry context
interface SentryContextType {
  logEvent: (eventName: string, data?: Record<string, any>) => void;
  logMessage: (
    message: string,
    level?: Sentry.SeverityLevel,
    extra?: Record<string, any>
  ) => void;
  logError: (error: Error, context?: Record<string, any>) => void;
  setUser: (user: Sentry.User) => void;
  addBreadcrumb: (breadcrumb: Sentry.Breadcrumb) => void;
  setTag: (key: string, value: string) => void;
  setContext: (key: string, context: Record<string, any>) => void;
}

// Create the context
const SentryContext = createContext<SentryContextType | undefined>(undefined);

// Sentry configuration interface
interface SentryConfig {
  dsn: string;
  environment?: string;
  debug?: boolean;
  enableAutoSessionTracking?: boolean;
  enableOutOfMemoryTracking?: boolean;
}

// Provider props
interface SentryProviderProps {
  children: ReactNode;
  config: SentryConfig;
}

export const SentryProvider: React.FC<SentryProviderProps> = ({
  children,
  config,
}) => {
  useEffect(() => {
    // Initialize Sentry SDK
    Sentry.init({
      dsn: config.dsn,
      environment: config.environment || "development",
      debug: config.debug || __DEV__,
      enableAutoSessionTracking: config.enableAutoSessionTracking ?? true,
      
      // Filter events before sending to Sentry
      beforeSend: (event) => {
        // CRITICAL: Block development events from being sent to production Sentry
        if (__DEV__ && !config.debug) {
          return null; // Don't send event
        }
        return event;
      },
      
      // Send user info (email, IP) with events
      sendDefaultPii: true,
      
      // Performance monitoring - capture 100% of transactions
      // NOTE: Consider reducing in production to save quota (e.g., 0.2 for 20%)
      tracesSampleRate: 1.0,
      
      // Profiling - capture 100% of transactions
      // NOTE: Consider reducing in production (e.g., 0.1 for 10%)
      profilesSampleRate: 1.0,
      
      // Session replay (optional, commented out by default)
      // replaysOnErrorSampleRate: 1.0,  // 100% of errors
      // replaysSessionSampleRate: 0.1,  // 10% of sessions
      
      integrations: [],
    });

    // Set initial app context
    Sentry.setContext("app", {
      name: "YourAppName",
      version: "1.0.0",
    });
  }, [config]);

  // Context value with all Sentry functions
  const sentryValue: SentryContextType = {
    /**
     * Log custom events with breadcrumb trail.
     * Events are both captured as Sentry messages AND added as breadcrumbs.
     * 
     * @param eventName - Name of the event (e.g., 'user_login', 'feature_used')
     * @param data - Additional event data
     */
    logEvent: (eventName: string, data?: Record<string, any>) => {
      // Add breadcrumb for event trail
      Sentry.addBreadcrumb({
        message: eventName,
        category: "event",
        level: "info",
        data,
      });

      // Also capture as a custom event message
      Sentry.captureMessage(`Event: ${eventName}`, {
        level: "info",
        extra: data,
        tags: {
          eventType: "custom_event",
        },
      });
    },

    /**
     * Log informational messages to Sentry.
     * 
     * @param message - Message to log
     * @param level - Severity level (info, warning, error, etc.)
     * @param extra - Additional context data
     */
    logMessage: (
      message: string,
      level: Sentry.SeverityLevel = "info",
      extra?: Record<string, any>
    ) => {
      Sentry.captureMessage(message, {
        level,
        extra,
      });
    },

    /**
     * Log errors/exceptions to Sentry with context.
     * 
     * @param error - Error object to log
     * @param context - Additional context (screen, action, etc.)
     */
    logError: (error: Error, context?: Record<string, any>) => {
      if (context) {
        Sentry.setContext("error_context", context);
      }
      Sentry.captureException(error);
    },

    /**
     * Identify the current user in Sentry.
     * Links all errors to this user for better debugging.
     * 
     * @param user - User object with id, email, etc.
     */
    setUser: (user: Sentry.User) => {
      Sentry.setUser(user);
    },

    /**
     * Add breadcrumb to track user actions.
     * Breadcrumbs show the trail of events leading to an error.
     * 
     * @param breadcrumb - Breadcrumb object
     */
    addBreadcrumb: (breadcrumb: Sentry.Breadcrumb) => {
      Sentry.addBreadcrumb(breadcrumb);
    },

    /**
     * Set searchable tag on events.
     * Tags are indexed and can be filtered in Sentry UI.
     * 
     * @param key - Tag key
     * @param value - Tag value
     */
    setTag: (key: string, value: string) => {
      Sentry.setTag(key, value);
    },

    /**
     * Set structured context data on events.
     * Context provides additional debugging information.
     * 
     * @param key - Context key
     * @param context - Context object
     */
    setContext: (key: string, context: Record<string, any>) => {
      Sentry.setContext(key, context);
    },
  };

  return (
    <SentryContext.Provider value={sentryValue}>
      {children}
    </SentryContext.Provider>
  );
};

/**
 * Hook to access Sentry context.
 * Must be used within SentryProvider.
 */
export const useSentry = (): SentryContextType => {
  const context = useContext(SentryContext);
  if (context === undefined) {
    throw new Error("useSentry must be used within a SentryProvider");
  }
  return context;
};

/**
 * Utility function to create standardized error context.
 * Use this to maintain consistent error metadata across the app.
 * 
 * @param screen - Screen/component name where error occurred
 * @param action - Action being performed when error occurred
 * @param additionalContext - Any additional context data
 * @returns Formatted error context object
 */
export const createErrorContext = (
  screen: string,
  action: string,
  additionalContext?: Record<string, any>
) => ({
  screen,
  action,
  timestamp: new Date().toISOString(),
  ...additionalContext,
});

// Export Sentry directly for advanced usage
export { Sentry };
```

---

### Step 3: Wrap App with SentryProvider

**File: `App.tsx`**

```typescript
import { SentryProvider } from "./src/contexts/sentry";
import { SENTRY_CONFIG } from "./src/lib/sentryConfig";
import { AuthProvider } from "./src/contexts/auth";

function App() {
  return (
    <SentryProvider config={SENTRY_CONFIG}>
      <AuthProvider>
        <RestOfYourApp />
      </AuthProvider>
    </SentryProvider>
  );
}
```

**Critical:** `SentryProvider` must be at the **top level** of your provider tree to capture all errors.

---

### Step 4: Identify Users in Auth Context

**File: `src/contexts/auth.tsx`**

Automatically identify users when they authenticate:

```typescript
import { useSentry } from "./sentry";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { setUser } = useSentry();
  const [user, setUserState] = useState<AuthUser | null>(null);

  // Update user in state and identify in Sentry
  const updateUserWithProfile = useCallback(
    (supabaseUser: User, profileData: any) => {
      const authUser = {
        ...supabaseUser,
        customerId: profileData?.locatorId,
        isOnboarded: profileData?.isOnboarded,
      } as AuthUser;

      setUserState(authUser);

      // CRITICAL: Identify user in Sentry using customerId
      if (authUser.customerId) {
        setUser({
          id: authUser.customerId,      // Use customerId, NOT Supabase user.id
          email: authUser.email,
          username: authUser.email,
        });
      }
    },
    [setUser]
  );

  // Rest of auth context...
};
```

**Why use `customerId`?**
- Links Sentry errors to your backend customer accounts
- Allows correlation with subscription, analytics, and support data
- Provides consistent user identification across platforms

---

## Key Patterns

### 1. Standardized Error Context

Always use `createErrorContext` for consistent error metadata:

```typescript
import { useSentry, createErrorContext } from "../contexts/sentry";

function MyComponent() {
  const { logError } = useSentry();

  const handleAction = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      const errorContext = createErrorContext(
        "MyComponent",           // Screen/component name
        "handleAction",          // Action being performed
        {
          userId: user.id,       // Additional context
          attemptCount: 3,
        }
      );

      logError(error as Error, errorContext);
    }
  };
}
```

**Context structure:**
```typescript
{
  screen: "MyComponent",
  action: "handleAction",
  timestamp: "2026-01-17T19:00:00.000Z",
  userId: "user_123",
  attemptCount: 3
}
```

---

### 2. Event Logging with Breadcrumbs

Use `logEvent` to track important user actions:

```typescript
const { logEvent } = useSentry();

// Log feature usage
logEvent("feature_used", {
  feature: "data_export",
  format: "json",
  recordCount: 150,
});

// Log user actions
logEvent("button_clicked", {
  buttonId: "submit_form",
  screen: "FormScreen",
});
```

This creates both:
- **Breadcrumb** - appears in error timeline
- **Event message** - searchable in Sentry

---

### 3. Breadcrumb Trail for Navigation

Track navigation to understand user flow before errors:

```typescript
const { addBreadcrumb } = useSentry();

// Add navigation breadcrumb
addBreadcrumb({
  message: "Navigated from Dashboard to Settings",
  category: "navigation",
  level: "info",
  data: {
    from: "Dashboard",
    to: "Settings",
    timestamp: new Date().toISOString(),
  },
});
```

---

### 4. Tagging for Organization

Use tags for filtering and searching in Sentry UI:

```typescript
const { setTag } = useSentry();

// Tag by feature area
setTag("feature", "authentication");
setTag("user_type", "premium");
setTag("subscription_status", "active");

// Tag by platform
setTag("platform", Platform.OS);
```

Tags are **indexed** and appear as filters in Sentry dashboard.

---

### 5. Contextual Data for Debugging

Add structured context for better debugging:

```typescript
const { setContext } = useSentry();

// Add entity context
setContext("entity", {
  id: entity.id,
  type: entity.type,
  status: entity.status,
  lastModified: entity.updatedAt,
});

// Add API request context
setContext("api_request", {
  endpoint: "/api/resources/update",
  method: "POST",
  statusCode: 500,
  responseTime: 2500,
});
```

Context appears in the Sentry event detail view.

---

### 6. Development Event Filtering

The `beforeSend` hook prevents dev events from reaching production Sentry:

```typescript
Sentry.init({
  beforeSend: (event) => {
    // Block development events unless debug is explicitly enabled
    if (__DEV__ && !config.debug) {
      return null; // Don't send event
    }
    return event;
  },
});
```

**Result:**
- ✅ Production errors always sent
- ❌ Development errors blocked (keeps Sentry clean)
- ✅ Can enable dev logging by setting `debug: true` in config

---

## Usage Examples

### Basic Error Logging

```typescript
import { useSentry } from "../contexts/sentry";

function ProfileScreen() {
  const { logError } = useSentry();

  const updateProfile = async (data: ProfileData) => {
    try {
      await api.updateProfile(data);
    } catch (error) {
      logError(error as Error, {
        screen: "ProfileScreen",
        action: "updateProfile",
        profileData: data,
      });
      
      // Still show user-friendly error message
      alert("Failed to update profile");
    }
  };

  return <Button onPress={updateProfile} />;
}
```

---

### Logging Messages

```typescript
const { logMessage } = useSentry();

// Info message
logMessage("User completed onboarding", "info", {
  userId: user.id,
  completedAt: new Date().toISOString(),
});

// Warning message
logMessage("API response slow", "warning", {
  endpoint: "/api/transactions",
  responseTime: 5000,
});

// Error message
logMessage("Payment processing failed", "error", {
  transactionId: "txn_123",
  reason: "Insufficient funds",
});
```

---

### Tracking Events

```typescript
const { logEvent } = useSentry();

// Track feature usage
const handleProcessData = () => {
  logEvent("data_processed", {
    format: "json",
    recordCount: 250,
    timeRange: "last_30_days",
  });
  
  processData();
};

// Track user actions
const handleActivateFeature = () => {
  logEvent("feature_activated", {
    feature_type: "analytics",
    tier: "premium",
  });
  
  activateFeature();
};
```

---

### Navigation Tracking

```typescript
import { useNavigation } from "@react-navigation/native";
import { useSentry } from "../contexts/sentry";

function useNavigationTracking() {
  const navigation = useNavigation();
  const { addBreadcrumb } = useSentry();

  useEffect(() => {
    const unsubscribe = navigation.addListener("state", (e) => {
      const routeName = navigation.getCurrentRoute()?.name;
      
      addBreadcrumb({
        message: `Navigated to ${routeName}`,
        category: "navigation",
        level: "info",
        data: {
          route: routeName,
          timestamp: new Date().toISOString(),
        },
      });
    });

    return unsubscribe;
  }, [navigation, addBreadcrumb]);
}
```

---

### User Identification

```typescript
const { setUser } = useSentry();

// Identify user on login
const handleLogin = async (email: string, password: string) => {
  const user = await login(email, password);
  
  // Identify user in Sentry
  setUser({
    id: user.customerId,        // CRITICAL: Use customerId
    email: user.email,
    username: user.email,
  });
};

// Clear user on logout
const handleLogout = async () => {
  await logout();
  
  // Clear user from Sentry
  setUser(null);
};
```

---

### Adding Tags

```typescript
const { setTag } = useSentry();

// Tag by user tier
useEffect(() => {
  if (userAccount.isActive) {
    setTag("account_tier", "active");
  } else {
    setTag("account_tier", "inactive");
  }
}, [userAccount.isActive]);

// Tag by feature flags
if (featureFlags.earlyAccessFeatures) {
  setTag("early_access_user", "true");
}
```

---

### Setting Context

```typescript
const { setContext } = useSentry();

// Set device context
useEffect(() => {
  setContext("device", {
    model: DeviceInfo.getModel(),
    os: Platform.OS,
    osVersion: Platform.Version,
    appVersion: "1.0.0",
  });
}, []);

// Set entity context on error
const processData = async (dataId: string) => {
  try {
    const result = await api.processEntity(dataId);
    
    setContext("operation", {
      entityId: result.id,
      operationType: result.type,
      status: result.status,
    });
    
    // Process data...
  } catch (error) {
    // Error will include operation context
    logError(error as Error);
  }
};
```

---

### Comprehensive Error Handling Example

```typescript
import { useSentry, createErrorContext } from "../contexts/sentry";

function DataProcessingScreen() {
  const { logError, addBreadcrumb, setContext } = useSentry();

  const processFile = async (file: File) => {
    // Add breadcrumb for user action
    addBreadcrumb({
      message: "User started file processing",
      category: "user_action",
      level: "info",
      data: { fileName: file.name, fileSize: file.size },
    });

    try {
      // Set context for debugging
      setContext("file_processing", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      const result = await api.processFile(file);

      // Log success
      addBreadcrumb({
        message: "File processing completed",
        category: "api",
        level: "info",
        data: { processedCount: result.count },
      });

      return result;
    } catch (error) {
      // Create standardized error context
      const errorContext = createErrorContext(
        "DataProcessingScreen",
        "processFile",
        {
          fileName: file.name,
          fileSize: file.size,
          errorType: (error as Error).name,
        }
      );

      // Log error to Sentry
      logError(error as Error, errorContext);

      // Re-throw to let UI handle
      throw error;
    }
  };

  return <FileUpload onUpload={processFile} />;
}
```

---

## Best Practices

### 1. Always Use Standardized Error Context

```typescript
// ✅ GOOD - Standardized context
const errorContext = createErrorContext("MyScreen", "myAction", {
  additionalData: "value",
});
logError(error, errorContext);

// ❌ BAD - Inconsistent context
logError(error, { screen: "my screen", someData: 123 });
```

---

### 2. Identify Users with Customer ID

```typescript
// ✅ GOOD - Using customerId
setUser({
  id: user.customerId,  // Backend customer account ID
  email: user.email,
});

// ❌ BAD - Using Supabase user ID
setUser({
  id: user.id,  // Supabase auth ID - not useful for debugging
  email: user.email,
});
```

---

### 3. Add Breadcrumbs for Important Actions

```typescript
// Add breadcrumbs for user navigation, API calls, state changes
addBreadcrumb({
  message: "User viewed premium feature",
  category: "user_action",
  level: "info",
  data: { feature: "advanced_reports" },
});
```

Breadcrumbs appear in error timeline, showing what led to the error.

---

### 4. Use Tags for Filtering

```typescript
// Tag errors by area, so you can filter in Sentry UI
setTag("feature", "payment");
setTag("screen", "CheckoutScreen");
setTag("user_tier", subscription.isPremium ? "premium" : "free");
```

---

### 5. Don't Log Sensitive Data

```typescript
// ❌ BAD - Logging password
logError(error, {
  password: user.password,  // NEVER log passwords
  creditCard: payment.ccNumber,  // NEVER log payment info
});

// ✅ GOOD - Sanitized context
logError(error, {
  email: user.email,
  userId: user.customerId,
  paymentMethod: "credit_card", // Type only, not card number
});
```

---

### 6. Adjust Sample Rates for Production

In `sentryConfig.ts`, reduce sample rates to save Sentry quota:

```typescript
export const SENTRY_CONFIG = {
  // Development: 100%
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,  // 20% in production
  profilesSampleRate: __DEV__ ? 1.0 : 0.1, // 10% in production
};
```

---

### 7. Test Error Logging in Development

Force an error to test Sentry integration:

```typescript
// Add a test button in dev mode
if (__DEV__) {
  <Button
    title="Test Sentry"
    onPress={() => {
      throw new Error("Test error for Sentry");
    }}
  />
}
```

Check Sentry dashboard to verify error appears with correct context.

---

### 8. Use Log Levels Appropriately

```typescript
// info - informational events
logMessage("User logged in", "info");

// warning - potential issues
logMessage("API response slow", "warning");

// error - errors that need attention
logMessage("Payment failed", "error");

// fatal - critical errors
logMessage("Database connection lost", "fatal");
```

---

### 9. Provider Hierarchy

Always place SentryProvider at the **top level**:

```typescript
// ✅ CORRECT
<SentryProvider>
  <AuthProvider>
    <App />
  </AuthProvider>
</SentryProvider>

// ❌ WRONG - Won't catch errors in AuthProvider
<AuthProvider>
  <SentryProvider>
    <App />
  </SentryProvider>
</AuthProvider>
```

---

### 10. Monitor Sentry Dashboard Regularly

- Check for **new issues** weekly
- Set up **alerts** for critical errors
- Review **performance** metrics
- Monitor **quota usage** to avoid overages

---

## Summary

This Sentry pattern provides:

✅ **Automatic error capture** - uncaught exceptions sent to Sentry  
✅ **User identification** - link errors to customer accounts via `customerId`  
✅ **Rich context** - screen, action, and custom data attached to errors  
✅ **Breadcrumb trail** - track user actions leading to errors  
✅ **Development filtering** - prevent dev events from production Sentry  
✅ **Centralized logging** - consistent error handling app-wide  
✅ **Structured context** - standardized error metadata format  
✅ **Performance monitoring** - track slow operations and bottlenecks  
✅ **Event tracking** - log custom events with breadcrumbs  

**Next Steps:**
- Create Sentry account and get DSN
- Configure environment variables with DSN
- Implement SentryProvider at top level
- Identify users in AuthProvider
- Use `useSentry` hook for logging throughout app
- Test error logging in development
- Monitor Sentry dashboard for production errors
- Adjust sample rates based on quota usage
