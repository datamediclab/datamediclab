// datamediclab/features/brand/types/types.ts
export interface Brand {
    id: number;
    name: string;
    createdAt: string; // ISO date string
    updatedAt?: string; // optional ISO date string
  }
  
  export interface BrandStore {
    brandList: Brand[];
    isLoading: boolean;
    error: string | null;
  
    fetchBrandListAction: () => Promise<void>;
    getBrandByIdAction: (id: number) => Promise<Brand | null>;
    createBrandAction: (name: string) => Promise<void>;
    updateBrandAction: (id: number, data: { name: string }) => Promise<void>;
    deleteBrand: (id: number) => Promise<void>;
  }
  