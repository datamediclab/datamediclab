import { create } from 'zustand';
import type {
  BrandModel,
  CreateBrandModelInput,
  UpdateBrandModelInput,
  ApiResp,
} from '@/features/brand-model/types/types';

interface BrandModelStore {
  brandModelList: BrandModel[];
  selectedBrandModel: BrandModel | null;
  loading: boolean;

  setBrandModelList: (data: BrandModel[]) => void;
  setSelectedBrandModel: (data: BrandModel | null) => void;
  setLoading: (loading: boolean) => void;

  fetchBrandModelListAction: () => Promise<void>;
  fetchBrandModelByIdAction: (id: number) => Promise<void>;
  createBrandModelAction: (payload: CreateBrandModelInput) => Promise<void>;
  updateBrandModelAction: (id: number, payload: UpdateBrandModelInput) => Promise<void>;
  deleteBrandModelAction: (id: number) => Promise<void>;
}

export const useBrandModelStore = create<BrandModelStore>((set, get) => ({
  brandModelList: [],
  selectedBrandModel: null,
  loading: false,

  setBrandModelList: (data) => set({ brandModelList: data }),
  setSelectedBrandModel: (data) => set({ selectedBrandModel: data }),
  setLoading: (loading) => set({ loading }),

  // GET /api/admin/brand-model  -> { ok: true, data: BrandModel[] }
  fetchBrandModelListAction: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/admin/brand-model', { cache: 'no-store' });
      const json: ApiResp<BrandModel[]> = await response.json();
      if (!response.ok || json.ok === false) {
        throw new Error(('error' in json ? json.error : '') || 'ไม่สามารถโหลดข้อมูลรุ่นของแบรนด์ได้');
      }
      set({ brandModelList: Array.isArray(json.data) ? json.data : [] });
    } catch (error) {
      console.error('❌ fetchBrandModelListAction failed:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // GET /api/admin/brand-model/:id -> { ok: true, data: BrandModel }
  fetchBrandModelByIdAction: async (id) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/admin/brand-model/${id}`, { cache: 'no-store' });
      const json: ApiResp<BrandModel> = await response.json();
      if (!response.ok || json.ok === false || !json.data) {
        throw new Error(('error' in json ? json.error : '') || 'ไม่พบข้อมูลรุ่นสินค้า');
      }
      set({ selectedBrandModel: json.data });
    } catch (error) {
      console.error('❌ fetchBrandModelByIdAction failed:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // POST /api/admin/brand-model -> { ok: true, data: BrandModel }
  createBrandModelAction: async (payload) => {
    try {
      const body: CreateBrandModelInput = {
        name: payload.name.trim().replace(/\s+/g, ' '),
        brandId: payload.brandId,
      };
      const res = await fetch('/api/admin/brand-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json: ApiResp<BrandModel> = await res.json();
      if (!res.ok || json.ok === false) {
        throw new Error(('error' in json ? json.error : '') || 'ไม่สามารถเพิ่มข้อมูลได้');
      }
      await get().fetchBrandModelListAction();
    } catch (error) {
      console.error('❌ createBrandModelAction failed:', error);
      throw error;
    }
  },

  // PUT /api/admin/brand-model/:id -> { ok: true, data: BrandModel }
  updateBrandModelAction: async (id, payload) => {
    try {
      const body: UpdateBrandModelInput = {};
      if (typeof payload.name === 'string') body.name = payload.name.trim().replace(/\s+/g, ' ');
      if (typeof payload.brandId === 'number') body.brandId = payload.brandId;

      const res = await fetch(`/api/admin/brand-model/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json: ApiResp<BrandModel> = await res.json();
      if (!res.ok || json.ok === false) {
        throw new Error(('error' in json ? json.error : '') || 'ไม่สามารถแก้ไขข้อมูลได้');
      }
      await get().fetchBrandModelListAction();
    } catch (error) {
      console.error('❌ updateBrandModelAction failed:', error);
      throw error;
    }
  },

  // DELETE /api/admin/brand-model/:id -> 204 | { ok: true, data: { id } }
  deleteBrandModelAction: async (id) => {
    try {
      const res = await fetch(`/api/admin/brand-model/${id}`, { method: 'DELETE' });

      if (res.status === 204) {
        set({ brandModelList: get().brandModelList.filter((item) => item.id !== id) });
        return;
      }

      const json: ApiResp<{ id: number }> = await res.json();
      if (!res.ok || json.ok === false) {
        throw new Error(('error' in json ? json.error : '') || 'ลบไม่สำเร็จ');
      }
      set({ brandModelList: get().brandModelList.filter((item) => item.id !== id) });
    } catch (error) {
      console.error('❌ deleteBrandModelAction failed:', error);
      throw error;
    }
  },
}));

