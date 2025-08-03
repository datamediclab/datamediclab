import { create } from 'zustand'

interface BrandModel {
  id: string
  name: string
  brandId: string
  createdAt: string
  updatedAt: string
}

interface BrandModelStore {
  brandModelList: BrandModel[]
  selectedBrandModel: BrandModel | null
  loading: boolean
  setBrandModelList: (data: BrandModel[]) => void
  setSelectedBrandModel: (data: BrandModel | null) => void
  setLoading: (loading: boolean) => void
}

export const useBrandModelStore = create<BrandModelStore>((set) => ({
  brandModelList: [],
  selectedBrandModel: null,
  loading: false,

  setBrandModelList: (data) => set({ brandModelList: data }),
  setSelectedBrandModel: (data) => set({ selectedBrandModel: data }),
  setLoading: (loading) => set({ loading }),
}))
