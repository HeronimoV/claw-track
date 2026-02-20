import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { User, UserRole } from '../types';
import {
  loadUsers, saveUsers, hashPassword, setSession, clearSession,
  getCurrentUser, getNextAvatarColor,
} from '../utils/auth';

interface AuthContextValue {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string, remember: boolean) => Promise<string | null>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<string | null>;
  logout: () => void;
  updateUser: (user: User) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  deactivateUser: (userId: string) => void;
  reactivateUser: (userId: string) => void;
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => loadUsers());

  const refreshUsers = useCallback(() => {
    setUsers(loadUsers());
  }, []);

  useEffect(() => {
    // Sync users to localStorage when changed
    saveUsers(users);
  }, [users]);

  const login = useCallback(async (email: string, password: string, remember: boolean): Promise<string | null> => {
    const allUsers = loadUsers();
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return 'No account found with that email';
    if (!user.active) return 'Account has been deactivated';
    const hash = await hashPassword(password);
    if (hash !== user.passwordHash) return 'Incorrect password';
    const updated = { ...user, lastLoginAt: new Date().toISOString() };
    const newUsers = allUsers.map(u => u.id === updated.id ? updated : u);
    saveUsers(newUsers);
    setUsers(newUsers);
    setSession(user.id, remember);
    setCurrentUser(updated);
    return null;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole): Promise<string | null> => {
    const allUsers = loadUsers();
    if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return 'An account with that email already exists';
    }
    const now = new Date().toISOString();
    const user: User = {
      id: uuidv4(),
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      role,
      avatarColor: getNextAvatarColor(),
      active: true,
      createdAt: now,
      lastLoginAt: now,
    };
    const newUsers = [...allUsers, user];
    saveUsers(newUsers);
    setUsers(newUsers);
    setSession(user.id, false);
    setCurrentUser(user);
    return null;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
  }, []);

  const updateUser = useCallback((user: User) => {
    setUsers(prev => {
      const next = prev.map(u => u.id === user.id ? user : u);
      saveUsers(next);
      return next;
    });
    if (currentUser?.id === user.id) setCurrentUser(user);
  }, [currentUser]);

  const updateUserRole = useCallback((userId: string, role: UserRole) => {
    setUsers(prev => {
      const next = prev.map(u => u.id === userId ? { ...u, role } : u);
      saveUsers(next);
      return next;
    });
  }, []);

  const deactivateUser = useCallback((userId: string) => {
    setUsers(prev => {
      const next = prev.map(u => u.id === userId ? { ...u, active: false } : u);
      saveUsers(next);
      return next;
    });
  }, []);

  const reactivateUser = useCallback((userId: string) => {
    setUsers(prev => {
      const next = prev.map(u => u.id === userId ? { ...u, active: true } : u);
      saveUsers(next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, users, login, register, logout, updateUser, updateUserRole, deactivateUser, reactivateUser, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
