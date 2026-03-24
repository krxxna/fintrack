import { useAuth } from '../contexts/AuthContext';

export function useCurrency() {
  const { user } = useAuth();
  return user?.currency || 'USD';
}

