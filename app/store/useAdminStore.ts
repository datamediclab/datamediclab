// app/store/useAdminStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AdminState = {
  id: string;
  email: string;
  isSuperAdmin: boolean;
};

type AdminStore = {
  admin: AdminState | null;
  setAdmin: (admin: AdminState) => void;
  logoutAdmin: () => void;
};

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      admin: null,
      setAdmin: (admin) => set({ admin }),
      logoutAdmin: () => set({ admin: null }),
    }),
    {
      name: 'admin-storage', // key ใน localStorage
    }
  )
);
