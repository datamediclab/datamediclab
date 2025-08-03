// stores/useAdminStore.ts
import { create } from 'zustand';

type AdminStore = {
  admin: { id: string; email: string } | null;
  setAdmin: (admin: { id: string; email: string }) => void;
};

export const useAdminStore = create<AdminStore>((set) => ({
  admin: null,
  setAdmin: (admin) => set({ admin }),
}));
