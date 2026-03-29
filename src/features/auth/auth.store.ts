/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { storage } from '../../lib/storage';

const AUTH_KEY = 'auth_user';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  login: (user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,

  login: async (user: any) => {
    await storage.set(AUTH_KEY, JSON.stringify(user));
    set({ user, isLoggedIn: true, isLoading: false });
  },

  logout: async () => {
    await storage.remove(AUTH_KEY);
    set({ user: null, isLoggedIn: false });
  },

  updateUser: async (patch) => {
    const current = useAuthStore.getState().user;
    if (!current) return;
    const updated = { ...current, ...patch };
    await storage.set(AUTH_KEY, JSON.stringify(updated));
    set({ user: updated });
  },

  hydrate: async () => {
    const raw = await storage.get(AUTH_KEY);
    if (!raw) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = JSON.parse(raw);
      set({ user, isLoggedIn: true, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
