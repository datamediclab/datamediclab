// features/brand-model/useBrandModelStore

import { create } from 'zustand'

interface Brand {
  id: number;
  name: string;
}

interface BrandModel {
  id: number;
  name: string;
  brandId: number;
  createdAt: string;
  updatedAt: string;
  brand: Brand;
}

interface BrandModelStore {
  brandModelList: BrandModel[]
  selectedBrandModel: BrandModel | null
  loading: boolean
  setBrandModelList: (data: BrandModel[]) => void
  setSelectedBrandModel: (data: BrandModel | null) => void
  setLoading: (loading: boolean) => void
  fetchBrandModelListAction: () => Promise<void>
  fetchBrandModelByIdAction: (id: number) => Promise<void>
  createBrandModelAction: (payload: { name: string; brandId: number }) => Promise<void>
  updateBrandModelAction: (id: number, payload: { name: string; brandId: number }) => Promise<void>
  deleteBrandModelAction: (id: number) => Promise<void>
}

export const useBrandModelStore = create<BrandModelStore>((set, get) => ({
  brandModelList: [],
  selectedBrandModel: null,
  loading: false,

  setBrandModelList: (data) => set({ brandModelList: data }),
  setSelectedBrandModel: (data) => set({ selectedBrandModel: data }),
  setLoading: (loading) => set({ loading }),

  fetchBrandModelListAction: async () => {
    set({ loading: true })
    try {
      const response = await fetch('/api/admin/brand-model');
      if (!response.ok) {
        throw new Error('ไม่สามารถโหลดข้อมูลรุ่นของแบรนด์ได้');
      }
      const data = await response.json();
      set({ brandModelList: data });
    } catch (error) {
      console.error('❌ fetchBrandModelListAction failed:', error);
      throw error;
    } finally {
      set({ loading: false })
    }
  },

  fetchBrandModelByIdAction: async (id: number) => {
    set({ loading: true })
    try {
      const response = await fetch(`/api/admin/brand-model/${id}`);
      if (!response.ok) {
        throw new Error('ไม่พบข้อมูลรุ่นสินค้า');
      }
      const data = await response.json();
      set({ selectedBrandModel: data });
    } catch (error) {
      console.error('❌ fetchBrandModelByIdAction failed:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createBrandModelAction: async ({ name, brandId }) => {
    try {
      const response = await fetch('/api/admin/brand-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, brandId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || 'ไม่สามารถเพิ่มข้อมูลได้');
      }
      await get().fetchBrandModelListAction();
    } catch (error) {
      console.error('❌ createBrandModelAction failed:', error);
      throw error;
    }
  },

  updateBrandModelAction: async (id, { name, brandId }) => {
    try {
      const response = await fetch(`/api/admin/brand-model/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, brandId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || 'ไม่สามารถแก้ไขข้อมูลได้');
      }
      await get().fetchBrandModelListAction();
    } catch (error) {
      console.error('❌ updateBrandModelAction failed:', error);
      throw error;
    }
  },

  deleteBrandModelAction: async (id: number) => {
    try {
      const response = await fetch(`/api/admin/brand-model/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ลบไม่สำเร็จ');
      }
      const updatedList = get().brandModelList.filter(item => item.id !== id);
      set({ brandModelList: updatedList });
    } catch (error) {
      console.error('❌ deleteBrandModelAction failed:', error);
      throw error;
    }
  },
}));