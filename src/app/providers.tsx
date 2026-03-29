import { useEffect } from 'react';
import { useAuthStore } from '../features/auth/auth.store';
import { useAppStore } from '../stores/appStore';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateApp = useAppStore((s) => s.hydrate);

  useEffect(() => {
    hydrateAuth();
    hydrateApp();
  }, [hydrateAuth, hydrateApp]);

  return <>{children}</>;
}
