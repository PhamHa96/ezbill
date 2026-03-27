/* eslint-disable @typescript-eslint/no-explicit-any */
import { Preferences } from '@capacitor/preferences';

const isCapacitor = !!(window as any).Capacitor;

export const storage = {
  async get(key: string): Promise<string | null> {
    if (isCapacitor) {
      const { value } = await Preferences.get({ key });
      return value;
    }
    return localStorage.getItem(key);
  },

  async set(key: string, value: string): Promise<void> {
    if (isCapacitor) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  },

  async remove(key: string): Promise<void> {
    if (isCapacitor) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  },
};
