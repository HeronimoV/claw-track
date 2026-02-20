import type { User } from '../types';
import { AVATAR_COLORS } from '../types';

const USERS_KEY = 'clawtrack_users';
const SESSION_KEY = 'clawtrack_session';
const REMEMBER_KEY = 'clawtrack_remember';

// Simple hash for localStorage-based auth (NOT production security)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'clawtrack_salt_v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSessionUserId(): string | null {
  return sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(REMEMBER_KEY);
}

export function setSession(userId: string, remember: boolean) {
  sessionStorage.setItem(SESSION_KEY, userId);
  if (remember) {
    localStorage.setItem(REMEMBER_KEY, userId);
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(REMEMBER_KEY);
}

export function getCurrentUser(): User | null {
  const userId = getSessionUserId();
  if (!userId) return null;
  const users = loadUsers();
  return users.find(u => u.id === userId && u.active) || null;
}

export function getNextAvatarColor(): string {
  const users = loadUsers();
  const usedColors = new Set(users.map(u => u.avatarColor));
  return AVATAR_COLORS.find(c => !usedColors.has(c)) || AVATAR_COLORS[users.length % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getTeamMemberNames(): string[] {
  const users = loadUsers();
  return users.filter(u => u.active).map(u => u.name);
}
