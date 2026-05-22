# Navigation Pattern with React Navigation

## Overview

This document describes the navigation architecture for React Native applications using React Navigation. The pattern implements a conditional navigation flow based on authentication and onboarding state, with tab-based navigation for the main app experience.

**Common Navigation Flows:**
1. **Unauthenticated** → Auth Stack (Login, Sign Up, Password Reset)
2. **Authenticated + Incomplete Profile** → Onboarding Stack (Multi-step setup)
3. **Authenticated + Complete** → Tab/Drawer Navigator (Main App)

**Alternative Flows:**
- **Public App** → Tab Navigator (no auth required)
- **Admin App** → Drawer Navigator (side menu)
- **Content App** → Tab Navigator with Material Top Tabs for categories

### Key Principles

- **Conditional navigation** based on app state (auth, onboarding, permissions, etc.)
- **Nested navigators** for complex flows (Tab → Stack → Screens)
- **Automatic screen tracking** via analytics integration (optional)
- **Dynamic UI control** (hide tab bars, customize headers per screen)
- **User feedback** on navigation interactions (haptic, animations)
- **Theme-driven styling** for consistent UI
- **Type-safe navigation** with TypeScript param lists
- **Deep link support** for URL routing to specific screens

### Integration with Other Services

Navigation typically integrates with:

- **Authentication** - Conditional rendering based on auth state
- **Analytics** - Automatic screen tracking (PostHog, Firebase, Amplitude, etc.)
- **User Feedback** - Haptic feedback, sound effects on interactions
- **Deep Linking** - URL routing to screens (expo-linking, react-native-branch, etc.)
- **E2E Testing** - testIDs on navigation elements for automated testing

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     NavigationProvider                      │
│        (NavigationContainer + Optional Analytics)           │
└────────────────────────┬───────────────────────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │       RootNavigator             │
        │  (Conditional Flow Renderer)    │
        └────────────────┬────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
     CONDITION A    CONDITION B     CONDITION C
         │               │               │
    ┌────▼─────┐   ┌────▼────────┐ ┌───▼──────────┐
    │ FlowA    │   │   FlowB     │ │   MainNav    │
    │ Stack    │   │   Stack     │ │ (Tab/Drawer) │
    │          │   │             │ │              │
    │ - Screen1│   │ - Step1     │ │ - Tab 1      │
    │ - Screen2│   │ - Step2     │ │ - Tab 2      │
    │ - Screen3│   │ - Step3     │ │ - Tab 3      │
    │          │   │ - Complete  │ │              │
    └──────────┘   └─────────────┘ └──────┬───────┘
                                          │
                        ┌─────────────────┼─────────────┐
                        │                 │             │
                   ┌────▼────┐      ┌────▼────┐  ┌────▼────┐
                   │ Stack A │      │ Stack B │  │ Stack C │
                   │         │      │         │  │         │
                   │-Screen1 │      │-Screen1 │  │-Screen1 │
                   │-Screen2 │      │-Screen2 │  │-Screen2 │
                   │-Detail  │      │-Detail  │  │-Detail  │
                   └─────────┘      └─────────┘  └─────────┘
```

**Example: Auth-Based Flow**
```
Condition A = Not Authenticated → Auth Stack (Login, Sign Up)
Condition B = Authenticated + Incomplete Setup → Onboarding Stack
Condition C = Authenticated + Complete → Tab Navigator (Main App)
```

**Example: Permission-Based Flow**
```
Condition A = No Permissions → Permissions Request Stack
Condition B = Has Permissions → Tab Navigator (Main App)
```

**Provider Hierarchy:**

Navigation integrates high in the provider hierarchy:

```tsx
<GestureHandlerRootView>
  <ErrorTrackingProvider>        {/* Error tracking (Sentry, Bugsnag, etc.) */}
    <NavigationProvider>         {/* Navigation Container + Screen tracking */}
      <AnalyticsProvider>        {/* Analytics context (optional) */}
        <SafeAreaProvider>
          <AppStateProvider>     {/* Provides app state (auth, user, etc.) */}
            <AppContent>         {/* Renders RootNavigator */}
              <RootNavigator 
                condition1={value1}
                condition2={value2}
              />
            </AppContent>
          </AppStateProvider>
        </SafeAreaProvider>
      </AnalyticsProvider>
    </NavigationProvider>
  </ErrorTrackingProvider>
</GestureHandlerRootView>
```

**Minimal Setup (No Analytics):**

```tsx
<GestureHandlerRootView>
  <NavigationContainer>
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator isSignedIn={isSignedIn} />
      </AuthProvider>
    </SafeAreaProvider>
  </NavigationContainer>
</GestureHandlerRootView>
```

---

## Core Dependencies

### Required NPM Packages

```json
{
  "@react-navigation/native": "^7.1.7",
  "@react-navigation/stack": "^7.3.0",
  "@react-navigation/native-stack": "^7.3.11",
  "@react-navigation/bottom-tabs": "^7.3.13",
  "react-native-screens": "~4.4.0",
  "react-native-safe-area-context": "~4.14.0",
  "react-native-gesture-handler": "~2.20.2"
}
```

### Installation

```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/native-stack @react-navigation/bottom-tabs

# Required peer dependencies
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler

# For Expo projects
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler
```

### Additional Setup

Add to `babel.config.js`:

```javascript
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'react-native-reanimated/plugin', // Must be last
  ],
};
```

Wrap app with `GestureHandlerRootView` in `App.tsx`:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Your app */}
    </GestureHandlerRootView>
  );
}
```

---

## Implementation Guide

### Step 1: Create NavigationProvider with Optional Analytics Tracking

**Option A: With Analytics Integration (PostHog, Firebase, Amplitude, etc.)**

Create `src/contexts/navigation.tsx`:

```typescript
import React, { createContext, useContext, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
// Import your analytics service
// import { usePostHog } from "posthog-react-native";
// import analytics from '@react-native-firebase/analytics';
// import { useAnalytics } from "./analytics"; // Your custom analytics

type NavigationContextType = {
  // Navigation context methods can be added here if needed
  navigationRef?: any; // Expose ref for programmatic navigation
};

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

interface NavigationProviderProps {
  children: React.ReactNode;
  enableAnalytics?: boolean; // Optional analytics flag
}

const NavigationContextProvider: React.FC<{ children: React.ReactNode; navigationRef?: any }> = ({
  children,
  navigationRef,
}) => {
  const contextValue: NavigationContextType = {
    navigationRef,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  enableAnalytics = true,
}) => {
  // OPTIONAL: Import your analytics hook
  // const analytics = usePostHog(); // PostHog
  // const analytics = useAnalytics(); // Firebase/Amplitude/Custom
  
  const routeNameRef = useRef<string | undefined>(undefined);
  const navigationRef = useRef<any>(null);

  // Recursive function to get active route name from nested navigators
  const getActiveRouteName = (state: any): string => {
    if (!state || !state.routes || state.routes.length === 0) {
      return "Unknown";
    }

    const route = state.routes[state.index];

    // Dive into nested navigators
    if (route.state) {
      return getActiveRouteName(route.state);
    }

    return route.name;
  };

  // Optional analytics tracking function
  const trackScreen = (screenName: string) => {
    if (!enableAnalytics || __DEV__) return;

    // CHOOSE YOUR ANALYTICS SERVICE:
    
    // PostHog:
    // analytics?.screen(screenName);
    
    // Firebase:
    // analytics().logScreenView({ screen_name: screenName });
    
    // Amplitude:
    // analytics.logEvent('screen_view', { screen_name: screenName });
    
    // Custom:
    // analytics.trackScreen(screenName);
    
    console.log(`[Analytics] Screen: ${screenName}`);
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        // Track initial screen when navigation is ready
        const state = navigationRef.current?.getRootState();
        if (state) {
          const initialRouteName = getActiveRouteName(state);
          routeNameRef.current = initialRouteName;
          trackScreen(initialRouteName);
        }
      }}
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const state = navigationRef.current?.getRootState();

        if (state) {
          const currentRouteName = getActiveRouteName(state);

          // Only track if screen changed
          if (previousRouteName !== currentRouteName) {
            trackScreen(currentRouteName);
          }

          // Save current route for next comparison
          routeNameRef.current = currentRouteName;
        }
      }}
    >
      <NavigationContextProvider navigationRef={navigationRef}>
        {children}
      </NavigationContextProvider>
    </NavigationContainer>
  );
};

export const useNavigationContext = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigationContext must be used within a NavigationProvider");
  }
  return context;
};
```

**Option B: Minimal Setup (No Analytics)**

```typescript
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
}) => {
  return <NavigationContainer>{children}</NavigationContainer>;
};
```

**Key Features:**
- ✅ Wraps `NavigationContainer` for navigation functionality
- ✅ Optional analytics tracking (any service: PostHog, Firebase, Amplitude, etc.)
- ✅ Automatically tracks screen changes in nested navigators
- ✅ Filters out development events
- ✅ Provides navigation context with ref access

---

### Step 2: Create Root Navigator with Conditional Flow

**Pattern:** Use props to determine which navigator to render based on app state.

Create `src/navigation/RootNavigator.tsx`:

```typescript
import AuthStack from "./stacks/AuthStack";
import OnboardingStack from "./stacks/OnboardingStack";
import MainNavigator from "./stacks/MainNavigator";

type RootNavigatorProps = {
  // Define your conditional logic props
  condition1: boolean; // e.g., isAuthenticated
  condition2?: boolean; // e.g., hasCompletedOnboarding
};

function RootNavigator({ condition1, condition2 }: RootNavigatorProps) {
  // Conditional rendering based on app state
  if (!condition1) {
    return <AuthStack />;
  }

  if (condition1 && !condition2) {
    return <OnboardingStack />;
  }

  return <MainNavigator />;
}

export default RootNavigator;
```

**Example Implementations:**

**Auth-Based Flow:**
```typescript
type RootNavigatorProps = {
  isSignedIn: boolean;
  isOnboarded: boolean;
};

function RootNavigator({ isSignedIn, isOnboarded }: RootNavigatorProps) {
  if (!isSignedIn) {
    return <AuthStack />; // Login, Sign Up
  }

  if (!isOnboarded) {
    return <OnboardingStack />; // Multi-step setup
  }

  return <MainTabNavigator />; // Main app
}
```

**Permission-Based Flow:**
```typescript
type RootNavigatorProps = {
  hasPermissions: boolean;
  isLoading: boolean;
};

function RootNavigator({ hasPermissions, isLoading }: RootNavigatorProps) {
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!hasPermissions) {
    return <PermissionsRequestStack />;
  }

  return <MainAppNavigator />;
}
```

---

### Step 3: Create Stack Navigators for Each Flow

**Pattern:** Use Native Stack for simple flows, Stack for custom animations.

**Option A: Native Stack Navigator (Recommended for Simple Flows)**

Create `src/navigation/stacks/AuthStack.tsx`:

```typescript
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../../screens/auth/Welcome";
import LoginScreen from "../../screens/auth/Login";
import SignUpScreen from "../../screens/auth/SignUp";
import ForgotPasswordScreen from "../../screens/auth/ForgotPassword";

// Type-safe param list
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: { email?: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

function AuthStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false, // Hide headers for fullscreen auth flow
        animation: 'slide_from_right', // Native animations
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ 
          presentation: 'modal', // Present as modal
        }}
      />
    </Stack.Navigator>
  );
}

export default AuthStack;
```

**Why Native Stack:**
- ✅ Better performance (uses native navigation APIs)
- ✅ Native animations and gestures
- ✅ Smaller bundle size
- ✅ Ideal for simple linear flows

**Option B: Stack Navigator (For Custom Animations)**

```typescript
import { createStackNavigator } from "@react-navigation/stack";
import { TransitionPresets } from "@react-navigation/stack";

const Stack = createStackNavigator<AuthStackParamList>();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS, // Custom transitions
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      {/* Screens */}
    </Stack.Navigator>
  );
}
```

**Why Stack (not Native Stack):**
- ✅ Custom animations and transitions
- ✅ Shared element transitions
- ✅ More control over screen lifecycle

---

### Step 4: Create Multi-Step Flow Stacks (Onboarding, Checkout, etc.)

**Pattern:** Use Stack Navigator for multi-step flows that pass data between screens.

Create `src/navigation/stacks/OnboardingStack.tsx`:

```typescript
import { createStackNavigator } from "@react-navigation/stack";
import Step1Screen from "../../screens/onboarding/Step1";
import Step2Screen from "../../screens/onboarding/Step2";
import Step3Screen from "../../screens/onboarding/Step3";
import CompleteScreen from "../../screens/onboarding/Complete";

// Define navigation params for type safety
export type OnboardingStackParamList = {
  Step1: { formData?: OnboardingFormData };
  Step2: { formData: OnboardingFormData };
  Step3: { formData: OnboardingFormData };
  Complete: { formData: OnboardingFormData };
};

// Define your multi-step form data structure
export type OnboardingFormData = {
  // Customize based on your app's needs
  name?: string;
  email?: string;
  preferences?: Record<string, any>;
  // Add more fields as needed
};

const Stack = createStackNavigator<OnboardingStackParamList>();

function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide headers for fullscreen multi-step flow
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="Step1" component={Step1Screen} />
      <Stack.Screen name="Step2" component={Step2Screen} />
      <Stack.Screen name="Step3" component={Step3Screen} />
      <Stack.Screen 
        name="Complete" 
        component={CompleteScreen}
        options={{
          gestureEnabled: false, // Prevent going back from completion
        }}
      />
    </Stack.Navigator>
  );
}

export default OnboardingStack;
```

**Other Multi-Step Flow Examples:**

**Checkout Flow:**
```typescript
export type CheckoutStackParamList = {
  Cart: undefined;
  Shipping: { items: CartItem[] };
  Payment: { items: CartItem[]; shipping: ShippingInfo };
  Confirmation: { orderId: string };
};
```

**Wizard Flow:**
```typescript
export type WizardStackParamList = {
  Introduction: undefined;
  Configuration: { wizardType: string };
  Review: { config: ConfigData };
  Finish: { success: boolean };
};
```

**Why Stack (not Native Stack):**
- ✅ Custom animations for step transitions
- ✅ Better control over screen lifecycle
- ✅ Easier to implement progress indicators
- ✅ Better for multi-step flows with state passing

---

### Step 5: Create Main App Navigator (Tab or Drawer)

**Pattern:** Use Tab Navigator for 3-5 main sections, Drawer for more sections or hierarchical navigation.

**Option A: Bottom Tab Navigator (Most Common)**

Create `src/navigation/TabNavigator.tsx`:

```typescript
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Platform } from "react-native";
// Import your stack navigators for each tab
import Tab1Stack from "./stacks/Tab1Stack";
import Tab2Stack from "./stacks/Tab2Stack";
import Tab3Stack from "./stacks/Tab3Stack";
// Import your icon component
import Icon from "../components/Icon"; // or use @expo/vector-icons, react-native-vector-icons, etc.

const Tab = createBottomTabNavigator();

function TabNavigator() {
  // OPTIONAL: Get haptic/vibration feedback hook
  // const haptic = useHapticFeedback();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Headers handled by nested stacks
        tabBarIcon: ({ focused, color, size }) => {
          // Map route names to icons (customize for your app)
          let iconName = "circle";

          if (route.name === "Tab1") {
            iconName = "home"; // Replace with your icon
          } else if (route.name === "Tab2") {
            iconName = "search";
          } else if (route.name === "Tab3") {
            iconName = "user";
          }

          return (
            <Icon
              name={iconName}
              size={focused ? size + 2 : size} // Larger when focused
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "#000000", // Active tab color (customize)
        tabBarInactiveTintColor: "#888888", // Inactive tab color
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderColor: "#EEEEEE",
          paddingTop: 8,
          height: Platform.OS === "ios" ? 88 : 60, // Account for safe area
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen
        name="Tab1"
        component={Tab1Stack}
        options={({ route }) => {
          // Get focused route name from nested navigator
          const routeName = getFocusedRouteNameFromRoute(route) ?? "Tab1";
          
          // OPTIONAL: Hide tab bar for specific screens
          const screensWithoutTabBar = ["FullscreenModal", "VideoPlayer"];

          if (screensWithoutTabBar.includes(routeName)) {
            return {
              tabBarStyle: { display: "none" },
            };
          }

          return {};
        }}
        listeners={{
          tabPress: () => {
            // OPTIONAL: Add haptic feedback
            // haptic.impact();
          },
        }}
      />
      
      <Tab.Screen
        name="Tab2"
        component={Tab2Stack}
        options={{
          tabBarLabel: "Search", // Custom label
          tabBarBadge: 3, // Show badge (e.g., notification count)
        }}
      />
      
      <Tab.Screen
        name="Tab3"
        component={Tab3Stack}
      />
    </Tab.Navigator>
  );
}

export default TabNavigator;
```

**Option B: Drawer Navigator (For More Sections)**

```typescript
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawerContent from "../components/CustomDrawerContent";

const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: 280,
        },
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardStack}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen name="Reports" component={ReportsStack} />
      <Drawer.Screen name="Settings" component={SettingsStack} />
    </Drawer.Navigator>
  );
}
```

**Key Features:**
- ✅ Dynamic icon selection based on route
- ✅ Focused tab has visual distinction
- ✅ Conditional tab bar visibility (hide for fullscreen screens)
- ✅ Optional haptic feedback on tab press
- ✅ Platform-specific styling
- ✅ Badge support for notifications

---

### Step 6: Create Nested Stack Navigators for Each Tab

**Pattern:** Each tab contains its own stack navigator for independent navigation history.

Create `src/navigation/stacks/Tab1Stack.tsx`:

```typescript
import { createStackNavigator } from "@react-navigation/stack";
import ListScreen from "../../screens/tab1/List";
import DetailScreen from "../../screens/tab1/Detail";
import EditScreen from "../../screens/tab1/Edit";

// Type-safe param list
export type Tab1StackParamList = {
  List: undefined;
  Detail: { itemId: string; title?: string };
  Edit: { itemId: string };
};

const Stack = createStackNavigator<Tab1StackParamList>();

function Tab1Stack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FFFFFF",
          shadowColor: "transparent", // Remove shadow on iOS
          elevation: 0, // Remove shadow on Android
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "600",
        },
        headerBackTitleVisible: false, // Hide back title on iOS
        headerTintColor: "#000000", // Back button color
      }}
    >
      <Stack.Screen
        name="List"
        component={ListScreen}
        options={{ 
          title: "Items", // Custom header title
          headerShown: true,
        }}
      />
      
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={({ route }) => ({
          title: route.params?.title || "Details", // Dynamic title from params
        })}
      />
      
      <Stack.Screen
        name="Edit"
        component={EditScreen}
        options={{
          title: "Edit Item",
          presentation: "modal", // Present as modal
        }}
      />
    </Stack.Navigator>
  );
}

export default Tab1Stack;
```

**Custom Header Back Button:**

```typescript
import { View } from "react-native";
import Icon from "../../components/Icon";

<Stack.Navigator
  screenOptions={{
    headerBackImage: () => (
      <View style={{ marginLeft: 8 }}>
        <Icon name="arrow-left" size={24} color="#000000" />
      </View>
    ),
  }}
>
```

**Hide Header on Specific Screen:**

```typescript
<Stack.Screen
  name="Fullscreen"
  component={FullscreenScreen}
  options={{ 
    headerShown: false, // No header for this screen
  }}
/>
```

**Why Nested Stacks:**
- ✅ Each tab has independent navigation history
- ✅ Back button works within each tab separately
- ✅ Shared screen options across tab's screens
- ✅ Type-safe navigation with param lists
- ✅ Better UX - users don't lose context when switching tabs

---

### Step 7: Integrate Navigation in App Entry Point

**Pattern:** Wrap your app in NavigationProvider and pass conditional props to RootNavigator.

Update `App.tsx` (or `App.js`):

```typescript
import { useState, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigator from "./src/navigation/RootNavigator";
import { NavigationProvider } from "./src/contexts/navigation";
// Import your state providers (auth, user, etc.)
import { AppStateProvider, useAppState } from "./src/contexts/appState";

// Inner component that accesses app state
function AppContent() {
  const { isAuthenticated, isLoading, user } = useAppState();

  if (isLoading) {
    return <LoadingScreen />; // Show loading while checking state
  }

  return (
    <RootNavigator
      condition1={isAuthenticated}
      condition2={user?.hasCompletedSetup}
      // Add more conditions as needed
    />
  );
}

// Main App with provider hierarchy
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationProvider enableAnalytics={true}>
          <AppStateProvider>
            <AppContent />
          </AppStateProvider>
        </NavigationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

**Minimal Setup (No Providers):**

```typescript
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import TabNavigator from "./src/navigation/TabNavigator";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

**With Error Tracking:**

```typescript
import { ErrorBoundary } from "./src/components/ErrorBoundary";
// or import * as Sentry from "@sentry/react-native";

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationProvider>
            <AppStateProvider>
              <AppContent />
            </AppStateProvider>
          </NavigationProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
```

---

## Key Patterns

### 1. Type-Safe Navigation

Define param lists for each navigator:

```typescript
// src/stacks/home/index.tsx
export type HomeStackParamList = {
  Dashboard: undefined;
  Detail: { itemId: string; title?: string };
  Settings: undefined;
};

const HomeStack = createStackNavigator<HomeStackParamList>();
```

Use in screens:

```typescript
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Tab1StackParamList } from "../navigation/stacks/Tab1Stack";

type DetailScreenRouteProp = RouteProp<Tab1StackParamList, "Detail">;
type DetailScreenNavigationProp = StackNavigationProp<Tab1StackParamList, "Detail">;

type Props = {
  route: DetailScreenRouteProp;
  navigation: DetailScreenNavigationProp;
};

function DetailScreen({ route, navigation }: Props) {
  const { itemId, title } = route.params;
  
  return (
    <View>
      <Text>{title}</Text>
      <Text>Item ID: {itemId}</Text>
      <Button
        title="Go Back"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}
```

---

### 2. Conditional Tab Bar Visibility

Hide tab bar for fullscreen screens:

```typescript
<Tab.Screen
  name="Home"
  component={HomeStackScreen}
  options={({ route }) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? "Home";
    const screensWithoutTabBar = ["FullscreenModal", "PaymentFlow"];

    if (screensWithoutTabBar.includes(routeName)) {
      return {
        tabBarStyle: { display: "none" },
      };
    }

    return {
      tabBarStyle: {
        backgroundColor: Colors.foreground,
        display: "flex",
      },
    };
  }}
/>
```

---

### 3. Custom Header Back Button

Theme-consistent back button with icon:

```typescript
<Stack.Navigator
  screenOptions={{
    headerBackButtonDisplayMode: "minimal",
    headerBackImage: () => (
      <View style={{ marginHorizontal: 10 }}>
        <Icon name="arrow-left" size={24} color="#007AFF" />
      </View>
    ),
  }}
>
  {/* Screens */}
</Stack.Navigator>
```

---

### 4. Dynamic Screen Titles

Set title based on route params:

```typescript
<Stack.Screen
  name="Detail"
  component={DetailScreen}
  options={({ route }) => ({
    title: route.params?.title || "Details",
  })}
/>

<Stack.Screen
  name="UserProfile"
  component={UserProfileScreen}
  options={({ route }) => ({
    title: route.params?.userName || "Profile",
  })}
/>
```

---

### 5. Navigation with Params

Navigate with type-safe params:

```typescript
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Tab1StackParamList } from "../navigation/stacks/Tab1Stack";

type NavigationProp = StackNavigationProp<Tab1StackParamList>;

function SomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const goToDetail = () => {
    navigation.navigate("Detail", {
      itemId: "123",
      title: "Item Details",
    });
  };

  return <Button title="View Details" onPress={goToDetail} />;
}
```

---

### 6. Haptic Feedback on Navigation

Add tactile feedback to tab presses:

```typescript
<Tab.Screen
  name="Tab1"
  component={Tab1Stack}
  listeners={{
    tabPress: () => {
      // Option 1: Using expo-haptics
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Option 2: Using react-native Vibration
      // Vibration.vibrate(10);
      
      // Option 3: Using custom haptic context
      // haptic.navigationFeedback();
      
      console.log('Tab pressed');
    },
  }}
/>
```

---

### 7. PostHog Screen Tracking

Automatic screen tracking in NavigationProvider:

```typescript
onStateChange={async () => {
  const currentRouteName = getActiveRouteName(state);

  if (previousRouteName !== currentRouteName && !__DEV__) {
    // CHOOSE YOUR ANALYTICS SERVICE:
    
    // PostHog:
    // analytics?.screen(currentRouteName);
    
    // Firebase:
    // analytics().logScreenView({ screen_name: currentRouteName });
    
    // Amplitude:
    // analytics.logEvent('screen_view', { screen_name: currentRouteName });
    
    console.log(`[Analytics] Screen: ${currentRouteName}`);
  }

  routeNameRef.current = currentRouteName;
}}
```

---

## Usage Examples

### Example 1: Simple Screen Navigation

```typescript
import { useNavigation } from "@react-navigation/native";
import { Button } from "../components/atoms/button";

function DashboardScreen() {
  const navigation = useNavigation();

  return (
    <View>
      <Text>Dashboard</Text>
      <Button
        title="Go to Settings"
        onPress={() => navigation.navigate("Settings")}
      />
    </View>
  );
}
```

---

### Example 2: Navigation with Params

```typescript
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Tab1StackParamList } from "../navigation/stacks/Tab1Stack";

type NavigationProp = StackNavigationProp<Tab1StackParamList>;

function ItemListScreen() {
  const navigation = useNavigation<NavigationProp>();

  const viewItem = (id: string, title: string) => {
    navigation.navigate("Detail", {
      itemId: id,
      title: title,
    });
  };

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => viewItem(item.id, item.title)}>
          <Text>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
  );
}
```

---

### Example 3: Accessing Route Params

```typescript
import { RouteProp, useRoute } from "@react-navigation/native";
import { Tab1StackParamList } from "../navigation/stacks/Tab1Stack";

type DetailRouteProp = RouteProp<Tab1StackParamList, "Detail">;

function DetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const { itemId, title } = route.params;

  return (
    <View>
      <Text>Item ID: {itemId}</Text>
      <Text>Title: {title}</Text>
    </View>
  );
}
```

---

### Example 4: Programmatic Navigation After State Change

```typescript
import { useNavigation } from "@react-navigation/native";
import { useAppState } from "../contexts/appState"; // Your state management

function LoginScreen() {
  const navigation = useNavigation();
  const { signIn } = useAppState();

  const handleLogin = async (email: string, password: string) => {
    const result = await signIn(email, password);
    
    if (result.success) {
      // Navigation happens automatically via RootNavigator
      // based on app state change
      // No manual navigation needed!
    }
  };

  return (
    <View>
      {/* Login form */}
    </View>
  );
}
```

**Note:** With conditional navigation in RootNavigator, app state changes automatically trigger navigation updates. No manual navigation needed after login/logout!

---

### Example 5: Reset Navigation Stack

```typescript
import { CommonActions } from "@react-navigation/native";

function SetupCompleteScreen() {
  const navigation = useNavigation();

  const finishSetup = () => {
    // Reset navigation stack and go to main screen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "MainScreen" }],
      })
    );
  };

  return (
    <View>
      <Text>Setup Complete!</Text>
      <Button title="Get Started" onPress={finishSetup} />
    </View>
  );
}
```

---

### Example 6: Go Back with Fallback

```typescript
function DetailScreen() {
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback if no history (e.g., deep link)
      navigation.navigate("MainScreen");
    }
  };

  return (
    <View>
      <Button title="Back" onPress={handleBack} />
    </View>
  );
}
```

---

## Best Practices

### 1. Navigator Selection Guide

| Navigator Type | Use Case | Example |
|----------------|----------|---------|
| **Native Stack** | Simple linear flows, best performance | Auth, Login |
| **Stack** | Complex transitions, custom animations | Onboarding, Checkout |
| **Bottom Tabs** | Main app navigation with 3-5 sections | Home, Profile, Settings |
| **Drawer** | Secondary navigation, app-wide menu | Side menu |
| **Material Top Tabs** | Content categories, swipeable tabs | News sections |

---

### 2. Nested Navigator Depth

**✅ Good: 2-3 levels**
```
TabNavigator → StackNavigator → Screens
```

**❌ Bad: 4+ levels**
```
TabNavigator → StackNavigator → StackNavigator → StackNavigator
```

**Why:** Deep nesting causes:
- Performance issues
- Complex state management
- Confusing back button behavior
- Hard to debug navigation

---

### 3. Screen Options Priority

```typescript
// Global options (apply to all screens)
<Stack.Navigator screenOptions={{ headerShown: false }}>
  
  // Per-screen options (override global)
  <Stack.Screen
    name="Detail"
    component={DetailScreen}
    options={{ headerShown: true, title: "Details" }}
  />
  
  // Dynamic options (override both)
  <Stack.Screen
    name="Profile"
    component={ProfileScreen}
    options={({ route }) => ({
      title: route.params?.userName || "Profile",
    })}
  />
</Stack.Navigator>
```

---

### 4. Type Safety is Critical

**Always define param lists:**

```typescript
// ✅ Good: Type-safe params
export type HomeStackParamList = {
  Dashboard: undefined;
  Detail: { itemId: string };
};

const Stack = createStackNavigator<HomeStackParamList>();

// ❌ Bad: No type safety
const Stack = createStackNavigator();
```

**Benefits:**
- Autocomplete for screen names
- Type checking for params
- Refactoring safety
- Better DX

---

### 5. testIDs for E2E Testing

Add testIDs to navigation elements:

```typescript
<Tab.Screen
  name="Home"
  component={HomeStackScreen}
  options={{
    tabBarButton: (props) => (
      <TouchableOpacity {...props} testID="home-tab" />
    ),
  }}
/>
```

See `e2e-testing-pattern.md` for navigation E2E testing strategies.

---

### 6. Accessibility

Ensure navigation is accessible:

```typescript
<Tab.Navigator
  screenOptions={{
    tabBarAccessibilityLabel: "Main Navigation",
    tabBarIcon: ({ focused, color, size }) => (
      <Icon
        name="home"
        size={size}
        color={color}
        accessibilityLabel="Home"
        accessibilityRole="button"
      />
    ),
  }}
>
```

---

### 7. Performance Optimization

**Lazy load screens:**

```typescript
import React, { lazy, Suspense } from "react";

const DetailScreen = lazy(() => import("./detail"));

<Stack.Screen name="Detail">
  {(props) => (
    <Suspense fallback={<LoadingScreen />}>
      <DetailScreen {...props} />
    </Suspense>
  )}
</Stack.Screen>
```

**Unmount inactive screens in tabs:**

```typescript
<Tab.Navigator
  screenOptions={{
    unmountOnBlur: true, // Unmount screen when navigating away
  }}
>
```

---

### 8. Deep Linking Configuration

Configure deep links in `app.json`:

```json
{
  "expo": {
    "scheme": "yourapp",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "yourapp.com",
              "pathPrefix": "/app"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "associatedDomains": ["applinks:yourapp.com"]
    }
  }
}
```

Link to screens:

```typescript
const config = {
  screens: {
    Home: {
      screens: {
        Dashboard: "dashboard",
        Detail: "item/:itemId",
      },
    },
    Profile: "profile",
  },
};

const linking = {
  prefixes: ["yourapp://", "https://yourapp.com"],
  config,
};

<NavigationContainer linking={linking}>
  {/* Navigators */}
</NavigationContainer>
```

Now `https://yourapp.com/item/123` opens Detail screen with `itemId: "123"`.

---

## Troubleshooting

### Navigation Not Working After Auth State Change

**Problem:** After login, app doesn't navigate to main screens

**Solution:** Ensure RootNavigator receives updated props:

```typescript
function AppContent() {
  const { session, user, loading } = useAuth();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsSignedIn(!!session && !!user); // Update state
    }
  }, [session, user, loading]); // Re-run when auth changes

  return (
    <RootNavigator
      isSignedIn={isSignedIn}
      isOnboarded={user?.isOnboarded ?? false}
    />
  );
}
```

---

### Tab Bar Showing on Fullscreen Screens

**Problem:** Tab bar visible on modal/fullscreen screens

**Solution:** Use `getFocusedRouteNameFromRoute` to hide tab bar:

```typescript
<Tab.Screen
  name="Home"
  component={HomeStackScreen}
  options={({ route }) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? "Home";
    const hideTabBarScreens = ["Modal", "Fullscreen"];

    if (hideTabBarScreens.includes(routeName)) {
      return { tabBarStyle: { display: "none" } };
    }

    return {};
  }}
/>
```

---

### Back Button Not Working

**Problem:** Hardware/software back button doesn't work as expected

**Solution:** Check navigation hierarchy and use `canGoBack()`:

```typescript
const handleBack = () => {
  if (navigation.canGoBack()) {
    navigation.goBack();
  } else {
    // Handle case where there's no history
    navigation.navigate("Dashboard");
  }
};
```

---

### TypeScript Errors on Navigation

**Problem:** Type errors when navigating between screens

**Solution:** Define global navigation types:

Create `src/types/navigation.ts`:

```typescript
import { HomeStackParamList } from "../stacks/home";
import { ProfileStackParamList } from "../stacks/profile";

export type RootStackParamList = {
  Home: HomeStackParamList;
  Profile: ProfileStackParamList;
  // Add other navigators
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

Now navigation is type-safe everywhere:

```typescript
const navigation = useNavigation(); // Fully typed!
navigation.navigate("Home", { screen: "Detail", params: { itemId: "123" } });
```

---

### PostHog Not Tracking Screens

**Problem:** Screen views not appearing in PostHog

**Solution:**
1. Check PostHog provider is above NavigationProvider
2. Verify development filtering is not blocking events
3. Ensure `getActiveRouteName` handles nested navigators

```typescript
const getActiveRouteName = (state: any): string => {
  if (!state || !state.routes || state.routes.length === 0) {
    return "Unknown";
  }

  const route = state.routes[state.index];

  // CRITICAL: Handle nested navigators
  if (route.state) {
    return getActiveRouteName(route.state);
  }

  return route.name;
};
```

---

## Summary

React Navigation provides a flexible, performant navigation solution for React Native apps with:

✅ **Conditional Navigation** - Auth state determines which flow to show
✅ **Nested Navigators** - Tab → Stack hierarchy for complex apps
✅ **Type Safety** - Full TypeScript support with param lists
✅ **PostHog Integration** - Automatic screen tracking
✅ **Haptic Feedback** - Tactile responses to navigation
✅ **Theme Integration** - Consistent styling across navigators
✅ **Deep Linking** - URL routing to specific screens
✅ **Platform Optimized** - Native animations and gestures
✅ **Accessibility** - Screen reader and keyboard navigation support
✅ **E2E Testable** - testIDs for Maestro/Detox testing

**Navigation Structure:**
```
Conditional Flow Navigator (Auth/Onboarding/Main)
   ↓ (Based on App State)
Auth Stack (Not Signed In)
   ↓ (Sign In)
Onboarding Stack (Incomplete Setup)
   ↓ (Complete Setup)
Tab/Drawer Navigator (Main App)
   ├── Tab 1 Stack
   ├── Tab 2 Stack
   └── Tab 3 Stack
```

**Provider Hierarchy:**
```tsx
<ErrorTrackingProvider>      {/* Optional: Error tracking */}
  <NavigationProvider>       {/* Wraps NavigationContainer + Analytics */}
    <AppStateProvider>       {/* Provides app state for conditional flow */}
      <RootNavigator 
        condition1={state1}
        condition2={state2}
      />
    </AppStateProvider>
  </NavigationProvider>
</ErrorTrackingProvider>
```

This navigation pattern ensures a smooth, type-safe, and well-tracked navigation experience across your entire React Native application.
