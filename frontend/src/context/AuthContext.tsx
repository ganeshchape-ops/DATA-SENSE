import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthState } from '../types';
import { authApi } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; mobile_number?: string; company?: string; role?: string }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setAuthToken: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('ai_insight_token') || localStorage.getItem('datasense_token')
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ai_insight_token') || localStorage.getItem('datasense_token');
      if (storedToken) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch {
          if (storedToken.includes('demo')) {
            const { MOCK_DEMO_USER } = await import('../data/mockData');
            setUser(MOCK_DEMO_USER);
          } else {
            localStorage.removeItem('ai_insight_token');
            localStorage.removeItem('datasense_token');
            setToken(null);
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const setAuthToken = (newToken: string, newUser: User) => {
    localStorage.setItem('ai_insight_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const login = async (email: string, pass: string) => {
    const res = await authApi.login({ email, password: pass });
    setAuthToken(res.access_token, res.user);
  };

  const register = async (data: { name: string; email: string; password: string; mobile_number?: string; company?: string; role?: string }) => {
    const res = await authApi.register(data);
    setAuthToken(res.access_token, res.user);
  };

  const demoLogin = async () => {
    try {
      const res = await authApi.demoLogin();
      setAuthToken(res.access_token, res.user);
    } catch (err) {
      console.warn("Backend API not reachable. Initializing demo explorer session in offline mode.", err);
      const { MOCK_DEMO_USER } = await import('../data/mockData');
      setAuthToken('demo-session-token-datasense-ai', MOCK_DEMO_USER);
    }
  };

  const logout = () => {
    localStorage.removeItem('ai_insight_token');
    localStorage.removeItem('datasense_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        setUser,
        setAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
