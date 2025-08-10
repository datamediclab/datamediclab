// features/customer/store/useCustomerStore.ts

import { create } from 'zustand';

// util type guards (avoid `any`)
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

function extractList<T>(input: unknown): T[] {
  if (Array.isArray(input)) return input as T[];
  if (isRecord(input)) {
    const obj = input as Record<string, unknown> & {
      items?: unknown;
      data?: unknown;
      results?: unknown;
    };
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];
  }
  return [];
}


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
  /**
   * ค้นหาลูกค้า — รองรับทั้งพารามิเตอร์ q และ keyword และ normalize รูปแบบ response หลายแบบ
   */
  searchCustomerAction: async (q) => {
    const query = q.trim();
    if (!query) return [];

    const encoded = encodeURIComponent(query);
    const urls = [
      `/api/customer/search?keyword=${encoded}`,
      `/api/customer/search?q=${encoded}`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { method: 'GET', cache: 'no-store' });
        if (!res.ok) continue;
        const data: unknown = await res.json();

        // normalize ให้กลายเป็น array ไม่ว่าจะมาเป็น [], {items:[]}, {data:[]}, {results:[]}
        const list = extractList<StoreCustomer>(data);

        if (list.length) {
          return list as StoreCustomer[];
        }
        // ถ้า 200 แต่ไม่มีรายการ ให้ลอง URL ถัดไป
      } catch (err: unknown) {
        console.error('searchCustomerAction error:', err instanceof Error ? err.message : err);
      }
    }

    return [];
  },

  fetchCustomerHistoryAction: async (id) => {
    const idStr = encodeURIComponent(String(id));

    try {
      const res = await fetch(`/api/register-device/history?customerId=${idStr}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (res.ok) {
        const data: unknown = await res.json();
        return Array.isArray(data) ? (data as StoreCustomerHistoryItem[]) : [];
      }

      if (res.status === 405) {
        const resPost = await fetch('/api/register-device/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId: id }),
          cache: 'no-store',
        });

        if (resPost.ok) {
          const data: unknown = await resPost.json();
          return Array.isArray(data) ? (data as StoreCustomerHistoryItem[]) : [];
        }
        throw new Error(`POST failed ${resPost.status}: ${resPost.statusText}`);
      }

      throw new Error(`GET failed ${res.status}: ${res.statusText}`);
    } catch (err: unknown) {
      console.error('fetchCustomerHistoryAction error:', err instanceof Error ? err.message : err);
      return [];
    }
  },
}));

export default useCustomerStore;
