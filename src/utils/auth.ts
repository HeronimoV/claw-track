import type { User } from '../types';
import { AVATAR_COLORS, PROFILES } from '../types';

const USERS_KEY = 'clawtrack_users';
const SESSION_KEY = 'clawtrack_session';
const REMEMBER_KEY = 'clawtrack_remember';
const PINS_KEY = 'clawtrack_pins';

// Simple hash for localStorage-based auth (NOT production security)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'clawtrack_salt_v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPin(pin: string): Promise<string> {
  return hashPassword(pin); // reuse same SHA-256 approach
}

// PIN storage: { [profileId]: hashedPin }
export function loadPins(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PINS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function savePins(pins: Record<string, string>) {
  localStorage.setItem(PINS_KEY, JSON.stringify(pins));
}

export function isProfileRegistered(profileId: string): boolean {
  const pins = loadPins();
  return !!pins[profileId];
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
  // Always return all 5 team members
  return PROFILES.map(p => p.name);
}
