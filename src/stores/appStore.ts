import { create } from 'zustand';
import { storage } from '../lib/storage';

const APP_SETTINGS_KEY = 'ezbill_app_settings';

export type Theme = 'light' | 'dark';
export type Currency = 'USD' | 'VND';

interface AppSettings {
  theme: Theme;
  currency: Currency;
}

interface AppState extends AppSettings {
  setTheme: (theme: Theme) => Promise<void>;
  setCurrency: (currency: Currency) => Promise<void>;
  hydrate: () => Promise<void>;
}

function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  currency: 'USD',

  setTheme: async (theme) => {
    applyTheme(theme);
    set({ theme });
    const raw = await storage.get(APP_SETTINGS_KEY);
    const current: AppSettings = raw ? JSON.parse(raw) : { theme: 'light', currency: 'USD' };
    await storage.set(APP_SETTINGS_KEY, JSON.stringify({ ...current, theme }));
  },

  setCurrency: async (currency) => {
    set({ currency });
    const raw = await storage.get(APP_SETTINGS_KEY);
    const current: AppSettings = raw ? JSON.parse(raw) : { theme: 'light', currency: 'USD' };
    await storage.set(APP_SETTINGS_KEY, JSON.stringify({ ...current, currency }));
  },

  hydrate: async () => {
    const raw = await storage.get(APP_SETTINGS_KEY);
    if (!raw) return;
    try {
      const settings: AppSettings = JSON.parse(raw);
      applyTheme(settings.theme);
      set(settings);
    } catch {
      // ignore
    }
  },
}));
