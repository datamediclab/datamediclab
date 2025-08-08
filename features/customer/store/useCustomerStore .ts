// =============================
// ✅ features/customer/store/useCustomerStore.ts (PATCH: robust 405 fallback)
// =============================
import { create } from "zustand";
import axios from "axios";

type StoreCustomer = { id: string; fullName: string; phone: string; email?: string };
type StoreCustomerHistoryItem = {
  id: string;
  deviceType?: string;
  brandName?: string;
  modelName?: string;
  serialNumber?: string;
  problem?: string;
  status?: string;
  createdAt: string;
};

type CustomerStore = {
  searchCustomerAction: (q: string) => Promise<StoreCustomer[]>;
  fetchCustomerHistoryAction: (id: string | number) => Promise<StoreCustomerHistoryItem[]>;
};

const useCustomerStore = create<CustomerStore>(() => ({
  searchCustomerAction: async (q) => {
    try {
      const res = await axios.get("/api/customer/search", { params: { q } });
      return Array.isArray(res.data) ? (res.data as StoreCustomer[]) : [];
    } catch (err) {
      const msg = err instanceof Error ? err.message : "ค้นหาลูกค้าไม่สำเร็จ";
      console.error("searchCustomerAction failed:", msg);
      return [];
    }
  },

  fetchCustomerHistoryAction: async (id) => {
  try {
    // Primary: GET with query string
    const res = await axios.get("/api/register-device/history", { params: { customerId: id } });
    return Array.isArray(res.data) ? (res.data as StoreCustomerHistoryItem[]) : [];
  } catch (err: unknown) {
    // Safe narrowing without `any` per eslint rules
    let status: number | undefined = undefined;
    if (typeof err === "object" && err !== null && "response" in err) {
      const maybeResp = (err as { response?: { status?: number } }).response;
      status = maybeResp?.status;
    }

    if (status === 405) {
      try {
        const res = await axios.post("/api/register-device/history", { customerId: id });
        return Array.isArray(res.data) ? (res.data as StoreCustomerHistoryItem[]) : [];
      } catch (postErr: unknown) {
        const message = postErr instanceof Error ? postErr.message : "โหลดประวัติลูกค้า (POST) ไม่สำเร็จ";
        console.error("fetchCustomerHistoryAction POST failed:", message);
        return [];
      }
    }

    const message = err instanceof Error ? err.message : "โหลดประวัติลูกค้าไม่สำเร็จ";
    console.error("fetchCustomerHistoryAction failed:", message);
    return [];
  }
},
}));

export default useCustomerStore;
