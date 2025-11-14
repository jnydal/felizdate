import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingState } from '@/components/feedback/LoadingState';

export const ProtectedRoute = () => {
  const { authenticated, status } = useAppSelector((state) => state.session);

  if (status === 'loading') {
    return (
      <LoadingState
        message="Securing your session…"
        details="Fetching profile & options"
      />
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
};

