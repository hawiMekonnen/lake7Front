// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, removeToken } from '../utils/auth';
import { jwtDecode } from 'jwt-decode';

type User = {
  id: string;
  email: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUserFromToken();
  }, []);

  const loadUserFromToken = async () => {
    const token = await getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          id: decoded.sub || decoded.id,
          email: decoded.email,
          name: decoded.name,
        });
      } catch (e) {
        console.log("Invalid token");
      }
    }
  };

  const login = (token: string) => {
    // Save token (already done in login screen)
    try {
      const decoded: any = jwtDecode(token);
      setUser({
        id: decoded.sub || decoded.id,
        email: decoded.email,
        name: decoded.name,
      });
    } catch (e) {}
  };

  const logout = async () => {
    await removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};