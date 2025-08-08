// =============================
// ✅ features/customer/store/useCustomerStore.ts (PATCH: replace axios with fetch)
// =============================
import { create } from 'zustand';

// Types
export type StoreCustomer = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
};

export type StoreCustomerHistoryItem = {
  id: string;
  deviceType?: string;
  brandName?: string;
  modelName?: string;
  serialNumber?: string;
  problem?: string;
  status?: string;
  createdAt: string;
};

export type CustomerStore = {
  searchCustomerAction: (q: string) => Promise<StoreCustomer[]>;
  fetchCustomerHistoryAction: (id: string | number) => Promise<StoreCustomerHistoryItem[]>;
};

const useCustomerStore = create<CustomerStore>(() => ({
  // 🔎 Search customers (GET /api/customer/search?q=...)
  searchCustomerAction: async (q) => {
    try {
      const url = `/api/customer/search?q=${encodeURIComponent(q)}`;
      const res = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!res.ok) {
        console.error('searchCustomerAction failed:', res.status, res.statusText);
        return [];
      }

      const data = await res.json();
      return Array.isArray(data) ? (data as StoreCustomer[]) : [];
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ค้นหาลูกค้าไม่สำเร็จ';
      console.error('searchCustomerAction error:', msg);
      return [];
    }
  },

  // 📜 Customer history with graceful 405 fallback (GET → POST)
  fetchCustomerHistoryAction: async (id) => {
    const idStr = encodeURIComponent(String(id));

    try {
      // Primary: GET with query string
      const res = await fetch(`/api/register-device/history?customerId=${idStr}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? (data as StoreCustomerHistoryItem[]) : [];
      }

      // Fallback to POST if backend only accepts it
      if (res.status === 405) {
        const resPost = await fetch('/api/register-device/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId: id }),
          cache: 'no-store',
        });

        if (resPost.ok) {
          const data = await resPost.json();
          return Array.isArray(data) ? (data as StoreCustomerHistoryItem[]) : [];
        }

        console.error('fetchCustomerHistoryAction POST failed:', resPost.status, resPost.statusText);
        return [];
      }

      console.error('fetchCustomerHistoryAction GET failed:', res.status, res.statusText);
      return [];
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'โหลดประวัติลูกค้าไม่สำเร็จ';
      console.error('fetchCustomerHistoryAction error:', msg);
      return [];
    }
  },
}));

export default useCustomerStore;
