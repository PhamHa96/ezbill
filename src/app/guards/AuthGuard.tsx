import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/auth.store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  const isLoading = useAuthStore(s => s.isLoading);

  if (isLoading) return null;
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
}
