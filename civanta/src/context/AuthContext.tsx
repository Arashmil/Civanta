import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, GovIdType, GovVerificationDetails } from '../types';
import { api, setAuthToken, getAuthToken } from '../services/api';
import { DEMO_USERS } from '../data/initialData';

export interface GovLoginParams {
  name: string;
  phone: string;
  email?: string;
  idType: GovIdType;
  idNumber: string;
  documentFile?: { name: string; url: string; size: string };
  jurisdiction?: string;
}

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole | null;
  loginAs: (role: UserRole) => Promise<void>;
  loginWithCredentials: (email: string, pass: string) => Promise<boolean>;
  loginWithGovernmentId: (params: GovLoginParams) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  demoUsers: User[];
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore session from token on mount
  useEffect(() => {
    async function restoreSession() {
      const token = getAuthToken();
      if (token) {
        try {
          const user = await api.getMe();
          setCurrentUser(user);
        } catch {
          setAuthToken(null);
          setCurrentUser(null);
        }
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  const loginAs = async (role: UserRole) => {
    try {
      const data = await api.demoLogin(role);
      setCurrentUser(data.user);
    } catch {
      // Fallback to local demo profile if offline
      const user = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
      setCurrentUser(user);
    }
  };

  const loginWithCredentials = async (email: string, pass: string): Promise<boolean> => {
    try {
      const data = await api.login(email, pass);
      setCurrentUser(data.user);
      return true;
    } catch {
      return false;
    }
  };

  const loginWithGovernmentId = (params: GovLoginParams): boolean => {
    // Demo government ID authentication
    const demoCitizen = DEMO_USERS.find(u => u.role === 'citizen') || DEMO_USERS[0];
    setCurrentUser({
      ...demoCitizen,
      name: params.name || demoCitizen.name,
      phone: params.phone || demoCitizen.phone,
    });
    return true;
  };

  const logout = () => {
    api.logout();
    setCurrentUser(null);
  };

  const switchRole = (role: UserRole) => {
    loginAs(role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: (currentUser?.role as UserRole) || null,
        loginAs,
        loginWithCredentials,
        loginWithGovernmentId,
        logout,
        switchRole,
        isAuthenticated: !!currentUser,
        demoUsers: DEMO_USERS,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
