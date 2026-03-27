import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ezbill.app',
  appName: 'ezbill',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
