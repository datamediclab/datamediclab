

// brand/page.tsx

'use client';

import AdminLayout from '@/layouts/AdminLayout';
import { useEffect } from 'react';


import BrandForm from '@/features/brand/components/BrandForm';
import BrandListTable from '@/features/brand/components/BrandListTable';
import { useBrandStore } from '@/features/brand/store/useBrandStore';


const BrandPage = () => {
  const { fetchBrandListAction } = useBrandStore();

  useEffect(() => {
    fetchBrandListAction();
  }, [fetchBrandListAction]);

  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">จัดการ Brand</h1>

        <div className="mb-6">
          <BrandForm />
        </div>

        <BrandListTable />
      </div>
    </AdminLayout>
  );
};

export default BrandPage;


