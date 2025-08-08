import { create } from "zustand";

interface Brand {
  id: string;
  name: string;
  createdAt: string;
}

interface BrandStore {
  brandList: Brand[];
  isLoading: boolean;
  error: string | null;

  fetchBrandListAction: () => Promise<void>;
  createBrandAction: (name: string) => Promise<void>;
  updateBrandAction: (id: string, data: { name: string }) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  getBrandByIdAction: (id: string) => Promise<Brand | null>;
}

export const useBrandStore = create<BrandStore>((set) => ({
  brandList: [],
  isLoading: false,
  error: null,

  fetchBrandListAction: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/admin/brand");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "โหลดแบรนด์ล้มเหลว");

      set({ brandList: Array.isArray(data) ? data : [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการโหลดแบรนด์';
      console.error("❌ fetchBrandListAction failed:", error);
      set({ error: message, brandList: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  getBrandByIdAction: async (id: string) => {
    try {
      const res = await fetch(`/api/admin/brand/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่พบแบรนด์นี้");
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ไม่สามารถดึงข้อมูลแบรนด์';
      console.error("❌ getBrandByIdAction error:", error);
      set({ error: message });
      return null;
    }
  },

  createBrandAction: async (name: string) => {
    try {
      const res = await fetch("/api/admin/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "เกิดข้อผิดพลาดในการเพิ่มแบรนด์");

      set((state) => ({
        brandList: [...state.brandList, result],
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ไม่สามารถเพิ่มแบรนด์ได้';
      console.error("❌ createBrandAction error:", error);
      set({ error: message });
    }
  },

  updateBrandAction: async (id: string, data: { name: string }) => {
    try {
      const res = await fetch(`/api/admin/brand/${id}`, {
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
      const message = error instanceof Error ? error.message : 'ไม่สามารถอัปเดตแบรนด์ได้';
      console.error("❌ updateBrandAction error:", error);
      set({ error: message });
    }
  },

  deleteBrand: async (id: string) => {
    try {
      const res = await fetch(`/api/admin/brand/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");

      set((state) => ({
        brandList: state.brandList.filter((b) => b.id !== id),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ไม่สามารถลบแบรนด์ได้';
      console.error("❌ deleteBrand error:", error);
      set({ error: message });
    }
  },
}));