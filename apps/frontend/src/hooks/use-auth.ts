import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useGetMe } from '@workspace/api-client-react';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'agent';
};

export function useAuth() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('resolveai_token') : null;
  const { data, isLoading, isError, error } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
      staleTime: 5 * 60 * 1000,
    } as any,
  });

  const user = token && data ? (data as AuthUser) : null;

  return {
    user,
    isLoading: !!token && isLoading,
    isLoggedIn: !!user,
    isError,
    error,
  };
}

export function useRequireAuth(allowedRoles?: Array<'customer' | 'agent'>) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('resolveai_token') : null;

  useEffect(() => {
    if (isLoading) return;

    if (!token || !user) {
      setLocation('/login');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      setLocation(user.role === 'agent' ? '/agent/dashboard' : '/customer/cases');
    }
  }, [user, isLoading, token, allowedRoles, setLocation]);

  return { user, isLoading };
}
