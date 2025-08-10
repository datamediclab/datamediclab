import { create } from "zustand";
import type { Brand, BrandStore } from "@/features/brand/types/types";

// API response types (no any)
type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; error: string };
type ApiResp<T> = ApiOk<T> | ApiErr;

const normalizeName = (s: string) => s.trim().split(" ").filter(Boolean).join(" ");

export const useBrandStore = create<BrandStore>((set) => ({
  brandList: [],
  isLoading: false,
  error: null,

  // GET /api/admin/brand -> { ok: true, data: Brand[] }
  fetchBrandListAction: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/admin/brand", { cache: "no-store" });
      const json: ApiResp<Brand[]> = await res.json();
      if (!res.ok || json.ok === false) throw new Error(("error" in json ? json.error : "") || "โหลดแบรนด์ล้มเหลว");
      const list: Brand[] = Array.isArray(json.data) ? json.data : [];
      set({ brandList: list });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการโหลดแบรนด์";
      console.error("❌ fetchBrandListAction failed:", error);
      set({ error: message, brandList: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  // GET /api/admin/brand/:id -> { ok: true, data: Brand }
  getBrandByIdAction: async (id: number) => {
    if (!Number.isFinite(id)) {
      console.error("❌ getBrandByIdAction error: ID ต้องเป็นตัวเลข");
      set({ error: "ID ต้องเป็นตัวเลข" });
      return null;
    }
    try {
      const res = await fetch(`/api/admin/brand/${id}`, { cache: "no-store" });
      const json: ApiResp<Brand> = await res.json();
      if (!res.ok || json.ok === false || !json.data) throw new Error(("error" in json ? json.error : "") || "ไม่พบแบรนด์นี้");
      return json.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถดึงข้อมูลแบรนด์";
      console.error("❌ getBrandByIdAction error:", error);
      set({ error: message });
      return null;
    }
  },

  // POST /api/admin/brand -> { ok: true, data: Brand }
  createBrandAction: async (name) => {
    try {
      const normalized = normalizeName(name);
      if (!normalized) throw new Error("กรุณาระบุชื่อแบรนด์");

      const res = await fetch("/api/admin/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: normalized }),
      });
      const json: ApiResp<Brand> = await res.json();
      if (!res.ok || json.ok === false || !json.data) throw new Error(("error" in json ? json.error : "") || "เกิดข้อผิดพลาดในการเพิ่มแบรนด์");

      const created: Brand = json.data;
      set((state) => ({ brandList: [...state.brandList, created] }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถเพิ่มแบรนด์ได้";
      console.error("❌ createBrandAction error:", error);
      set({ error: message });
    }
  },

  // PUT /api/admin/brand/:id -> { ok: true, data: Brand }
  updateBrandAction: async (id, data) => {
    try {
      const normalized = normalizeName(data.name);
      if (!normalized) throw new Error("กรุณาระบุชื่อแบรนด์");

      const res = await fetch(`/api/admin/brand/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: normalized }),
      });
      const json: ApiResp<Brand> = await res.json();
      if (!res.ok || json.ok === false || !json.data) throw new Error(("error" in json ? json.error : "") || "อัปเดตแบรนด์ล้มเหลว");

      const updated: Brand = json.data;
      set((state) => ({
        brandList: state.brandList.map((b): Brand => (b.id === id ? updated : b)),
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถอัปเดตแบรนด์ได้";
      console.error("❌ updateBrandAction error:", error);
      set({ error: message });
    }
  },

  // DELETE /api/admin/brand/:id -> 204 | { ok: true, data: { id } }
  deleteBrand: async (id) => {
    try {
      const res = await fetch(`/api/admin/brand/${id}`, { method: "DELETE" });

      if (res.status === 204) {
        set((state) => ({ brandList: state.brandList.filter((b): b is Brand => b.id !== id) }));
        return;
      }

      const json: ApiResp<{ id: number; name?: string }> = await res.json();
      if (!res.ok || json.ok === false) throw new Error(("error" in json ? json.error : "") || "ลบไม่สำเร็จ");

      set((state) => ({ brandList: state.brandList.filter((b): b is Brand => b.id !== id) }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถลบแบรนด์ได้";
      console.error("❌ deleteBrand error:", error);
      set({ error: message });
    }
  },
}));
