import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, loginUser, logoutUser, setActiveUserHeader, getActiveUserId } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  switchUser: (userId: string) => void;
  login: (credentials: { email?: string; password?: string; userId?: string }) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const fetched = await getUsers();
      setUsers(fetched);

      const activeId = getActiveUserId();
      // If a saved active ID exists in localStorage, match it; otherwise keep currentUser null if explicitly logged out
      const savedAuthStatus = localStorage.getItem('ajaia_auth_status');
      
      if (savedAuthStatus !== 'logged_out') {
        const match = fetched.find(u => u.id === activeId) || fetched[0];
        if (match) {
          setCurrentUser(match);
          setActiveUserHeader(match.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch seeded users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const login = async (credentials: { email?: string; password?: string; userId?: string }) => {
    const user = await loginUser(credentials);
    setCurrentUser(user);
    setActiveUserHeader(user.id);
    localStorage.removeItem('ajaia_auth_status');
  };

  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
    localStorage.setItem('ajaia_auth_status', 'logged_out');
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setActiveUserHeader(target.id);
      localStorage.removeItem('ajaia_auth_status');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        login,
        logout,
        isLoading,
        refreshUsers: fetchUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
