import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { User } from '../types';
import { userAPI, authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isGuest: false,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  loginAsGuest: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  getToken: async () => null,
});

// Module-level token getter that the API interceptor can use
let globalGetToken: (() => Promise<string | null>) | null = null;

export const getFreshToken = async (): Promise<string | null> => {
  if (globalGetToken) {
    return await globalGetToken();
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isSignedIn, isLoaded: clerkLoaded, signOut, getToken: clerkGetToken } = useClerkAuth();
  const { user: clerkUser } = useUser();

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      if (isSignedIn && clerkGetToken) {
        const token = await clerkGetToken();
        // Update the global ref so API interceptor can use it
        globalGetToken = getToken;
        return token;
      }
    } catch (error) {
      console.error('[Auth] Error getting token:', error);
    }
    return null;
  }, [isSignedIn, clerkGetToken]);

  // Set up global token getter when component mounts
  useEffect(() => {
    globalGetToken = getToken;
  }, [getToken]);

  const refreshUser = useCallback(async () => {
    try {
      if (isSignedIn && clerkUser) {
        const res: any = await userAPI.getProfile();
        if (res.success) {
          setUser(res.data);
          return;
        }
      }
      const guestId = localStorage.getItem('guestId');
      if (guestId) {
        const res: any = await userAPI.getProfile();
        if (res.success) setUser(res.data);
      }
    } catch {
      setUser(null);
    }
  }, [isSignedIn, clerkUser]);

  const loginAsGuest = useCallback(async () => {
    try {
      let guestId = localStorage.getItem('guestId');
      if (!guestId) {
        const res: any = await authAPI.createGuest();
        guestId = res.data.guestId;
        localStorage.setItem('guestId', guestId!);
      }
      await refreshUser();
    } catch (error) {
      console.error('Guest login error:', error);
    }
  }, [refreshUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('guestId');
    setUser(null);
    if (isSignedIn) {
      signOut();
    }
  }, [isSignedIn, signOut]);

  useEffect(() => {
    if (!clerkLoaded) return;
    const init = async () => {
      await refreshUser();
      setLoading(false);
    };
    init();
  }, [clerkLoaded, refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest: user?.isGuest || false,
        isAuthenticated: !!user || !!isSignedIn,
        isAdmin: (clerkUser as any)?.publicMetadata?.role === 'admin' || user?.role === 'admin',
        loading: loading || !clerkLoaded,
        loginAsGuest,
        logout,
        refreshUser,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
