# Architecture Documentation

This directory contains comprehensive architectural pattern documentation for building production-ready React Native applications. Each pattern is designed to be AI-consumable for replication in future projects.

---

## 📚 Pattern Documentation

### Core Infrastructure

#### [Navigation Pattern](./navigation-pattern.md)
**React Navigation with conditional auth flows**

- Tab-based navigation with nested stack navigators
- Conditional flow patterns (auth-based, permission-based)
- Optional analytics integration (PostHog, Firebase, Amplitude)
- Screen tracking and navigation events
- Tab bar visibility control
- Type-safe route params with TypeScript
- Custom transition animations support

**Integrates with:** Authentication (conditional flow), Analytics (screen tracking), Haptic Feedback, Deep Linking, E2E Testing

---

#### [Authentication Pattern](./authentication-pattern.md)
**Supabase + Backend API dual authentication system**

- Supabase for auth (email/password, OAuth)
- Backend API for customer accounts
- Type-safe API client with automatic token sync
- Lazy customer account creation
- **Key Export:** `customerId` (used across all services)

**Integrates with:** Sentry, PostHog, RevenueCat, ConfigCat, E2E Testing

---

#### [Error Logging - Sentry](./sentry-pattern.md)
**Production error tracking and bug monitoring**

- Automatic exception capture
- User identification via `customerId`
- Development event filtering (no test data in production)
- Breadcrumb trails for debugging
- Structured error context

**Integrates with:** Authentication (customerId), Provider Hierarchy (top-level)

---

#### [Product Analytics - PostHog](./posthog-pattern.md)
**User behavior tracking and product insights**

- Event tracking and screen views
- User identification via `customerId`
- Session replay (configurable)
- Development filtering
- Super properties for global context

**Integrates with:** Authentication (customerId), Sentry (errors vs analytics), Subscriptions (event tracking)

---

#### [Feature Flags - ConfigCat](./configcat-pattern.md)
**Remote configuration and feature flag management**

- Type-safe config keys with TypeScript enums
- User targeting via `customerId`
- AutoPoll mode (60-second refresh)
- Default values (app works offline)
- Kill switches and gradual rollouts

**Integrates with:** Authentication (customerId), Subscriptions (API key storage)

---

#### [Subscriptions - RevenueCat](./subscription-pattern.md)
**Cross-platform subscription and purchase management**

- iOS App Store + Android Google Play
- Entitlements-based access control
- Native paywall UI
- Free trial support
- Restore purchases

**Integrates with:** Authentication (customerId), ConfigCat (API keys), PostHog (purchase events)

---

### UI & Interaction

#### [Haptic Feedback Pattern](./haptic-feedback-pattern.md)
**Platform-optimized tactile feedback system**

- Platform-specific implementation (iOS Haptics API, Android Vibration)
- 9 semantic feedback methods (navigation, button press, success, error, warning, selection, destructive, notification, refresh)
- Simple hook-based API (`useHapticFeedback`, `useVibration`)
- Custom vibration pattern support for Android
- Context provider for app-wide access
- Battery-efficient with strategic usage guidelines
- Real device testing required (simulators don't support haptics)

**Integrates with:** Navigation (tab feedback), Buttons (press feedback), Forms (validation), Toast Notifications, Modals

---

#### [Atomic Design System](./atomic-design-pattern.md)
**Component architecture and design system foundation**

- Centralized theme (colors, fonts, spacing)
- 5 core atoms (Button, Text, TextInput, Card, Icon)
- Required testID on all components
- Type-safe props
- Accessibility compliance

**Integrates with:** E2E Testing (testID requirement), Extended Atoms

---

#### [Extended Atomic Components](./atomic-design-extended-atoms.md)
**Specialized UI components**

- 11 additional atoms (Avatar, Skeleton, Dropdown, Toggle, DatePicker, etc.)
- Organized by category (UI, Input, Media, Layout, Data Display)
- Consistent testID pattern
- Theme-driven styling

**Integrates with:** Atomic Design System (core patterns), E2E Testing

---

#### [E2E Testing - Maestro](./e2e-testing-pattern.md)
**Mobile UI testing with Maestro**

- YAML-based test syntax
- Expo dev mode detection
- Test suite organization (pre-auth, post-auth)
- Conditional flows and reusable components
- CI/CD ready with command-line execution

**Integrates with:** Atomic Design (testID selectors), Authentication (login flows)

---

## 🔄 System Integration Map

```
┌──────────────────────────────────────────────────────────────────┐
│                         App Entry Point                          │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   SentryProvider      │ ← Error tracking (TOP LEVEL)
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ NavigationProvider    │ ← Navigation + screen tracking
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  PostHogProvider      │ ← Analytics
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   AuthProvider        │ ← Authentication
                    │   Exports: customerId │ ← CRITICAL: Used by all services
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   ConfigProvider      │ ← Feature flags (needs customerId)
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ SubscriptionProvider  │ ← Subscriptions (needs customerId + API keys)
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ HapticFeedbackProvider│ ← Haptic feedback (optional)
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │      App Content      │
                    │   (Atomic Components) │
                    │   (RootNavigator)     │
                    └───────────────────────┘
```

---

## 🔑 Critical Dependencies

### The `customerId` Flow

The `customerId` obtained from the backend after authentication is the **central identifier** used across all services:

1. **Authentication** creates/fetches `customerId` from backend
2. **Sentry** identifies users in error reports via `customerId`
3. **PostHog** tracks user behavior with `customerId`
4. **ConfigCat** targets features to users via `customerId`
5. **RevenueCat** links purchases to accounts via `customerId`

**Without `customerId`, none of the integrated services can properly identify users.**

---

## 🧩 Provider Hierarchy (Order Matters!)

```tsx
import { SentryProvider } from "./contexts/sentry";
import { NavigationProvider } from "./contexts/navigation";
import { PostHogProvider } from "./contexts/posthog";
import { AuthProvider } from "./contexts/auth";
import { ConfigProvider } from "./contexts/config";
import { SubscriptionProvider } from "./contexts/subscription";
import { HapticFeedbackProvider } from "./contexts/hapticFeedback";

export default function App() {
  return (
    <SentryProvider>                   {/* 1. HIGHEST - catches all errors */}
      <NavigationProvider>             {/* 2. Navigation + screen tracking */}
        <PostHogProvider>              {/* 3. Analytics */}
          <AuthProvider>               {/* 4. Authentication - provides customerId */}
            <ConfigProvider>           {/* 5. Feature flags - needs customerId */}
              <SubscriptionProvider>   {/* 6. Subscriptions - needs customerId + API keys */}
                <HapticFeedbackProvider> {/* 7. Haptic feedback (optional) */}
                  <AppContent>         {/* 8. Renders RootNavigator */}
                    <RootNavigator 
                      condition1={condition1}
                      condition2={condition2}
                    />
                  </AppContent>
                </HapticFeedbackProvider>
              </SubscriptionProvider>
            </ConfigProvider>
          </AuthProvider>
        </PostHogProvider>
      </NavigationProvider>
    </SentryProvider>
  );
}
```

**Why this order:**
- Sentry must be outermost to catch errors in all providers
- NavigationProvider wraps NavigationContainer and enables analytics screen tracking
- PostHog before Auth to track auth-related events
- Auth before Config/Subscription because they need `customerId`
- Config before Subscription because Subscription needs API keys from Config
- HapticFeedback can be anywhere after Navigation (no dependencies)

---

## 📦 NPM Dependencies

### Core Infrastructure
```json
{
  "@supabase/supabase-js": "^2.49.4",
  "@react-native-async-storage/async-storage": "^2.1.2",
  "react-native-url-polyfill": "^2.0.0",
  "swagger-typescript-api": "^13.1.3"
}
```

### Navigation & Interaction
```json
{
  "@react-navigation/native": "^7.1.7",
  "@react-navigation/stack": "^7.3.0",
  "@react-navigation/native-stack": "^7.3.11",
  "@react-navigation/bottom-tabs": "^7.3.13",
  "react-native-screens": "~4.4.0",
  "react-native-safe-area-context": "~4.14.0",
  "react-native-gesture-handler": "~2.20.2",
  "expo-haptics": "~14.1.4"
}
```

### Monitoring & Analytics
```json
{
  "@sentry/react-native": "~6.14.0",
  "posthog-react-native": "^4.10.8",
  "configcat-js": "^9.6.0"
}
```

### Subscriptions
```json
{
  "react-native-purchases": "^8.11.3",
  "react-native-purchases-ui": "^8.11.3"
}
```

### Testing
```bash
# Maestro (installed globally, not via npm)
curl -Ls "https://get.maestro.mobile.dev" | bash
```

---

## 🚀 Quick Start for New Projects

### 1. Navigation & Haptic Feedback Setup
```bash
# Install React Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler

# Install Haptic Feedback (Expo)
npx expo install expo-haptics

# Follow navigation-pattern.md to:
# - Create NavigationProvider with analytics tracking
# - Create RootNavigator with conditional flows
# - Create navigators based on app structure
# - Add type-safe param lists

# Follow haptic-feedback-pattern.md to:
# - Create HapticFeedbackProvider
# - Implement useHapticFeedback and useVibration hooks
# - Add haptic feedback to key interactions
```

### 2. Authentication Setup
```bash
# Install dependencies
npm install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill

# Follow authentication-pattern.md to:
# - Set up Supabase project
# - Configure backend API
# - Implement AuthProvider
# - Set up OAuth (optional)
```

### 3. Error Tracking & Analytics
```bash
# Install monitoring tools
npm install @sentry/react-native posthog-react-native

# Follow sentry-pattern.md and posthog-pattern.md to:
# - Create Sentry project
# - Create PostHog project
# - Implement SentryProvider and PostHogProvider
# - Identify users with customerId
```

### 4. Feature Flags & Subscriptions
```bash
# Install config & subscriptions
npm install configcat-js react-native-purchases react-native-purchases-ui

# Follow configcat-pattern.md and subscription-pattern.md to:
# - Set up ConfigCat project
# - Set up RevenueCat project (App Store Connect + Google Play Console)
# - Store RevenueCat API keys in ConfigCat
# - Implement providers
```

### 5. Design System & Components
```bash
# Create theme and components following:
# - atomic-design-pattern.md (core atoms + theme)
# - atomic-design-extended-atoms.md (additional components)
# 
# Key requirement: ALL components must have testID props
```

### 6. E2E Testing
```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Follow e2e-testing-pattern.md to:
# - Set up test structure (pre-auth, post-auth)
# - Create config.yaml
# - Write test flows
# - Add npm script: "test": "maestro test e2e/maestro"
```

---

## 🎯 Pattern Usage Guidelines

### When to Use Each Pattern

| Pattern | Use When | Don't Use When |
|---------|----------|----------------|
| **Navigation** | Multi-screen apps with auth flows | Single-screen apps |
| **Authentication** | Every app with user accounts | Public/read-only apps |
| **Sentry** | Production apps needing error tracking | Prototypes/MVPs without budget |
| **PostHog** | Need user behavior insights | Privacy-first apps with no tracking |
| **ConfigCat** | Need remote config/feature flags | All config is hardcoded |
| **RevenueCat** | Selling subscriptions/in-app purchases | Free apps with no monetization |
| **Haptic Feedback** | Enhancing UX with tactile feedback | Games with custom haptic engines |
| **Atomic Design** | Building design system | Single-page apps with minimal UI |
| **E2E Testing** | Critical user flows need testing | Rapid prototyping phase |

---

## 🔧 Development Workflow

### Local Development
```bash
# Start development server
npm start

# Run tests locally
npm test

# Generate API client (if backend updated)
npm run regen-api-client
```

### Testing Strategy
1. **Unit tests** - Test individual functions/components
2. **Integration tests** - Test context providers and hooks
3. **E2E tests (Maestro)** - Test complete user flows
4. **Manual QA** - Test on real devices

### Debugging Tools
- **Sentry** - Production errors and crashes
- **PostHog** - Session replays for UX issues
- **Maestro Studio** - Visual E2E test debugging
- **React DevTools** - Component inspection

---

## 📝 Contributing to Documentation

When adding new patterns:

1. **Create standalone .md file** with complete implementation
2. **Include cross-references** to related patterns
3. **Add integration section** explaining how it connects to other services
4. **Update this README** with new pattern in appropriate section
5. **Update integration map** if it affects provider hierarchy

### Documentation Template
```markdown
# Pattern Name

## Overview
## Architecture
## Core Dependencies
## Setup (Dashboard/API)
## Implementation Guide
## Key Patterns
## Usage Examples
## Best Practices
## Integration with Other Services  ← REQUIRED
```

---

## 🆘 Troubleshooting

### Common Issues

**Provider Hierarchy Errors**
- Ensure SentryProvider is at top level
- Auth must be before Config and Subscription
- Check provider order in App.tsx

**customerId Not Available**
- Verify user is authenticated
- Check AuthProvider is wrapping dependent providers
- Ensure backend returns customerId in profile response

**Development Events in Production**
- Sentry: Check `beforeSend` hook filters `__DEV__`
- PostHog: Verify all methods check `if (__DEV__) return`
- ConfigCat: Use separate SDK keys for dev/prod

**E2E Tests Failing**
- Verify all components have testID props
- Check Expo dev mode detection flow (if using Expo)
- Ensure test accounts exist in backend
- Use `clearState: true` for test isolation

---

## 📖 Additional Resources

### Official Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Sentry React Native](https://docs.sentry.io/platforms/react-native/)
- [PostHog React Native](https://posthog.com/docs/libraries/react-native)
- [ConfigCat Docs](https://configcat.com/docs/)
- [RevenueCat Docs](https://www.revenuecat.com/docs)
- [Maestro Docs](https://maestro.mobile.dev/)

### Pattern Documentation
- Read each pattern .md file for complete implementation details
- All patterns include production-ready code examples
- Copy-paste examples are tested and verified

---

## 📄 License

These patterns are architectural documentation meant for replication across projects. Adapt and modify as needed for your specific use cases.

---

**Last Updated:** 2026-01-17

**Documentation Version:** 1.1

**Patterns Documented:** 10
- ✅ Navigation (React Navigation)
- ✅ Authentication (Supabase + Backend API)
- ✅ Error Logging (Sentry)
- ✅ Analytics (PostHog)
- ✅ Feature Flags (ConfigCat)
- ✅ Subscriptions (RevenueCat)
- ✅ Haptic Feedback (Platform-optimized)
- ✅ Atomic Design System (Core + Extended)
- ✅ E2E Testing (Maestro)
