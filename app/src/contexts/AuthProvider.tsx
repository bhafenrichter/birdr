import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Toast from "react-native-toast-message";
import { supabase } from "../services/supabase";
import { logger } from "../services/logger";
import { usePostHog } from "./PostHogProvider";
import { ENV } from "../config/env";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile } from "../types/api";

GoogleSignin.configure({
  iosClientId: ENV.GOOGLE_IOS_CLIENT_ID,
  webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
});

type AuthContextType = {
  isSignedIn: boolean;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  isLoading: true,
  session: null,
  user: null,
  profile: null,
  signInWithApple: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const posthog = usePostHog();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile from DB
  const fetchProfile = useCallback(async (userId: string) => {
    logger.info("Fetching user profile", { userId });
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      logger.error("Failed to fetch profile in auth context", {
        userId,
        code: error.code,
        message: error.message,
      });
      return;
    }
    if (data) {
      setProfile(data as Profile);
      posthog.identify(userId, {
        display_name: (data as Profile).display_name,
        subscription_tier: (data as Profile).subscription_tier,
      });
    }
  }, [posthog]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id);
      }
      setIsLoading(false);
    });

    // Subscribe to changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      logger.info("Auth state changed", { event, userId: s?.user?.id });
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Native Apple sign-in → ID token → Supabase
  const signInWithApple = useCallback(async () => {
    logger.info("Signing in with Apple");
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        logger.error("Apple sign-in returned no identity token");
        Toast.show({
          type: "error",
          text1: "Sign in failed",
          text2: "Something went wrong with Apple. Please try again.",
        });
        return;
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (error) {
        logger.error("Apple sign-in failed", { message: error.message });
        Toast.show({
          type: "error",
          text1: "Sign in failed",
          text2: "We couldn't sign you in. Please try again.",
        });
      }
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        logger.info("Apple sign-in cancelled by user");
        return;
      }
      logger.error("Apple sign-in error", { message: e.message });
      Toast.show({
        type: "error",
        text1: "Sign in failed",
        text2: "Something unexpected happened. Please try again.",
      });
    }
  }, []);

  // Native Google sign-in → ID token → Supabase
  const signInWithGoogle = useCallback(async () => {
    logger.info("Signing in with Google");
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const currentUser = GoogleSignin.getCurrentUser();

      const idToken = currentUser?.idToken;
      if (!idToken) {
        logger.error("Google sign-in returned no ID token");
        Toast.show({
          type: "error",
          text1: "Sign in failed",
          text2: "Something went wrong with Google. Please try again.",
        });
        return;
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) {
        logger.error("Google sign-in failed", { message: error.message });
        Toast.show({
          type: "error",
          text1: "Sign in failed",
          text2: "We couldn't sign you in. Please try again.",
        });
      }
    } catch (e: any) {
      if (e.code === "SIGN_IN_CANCELLED") {
        logger.info("Google sign-in cancelled by user");
        return;
      }
      logger.error("Google sign-in error", e.message);
      Toast.show({
        type: "error",
        text1: "Sign in failed",
        text2: "Something unexpected happened. Please try again.",
      });
    }
  }, []);

  const signOut = useCallback(async () => {
    logger.info("Signing out");
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.error("Sign out failed", { message: error.message });
      Toast.show({
        type: "error",
        text1: "Sign out failed",
        text2: "We couldn't sign you out. Please try again.",
      });
    } else {
      posthog.reset();
    }
  }, [posthog]);

  return (
    <AuthContext.Provider
      value={{
        isSignedIn: !!session,
        isLoading,
        session,
        user,
        profile,
        signInWithApple,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
