import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, setActiveUserHeader, getActiveUserId } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  switchUser: (userId: string) => void;
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
      const match = fetched.find(u => u.id === activeId) || fetched[0];
      if (match) {
        setCurrentUser(match);
        setActiveUserHeader(match.id);
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

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setActiveUserHeader(target.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
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
