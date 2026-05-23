import React, { createContext, useContext } from "react";

// Stub Auth context — replace with Supabase auth when ready
type AuthContextType = {
  isSignedIn: boolean;
  user: null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  user: null,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Stub: always "signed in" so navigation works during development
  const value: AuthContextType = {
    isSignedIn: true,
    user: null,
    signIn: async () => {},
    signOut: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
