import { create } from "zustand";

const normalizeName = (s: string) => s.trim().split(" ").filter(Boolean).join(" ");

interface Brand {
  id: number;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

interface BrandStore {
  brandList: Brand[];
  isLoading: boolean;
  error: string | null;

  fetchBrandListAction: () => Promise<void>;
  createBrandAction: (name: string) => Promise<void>;
  updateBrandAction: (id: number, data: { name: string }) => Promise<void>;
  deleteBrand: (id: number) => Promise<void>;
  getBrandByIdAction: (id: number | string) => Promise<Brand | null>;
}

export const useBrandStore = create<BrandStore>((set) => ({
  brandList: [],
  isLoading: false,
  error: null,

  fetchBrandListAction: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/admin/brand", { cache: "no-store" });
      const json: { ok?: boolean; data?: Brand[]; error?: string } = await res.json();
      if (!res.ok || json.ok === false) throw new Error(json.error || "โหลดแบรนด์ล้มเหลว");
      const list: Brand[] = Array.isArray(json.data) ? (json.data as Brand[]) : [];
      set({ brandList: list });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการโหลดแบรนด์";
      console.error("❌ fetchBrandListAction failed:", error);
      set({ error: message, brandList: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  getBrandByIdAction: async (id) => {
    const intId = typeof id === "string" ? Number(id) : id;
    if (!Number.isFinite(intId)) {
      console.error("❌ getBrandByIdAction error: ID ต้องเป็นตัวเลข");
      set({ error: "ID ต้องเป็นตัวเลข" });
      return null;
    }
    try {
      const res = await fetch(`/api/admin/brand/${intId}`, { cache: "no-store" });
      const json: { ok?: boolean; data?: Brand; error?: string } = await res.json();
      if (!res.ok || json.ok === false || !json.data) throw new Error(json.error || "ไม่พบแบรนด์นี้");
      return json.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถดึงข้อมูลแบรนด์";
      console.error("❌ getBrandByIdAction error:", error);
      set({ error: message });
      return null;
    }
  },

  createBrandAction: async (name) => {
    try {
      const normalized = normalizeName(name);
      if (!normalized) throw new Error("กรุณาระบุชื่อแบรนด์");

      const res = await fetch("/api/admin/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: normalized }),
      });
      const json: { ok?: boolean; data?: Brand; error?: string } = await res.json();
      if (!res.ok || json.ok === false || !json.data) throw new Error(json.error || "เกิดข้อผิดพลาดในการเพิ่มแบรนด์");

      const created: Brand = json.data as Brand;
      set((state) => ({ brandList: [...state.brandList, created] }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถเพิ่มแบรนด์ได้";
      console.error("❌ createBrandAction error:", error);
      set({ error: message });
    }
  },

  updateBrandAction: async (id, data) => {
    try {
      const normalized = normalizeName(data.name);
      if (!normalized) throw new Error("กรุณาระบุชื่อแบรนด์");

      const res = await fetch(`/api/admin/brand/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: normalized }),
      });
      const json: { ok?: boolean; data?: Brand; error?: string } = await res.json();
      if (!res.ok || json.ok === false || !json.data) throw new Error(json.error || "อัปเดตแบรนด์ล้มเหลว");

      const updated: Brand = json.data as Brand;
      set((state) => ({
        brandList: state.brandList.map((b): Brand => (b.id === id ? updated : b)),
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถอัปเดตแบรนด์ได้";
      console.error("❌ updateBrandAction error:", error);
      set({ error: message });
    }
  },

  deleteBrand: async (id) => {
    try {
      const res = await fetch(`/api/admin/brand/${id}`, { method: "DELETE" });

      if (res.status === 204) {
        set((state) => ({ brandList: state.brandList.filter((b): b is Brand => b.id !== id) }));
        return;
      }

      const json: { ok?: boolean; data?: { id: number; name?: string }; error?: string } = await res.json();
      if (!res.ok || json.ok === false) throw new Error(json.error || "ลบไม่สำเร็จ");

      set((state) => ({ brandList: state.brandList.filter((b): b is Brand => b.id !== id) }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถลบแบรนด์ได้";
      console.error("❌ deleteBrand error:", error);
      set({ error: message });
    }
  },
}));
