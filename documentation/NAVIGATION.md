# Navigation Structure

This document describes the navigation setup for List My Closet app.

## Overview

The app uses **React Navigation** with a conditional navigation flow based on authentication state:

1. **Unauthenticated** → Auth Stack (Welcome, Login, Sign Up)
2. **Authenticated** → Main Tab Navigator (Create, My Listings, Settings)

## Navigation Flow

```
App.tsx
  └─ GestureHandlerRootView
      └─ SafeAreaProvider
          └─ NavigationProvider (Navigation Container)
              └─ AuthProvider (Auth State Management)
                  └─ RootNavigator (Conditional Rendering)
                      ├─ AuthStack (if not authenticated)
                      │   ├─ Welcome Screen
                      │   ├─ Login Screen
                      │   └─ Sign Up Screen
                      │
                      └─ MainTabNavigator (if authenticated)
                          ├─ HomeTab → HomeStack
                          │   └─ Home Screen (Create Listing)
                          │
                          ├─ ListingsTab → ListingsStack
                          │   └─ Listings Screen (My Listings)
                          │
                          └─ SettingsTab → SettingsStack
                              └─ Settings Screen
```

## File Structure

```
src/
├── contexts/
│   ├── auth.tsx               # Auth state management (placeholder)
│   ├── navigation.tsx         # Navigation provider & container
│   └── index.tsx              # Context exports
│
├── navigation/
│   ├── RootNavigator.tsx      # Conditional navigation root
│   ├── MainTabNavigator.tsx   # Bottom tab navigation
│   └── stacks/
│       ├── AuthStack.tsx      # Auth flow screens
│       ├── HomeStack.tsx      # Create listing flow
│       ├── ListingsStack.tsx  # My listings flow
│       ├── SettingsStack.tsx  # Settings flow
│       └── index.tsx          # Stack exports
│
└── screens/
    ├── auth/
    │   ├── Welcome.tsx        # Introduction/features screen
    │   ├── Login.tsx          # Login screen
    │   └── SignUp.tsx         # Sign up screen
    │
    ├── home/
    │   └── Home.tsx           # Create listing screen
    │
    ├── listings/
    │   └── Listings.tsx       # My listings screen
    │
    └── settings/
        └── Settings.tsx       # Settings screen
```

## Dependencies

```json
{
  "@react-navigation/native": "^7.1.28",
  "@react-navigation/native-stack": "^7.10.0",
  "@react-navigation/bottom-tabs": "^7.10.0",
  "react-native-screens": "~4.16.0",
  "react-native-safe-area-context": "~5.6.2",
  "react-native-gesture-handler": "~2.28.0"
}
```

## Key Features

### 1. Conditional Navigation
- Shows **Welcome/Auth** screens when user is not authenticated
- Shows **Main App** (tabs) when user is authenticated
- Loading state while checking authentication

### 2. Tab Navigation
Three main tabs using Feather icons:
- **Create** (plus-circle): Upload photos and create new listings
- **My Listings** (list): View all created listings
- **Settings** (settings): App settings and preferences

### 3. Type-Safe Navigation
All navigators have TypeScript param lists for type-safe navigation:

```typescript
// Example: HomeStackParamList
export type HomeStackParamList = {
  Home: undefined;
};

// Usage in components
type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Home'>;
};
```

### 4. Placeholder Auth
Auth context provides placeholder authentication:
- `isAuthenticated`: Auth state
- `isLoading`: Loading state
- `hasSeenIntro`: Intro seen flag
- `signIn()`: Sign in method (placeholder)
- `signOut()`: Sign out method (placeholder)
- `markIntroAsSeen()`: Mark intro as seen

## Usage

### Access Auth State
```typescript
import { useAuth } from '../contexts/auth';

function MyComponent() {
  const { isAuthenticated, signIn, signOut } = useAuth();
  
  return (
    <Button onPress={signIn}>Sign In</Button>
  );
}
```

### Navigate Between Screens
```typescript
import { useNavigation } from '@react-navigation/native';

function MyComponent() {
  const navigation = useNavigation();
  
  return (
    <Button onPress={() => navigation.navigate('Login')}>
      Go to Login
    </Button>
  );
}
```

## Next Steps

1. **Implement Real Auth**: Replace placeholder auth with actual authentication (Firebase, Supabase, custom backend)
2. **Add Screens**: Create additional screens for listing creation flow
3. **Add Navigation**: Add nested navigation for multi-step flows (photo upload, review, export)
4. **Persist State**: Add AsyncStorage to persist auth and intro state
5. **Deep Linking**: Configure deep linking for URL routing

## Notes

- All screens are currently placeholders with basic UI
- Auth logic is simulated - no actual authentication implemented
- Uses existing Icon component from `src/components/atoms/icon.tsx`
- Theme colors from `src/theme/index.tsx`
