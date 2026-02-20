import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { PROFILES } from '../types';
import {
  loadUsers, saveUsers, hashPin, loadPins, savePins,
  setSession, clearSession, getCurrentUser,
} from '../utils/auth';

interface AuthContextValue {
  currentUser: User | null;
  users: User[];
  loginWithPin: (profileId: string, pin: string) => Promise<string | null>;
  registerWithPin: (profileId: string, pin: string) => Promise<string | null>;
  isProfileRegistered: (profileId: string) => boolean;
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
    saveUsers(users);
  }, [users]);

  const isProfileRegistered = useCallback((profileId: string): boolean => {
    const pins = loadPins();
    return !!pins[profileId];
  }, []);

  const registerWithPin = useCallback(async (profileId: string, pin: string): Promise<string | null> => {
    const profile = PROFILES.find(p => p.id === profileId);
    if (!profile) return 'Profile not found';

    const pins = loadPins();
    if (pins[profileId]) return 'Profile already registered';

    const hashedPin = await hashPin(pin);
    pins[profileId] = hashedPin;
    savePins(pins);

    // Create user record
    const now = new Date().toISOString();
    const allUsers = loadUsers();
    const user: User = {
      id: profileId,
      name: profile.name,
      email: `${profileId}@clawtrack.local`,
      passwordHash: hashedPin,
      role: profile.role,
      avatarColor: profile.color,
      active: true,
      createdAt: now,
      lastLoginAt: now,
    };
    const newUsers = [...allUsers.filter(u => u.id !== profileId), user];
    saveUsers(newUsers);
    setUsers(newUsers);
    setSession(profileId, true);
    setCurrentUser(user);
    return null;
  }, []);

  const loginWithPin = useCallback(async (profileId: string, pin: string): Promise<string | null> => {
    const pins = loadPins();
    if (!pins[profileId]) return 'not_registered';

    const hashedPin = await hashPin(pin);
    if (hashedPin !== pins[profileId]) return 'Incorrect PIN';

    const allUsers = loadUsers();
    const user = allUsers.find(u => u.id === profileId);
    if (!user) return 'User data not found';
    if (!user.active) return 'Account has been deactivated';

    const updated = { ...user, lastLoginAt: new Date().toISOString() };
    const newUsers = allUsers.map(u => u.id === updated.id ? updated : u);
    saveUsers(newUsers);
    setUsers(newUsers);
    setSession(profileId, true);
    setCurrentUser(updated);
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
    <AuthContext.Provider value={{
      currentUser, users, loginWithPin, registerWithPin, isProfileRegistered,
      logout, updateUser, updateUserRole, deactivateUser, reactivateUser, refreshUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
