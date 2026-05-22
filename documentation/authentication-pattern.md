# Authentication Pattern

This document describes the authentication architecture, patterns, and implementation details used across projects. This pattern combines Supabase authentication with a custom backend API to manage user sessions and customer accounts.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Dependencies](#core-dependencies)
4. [Environment Variables](#environment-variables)
5. [File Structure](#file-structure)
6. [Implementation Guide](#implementation-guide)
7. [Key Patterns](#key-patterns)
8. [API Client Integration](#api-client-integration)
9. [Usage Examples](#usage-examples)

---

## Overview

### Authentication Flow

1. **User signs up/signs in** via Supabase (email/password or OAuth providers like Google/Apple)
2. **Supabase manages session** with automatic token refresh and persistence
3. **Auth context listens** to Supabase auth state changes
4. **API token is set** automatically when session changes
5. **User profile is fetched** from backend API (`/me` endpoint)
6. **Customer account is lazy-created** if profile doesn't exist (404 response triggers account creation)
7. **User object is enriched** with backend profile data (`customerId`, optionally `isOnboarded`)

### Key Principles

- **Supabase handles authentication** (sign-up, sign-in, session management, OAuth)
- **Backend API manages customer accounts** and business logic
- **React Context provides auth state** to the entire app
- **Automatic token synchronization** between Supabase and API client
- **Lazy account creation** - customer accounts are created on-demand
- **Type-safe API client** generated from OpenAPI/Swagger specs
- **`customerId` is critical** - used to identify users across all integrated services (Sentry, PostHog, RevenueCat, ConfigCat)

### Integration with Other Services

The `customerId` obtained from the backend after authentication is used throughout your app:

- **Error Tracking (Sentry)** - Identify users in error reports → See `sentry-pattern.md`
- **Product Analytics (PostHog)** - Track user behavior and events → See `posthog-pattern.md`
- **Subscriptions (RevenueCat)** - Link purchases to customer accounts → See `subscription-pattern.md`
- **Feature Flags (ConfigCat)** - Target features to specific users → See `configcat-pattern.md`
- **E2E Testing (Maestro)** - Use testIDs on auth UI components → See `e2e-testing-pattern.md`

---

## Architecture

```
┌─────────────────┐
│  Supabase Auth  │ ← Handles authentication, session management, OAuth
└────────┬────────┘
         │
         │ Session & JWT Token
         │
┌────────▼────────┐
│  Auth Context   │ ← React Context managing auth state
└────────┬────────┘
         │
         ├──► Set API Client Token
         │
         └──► Fetch User Profile (/me endpoint)
                     │
                     ├──► Profile exists → Enrich user object
                     │
                     └──► 404 Not Found → Create customer account → Fetch profile
```

---

## Core Dependencies

### Required NPM Packages

```json
{
  "@supabase/supabase-js": "^2.49.4",
  "@react-native-async-storage/async-storage": "^2.1.2",
  "react-native-url-polyfill": "^2.0.0",
  "swagger-typescript-api": "^13.1.3"
}
```

### Optional OAuth Providers

```json
{
  "@react-native-google-signin/google-signin": "^15.0.0",
  "expo-apple-authentication": "~7.2.4"
}
```

### Installation

```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill

# If using generated API client
npm install -D swagger-typescript-api

# OAuth providers (optional)
npm install @react-native-google-signin/google-signin
npx expo install expo-apple-authentication
```

---

## Environment Variables

Create a `.env` file (or use Expo's environment variable system):

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Backend API Configuration
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
```

### Getting Supabase Credentials

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy the "Project URL" → `EXPO_PUBLIC_SUPABASE_URL`
4. Copy the "anon public" key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## File Structure

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client initialization
│   ├── client.ts            # API client with auth token management
│   └── api.ts               # Generated TypeScript API client (from swagger)
├── contexts/
│   └── auth.tsx             # Auth context provider and hook
└── types/
    └── auth.ts              # Auth-related type definitions (optional)
```

---

## Implementation Guide

### Step 1: Initialize Supabase Client

**File: `src/lib/supabase.ts`**

```typescript
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: "implicit",
  },
});
```

**Key Configuration:**

- `storage: AsyncStorage` - Persists session across app restarts
- `autoRefreshToken: true` - Automatically refreshes expired tokens
- `persistSession: true` - Saves session to storage
- `detectSessionInUrl: false` - Disabled for mobile apps
- `flowType: "implicit"` - OAuth flow type

---

### Step 2: Generate TypeScript API Client (Optional)

If you have a backend API with OpenAPI/Swagger documentation:

**Add to `package.json` scripts:**

```json
{
  "scripts": {
    "regen-api-client": "swagger-typescript-api generate -p http://localhost:5001/swagger/v1/swagger.json -o src/lib"
  }
}
```

**Run to generate client:**

```bash
npm run regen-api-client
```

This creates `src/lib/api.ts` with type-safe API methods.

---

### Step 3: Create API Client with Auth Integration

**File: `src/lib/client.ts`**

```typescript
import { Api } from "./api"; // Generated API client

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001";

// Private variable to track the current auth token
let currentAuthToken: string | null = null;

/**
 * Typed API client pre-configured with base URL and custom auth token handling.
 * SecurityDataType is string | null, representing the JWT auth token.
 */
export const publicClient = new Api<string | null>({
  baseUrl: API_BASE_URL,
  
  // Security worker adds Authorization header if token is set
  securityWorker: (securityData) => {
    if (securityData) {
      return { headers: { Authorization: `Bearer ${securityData}` } };
    }
    return {};
  },
  
  baseApiParams: {
    headers: {
      // Add any default headers here
    },
  },
});

/**
 * Sets the authentication token for the API client.
 * Called automatically by AuthContext when session changes.
 * 
 * @param token - JWT token from Supabase or null to clear
 */
export const setPublicClientAuthToken = (token: string | null) => {
  if (token == null) return;

  publicClient.setSecurityData(token);
  currentAuthToken = token; // Track for FormData uploads
};

/**
 * Custom FormData upload method for file uploads with authentication.
 * The generated API client doesn't handle multipart/form-data well,
 * so this method manually constructs the request with proper auth headers.
 * 
 * @param endpoint - API endpoint (e.g., '/api/Upload/file')
 * @param method - HTTP method (default: 'POST')
 * @param formData - FormData object containing files and data
 * @param queryParams - Optional query parameters
 * @returns Promise<Response>
 * 
 * @example
 * const formData = new FormData();
 * formData.append('file', fileObject);
 * const response = await uploadFormData('/api/Upload/file', 'POST', formData);
 */
export const uploadFormData = async (
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" = "POST",
  formData: FormData,
  queryParams?: Record<string, string | number>
): Promise<Response> => {
  let url = `${API_BASE_URL}${endpoint}`;

  // Add query parameters if provided
  if (queryParams) {
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      searchParams.append(key, value.toString());
    });
    url += `?${searchParams.toString()}`;
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  // Add authorization header if token is available
  if (currentAuthToken) {
    headers.Authorization = `Bearer ${currentAuthToken}`;
  }

  // Don't set Content-Type - let browser set it with boundary
  const response = await fetch(url, {
    method,
    body: formData,
    headers,
  });

  return response;
};
```

**API Client Pattern - Key Points:**

1. **Singleton Instance**: `publicClient` is initialized once and reused throughout the app
2. **Automatic Auth Headers**: The `securityWorker` automatically adds `Authorization: Bearer <token>` to all requests
3. **Token Synchronization**: `setPublicClientAuthToken()` is called by AuthContext whenever the session changes
4. **FormData Support**: `uploadFormData()` handles file uploads that the generated client can't handle properly
5. **Type Safety**: All API methods are fully typed based on your backend's OpenAPI spec

---

### Step 4: Create Auth Context

**File: `src/contexts/auth.tsx`**

```typescript
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { publicClient, setPublicClientAuthToken } from "../lib/client";

// Extended user type with backend profile data
export type AuthUser = User & {
  customerId?: string;      // REQUIRED: Backend customer account ID
  isOnboarded?: boolean;    // OPTIONAL: Whether user completed onboarding
};

type AuthContextType = {
  session: Session | null;
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUpWithIdToken: (provider: string, idToken: string) => Promise<void>;
  refetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Updates user state with backend profile data.
   * Enriches Supabase user object with customerId and isOnboarded.
   */
  const updateUserWithProfile = useCallback(
    (supabaseUser: User, profileData: any) => {
      setUser({
        ...supabaseUser,
        customerId: profileData?.locatorId,
        isOnboarded: profileData?.isOnboarded,
      } as AuthUser);
    },
    []
  );

  /**
   * Refreshes session and synchronizes auth state.
   * 
   * Flow:
   * 1. Set session state
   * 2. Set API client auth token
   * 3. Fetch user profile from backend (/me endpoint)
   * 4. If 404 (no profile), create customer account via backend
   * 5. Enrich user object with backend profile data
   */
  const refreshSession = useCallback(
    async (authSession: Session | null) => {
      setSession(authSession);
      setPublicClientAuthToken(authSession?.access_token ?? null);

      if (authSession?.user) {
        setLoading(true);
        try {
          // Fetch user profile from backend
          const { data } = await publicClient.api.authMeList();
          updateUserWithProfile(authSession.user, data);
        } catch (error: any) {
          // Check if this is a 404 (user profile doesn't exist)
          const noUserExists =
            error?.status === 404 || error?.response?.status === 404;

          if (noUserExists) {
            try {
              // Lazy-create customer account
              await publicClient.api.authSignUpCreate();
              
              // Fetch the newly created profile
              const { data } = await publicClient.api.authMeList();
              updateUserWithProfile(authSession.user, data);
            } catch (createError) {
              console.error("Failed to create customer account:", createError);
              // Set user without customerId if account creation fails
              setUser(authSession.user as AuthUser);
            }
          } else {
            console.error("Failed to fetch user profile:", error);
            // Set user without customerId if profile fetch fails
            setUser(authSession.user as AuthUser);
          }
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    },
    [updateUserWithProfile]
  );

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      refreshSession(session);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        refreshSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [refreshSession]);

  /**
   * Sign in with email and password.
   */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // refreshSession will be called automatically via auth state listener
  };

  /**
   * Sign up with OAuth provider using ID token.
   * Generic method that works with any provider (Google, Apple, etc.).
   * 
   * @param provider - Provider name (e.g., 'google', 'apple')
   * @param idToken - ID token from the OAuth provider
   */
  const signUpWithIdToken = async (provider: string, idToken: string) => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider,
      token: idToken,
    });

    if (error != null && error?.status !== 0) {
      throw error;
    }
    // refreshSession will be called automatically via auth state listener
  };

  /**
   * Sign up with email and password.
   * 
   * @param email - User email
   * @param password - User password
   * @param name - User's full name (stored in Supabase user metadata)
   */
  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error != null && error?.status !== 0) {
      throw error;
    }
    // refreshSession will be called automatically via auth state listener
  };

  /**
   * Sign out the current user.
   * Clears session, auth token, and any cached data.
   */
  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      setLoading(false);
      throw error;
    }

    // Clear any app-specific cached data here
    // e.g., await clearAllCache();
    
    setLoading(false);
  };

  /**
   * Manually refetch user profile from backend.
   * Useful after user updates their profile.
   */
  const refetchUser = async (): Promise<void> => {
    if (!session?.user) {
      console.warn("No session available to refetch user");
      return;
    }

    try {
      const { data } = await publicClient.api.authMeList();
      updateUserWithProfile(session.user, data);
    } catch (error) {
      console.error("Failed to refetch user profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        signUpWithIdToken,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access auth context.
 * Must be used within AuthProvider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

---

### Step 5: Wrap App with AuthProvider

**File: `App.tsx`**

```typescript
import { AuthProvider, useAuth } from "./src/contexts/auth";

function AppContent() {
  const { session, user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return session && user ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
```

---

## Key Patterns

### 1. Lazy Account Creation

When a user authenticates with Supabase but doesn't have a backend customer account:

```typescript
try {
  const { data } = await publicClient.api.authMeList();
  updateUserWithProfile(authSession.user, data);
} catch (error: any) {
  if (error?.status === 404) {
    // Profile doesn't exist - create it
    await publicClient.api.authSignUpCreate();
    const { data } = await publicClient.api.authMeList();
    updateUserWithProfile(authSession.user, data);
  }
}
```

**Why this pattern?**
- Decouples Supabase auth from backend account creation
- Handles race conditions and timing issues
- Works with both email/password and OAuth flows

---

### 2. Extended User Type

```typescript
export type AuthUser = User & {
  customerId?: string;      // Backend customer account ID
  isOnboarded?: boolean;    // Onboarding completion status
};
```

**Purpose:**
- `customerId` links Supabase user to backend customer account
- Essential for subscription/payment integration
- `isOnboarded` tracks user onboarding progress (optional)

---

### 3. Automatic Token Synchronization

```typescript
const refreshSession = async (authSession: Session | null) => {
  setSession(authSession);
  setPublicClientAuthToken(authSession?.access_token ?? null);
  // ... rest of logic
};
```

**Flow:**
1. Supabase session changes (login, logout, token refresh)
2. Auth context updates session state
3. API client token is updated automatically
4. All subsequent API calls include the new token

---

### 4. Generic OAuth Provider Pattern

```typescript
const signUpWithIdToken = async (provider: string, idToken: string) => {
  const { error } = await supabase.auth.signInWithIdToken({
    provider,  // 'google', 'apple', 'facebook', etc.
    token: idToken,
  });
  if (error) throw error;
};
```

**Adding new OAuth providers:**
- Create provider-specific button component
- Obtain ID token from provider SDK
- Call `signUpWithIdToken(provider, idToken)`
- No changes to auth context needed

---

## API Client Integration

### Backend API Requirements

Your backend API should provide these endpoints:

#### 1. Get User Profile (`GET /api/auth/me`)

**Purpose:** Fetch user profile/customer account data

**Authentication:** Requires JWT Bearer token

**Response Example:**
```json
{
  "customerId": "cust_123456",
  "email": "user@example.com",
  "isOnboarded": true,
  "createdAt": "2026-01-01T00:00:00Z"
  // ... additional fields specific to your app's business logic
}
```

> **Note:** The response structure will vary based on your backend's customer model. The critical field is `customerId` (or equivalent unique identifier) used across other services.

**Returns:**
- `200 OK` with profile data
- `404 Not Found` if profile doesn't exist (triggers lazy creation)

---

#### 2. Create Customer Account (`POST /api/auth/sign-up`)

**Purpose:** Create customer account for authenticated user

**Authentication:** Requires JWT Bearer token

**Implementation Notes:**
- Extract user ID from JWT token
- Create customer account in your database
- Link to subscription/payment provider (e.g., Stripe)
- Return `200 OK` on success

**Response:**
- `200 OK` on successful account creation
- `409 Conflict` if account already exists (optional)

---

### Using the API Client

#### Making API Calls

```typescript
import { publicClient } from "../lib/client";
import { useAuth } from "../contexts/auth";

function MyComponent() {
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      // Type-safe API call with automatic auth header
      const { data } = await publicClient.api.someEndpointList();
      console.log(data);
    } catch (error) {
      console.error("API error:", error);
    }
  };

  return <Button onPress={fetchData} title="Fetch Data" />;
}
```

#### File Uploads with FormData

```typescript
import { uploadFormData } from "../lib/client";

const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', 'My uploaded file');

  try {
    const response = await uploadFormData(
      '/api/Upload/file',
      'POST',
      formData,
      { accountId: user.customerId }
    );

    if (response.ok) {
      const result = await response.json();
      console.log('Upload successful:', result);
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

---

## Usage Examples

### Email/Password Authentication

```typescript
import { useAuth } from "../contexts/auth";

function LoginScreen() {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      // Navigation happens automatically when session updates
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Sign In" onPress={handleLogin} disabled={loading} />
    </View>
  );
}
```

### Sign Up

```typescript
function SignUpScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignUp = async () => {
    try {
      await signUp(email, password, name);
      // User created and session started
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View>
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Create Account" onPress={handleSignUp} />
    </View>
  );
}
```

### Google Sign-In

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuth } from "../contexts/auth";

function GoogleSignInButton() {
  const { signUpWithIdToken } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      // Configure Google Sign-In
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // Get ID token
      const idToken = userInfo.idToken;
      
      // Sign in with Supabase using ID token
      await signUpWithIdToken('google', idToken);
    } catch (error) {
      console.error('Google Sign-In error:', error);
    }
  };

  return <Button title="Sign in with Google" onPress={handleGoogleSignIn} />;
}
```

### Apple Sign-In

```typescript
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from "../contexts/auth";

function AppleSignInButton() {
  const { signUpWithIdToken } = useAuth();

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Sign in with Supabase using ID token
      await signUpWithIdToken('apple', credential.identityToken);
    } catch (error) {
      console.error('Apple Sign-In error:', error);
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      onPress={handleAppleSignIn}
    />
  );
}
```

### Sign Out

```typescript
function ProfileScreen() {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // User is logged out, navigation happens automatically
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View>
      <Text>Customer ID: {user?.customerId}</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}
```

### Accessing User Data

```typescript
function AccountScreen() {
  const { user, session, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View>
      <Text>Email: {user?.email}</Text>
      <Text>Customer ID: {user?.customerId}</Text>
      <Text>Onboarded: {user?.isOnboarded ? 'Yes' : 'No'}</Text>
      <Text>User ID: {user?.id}</Text>
    </View>
  );
}
```

### Conditional Rendering Based on Auth State

```typescript
function App() {
  const { session, user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  // User not authenticated
  if (!session || !user) {
    return <AuthStack />;
  }

  // User authenticated but no customer account
  if (!user.customerId) {
    return <ErrorScreen message="Account setup failed" />;
  }

  // User authenticated and has customer account
  return <MainApp />;
}
```

### Refetching User Profile

```typescript
function SettingsScreen() {
  const { refetchUser } = useAuth();

  const updateProfile = async (data: any) => {
    try {
      // Update profile via API
      await publicClient.api.profileUpdateCreate(data);
      
      // Refetch user to get updated data
      await refetchUser();
      
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <Button title="Save Changes" onPress={updateProfile} />
  );
}
```

---

## Summary

This authentication pattern provides:

✅ **Robust authentication** via Supabase with session management  
✅ **Backend integration** with automatic token synchronization  
✅ **Lazy account creation** to handle timing between auth and backend  
✅ **Type-safe API client** generated from OpenAPI specs  
✅ **Flexible OAuth support** with generic provider pattern  
✅ **Extended user data** linking Supabase auth to customer accounts  
✅ **Persistent sessions** across app restarts  
✅ **Automatic token refresh** without user intervention  

**Next Steps:**
- Set up Supabase project and configure environment variables
- Implement backend `/auth/me` and `/auth/sign-up` endpoints
- Generate TypeScript API client from your OpenAPI spec
- Implement this pattern in your React Native app
- Add OAuth providers as needed
