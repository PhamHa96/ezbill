import { useEffect } from 'react';
import { useAuthStore } from '../features/auth/auth.store';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
