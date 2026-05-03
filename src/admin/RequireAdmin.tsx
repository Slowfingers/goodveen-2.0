import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAdminAuth } from './AdminAuthContext';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { loading, profile, isAdmin } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center text-[12px] tracking-[0.2em] uppercase text-[#808080]">
        Loading…
      </div>
    );
  }

  if (!profile || !isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
