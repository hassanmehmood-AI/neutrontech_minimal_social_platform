'use client';

import { createContext, useContext } from 'react';

type AdminContextValue = {
  accessToken: string;
  adminId: string;
  adminName: string;
  adminAvatar: string;
  isSuperAdmin: boolean;
};

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdminContext() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdminContext must be used within the admin layout');
  return ctx;
}
