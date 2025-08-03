// ✅ เพิ่ม useBrandStore.ts
// features/brand/store/useBrandStore.ts

import { create } from "zustand";

interface Brand {
  id: string;
  name: string;
}

interface BrandStore {
  brandList: Brand[];
  fetchBrandListAction: () => Promise<void>;
  createBrandAction: (name: string) => Promise<void>;
  updateBrandAction: (id: string, data: { name: string }) => Promise<void>; // ✅ แก้ไข type
  deleteBrand: (id: string) => Promise<void>;
}

export const useBrandStore = create<BrandStore>((set) => ({
  brandList: [],

  fetchBrandListAction: async () => {
    try {
      const res = await fetch("/api/brand");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "โหลดแบรนด์ล้มเหลว");

      set({ brandList: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("❌ fetchBrandList failed:", error);
      set({ brandList: [] });
    }
  },

  createBrandAction: async (name: string) => {
    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "เกิดข้อผิดพลาดในการเพิ่มแบรนด์");
      }

      set((state) => ({
        brandList: [...state.brandList, result],
      }));
    } catch (error) {
      console.error("❌ createBrandAction error:", error);
      throw error;
    }
  },

  updateBrandAction: async (id: string, data: { name: string }) => {
    try {
      const res = await fetch(`/api/brand/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "อัปเดตแบรนด์ล้มเหลว");

      set((state) => ({
        brandList: state.brandList.map((brand) =>
          brand.id === id ? { ...brand, ...data } : brand
        ),
      }));
    } catch (error) {
      console.error("❌ updateBrandAction error:", error);
      throw error;
    }
  },

  deleteBrand: async (id: string) => {
    try {
      const res = await fetch(`/api/brand/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");

      set((state) => ({
        brandList: state.brandList.filter((b) => b.id !== id),
      }));
    } catch (error) {
      console.error("❌ deleteBrand error:", error);
    }
  },
}));
