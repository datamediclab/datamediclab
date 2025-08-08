
// brand/page.tsx

'use client';

import AdminLayout from '@/layouts/AdminLayout';
import { useEffect, useState } from 'react';

import BrandForm from '@/features/brand/components/BrandForm';
import BrandListTable from '@/features/brand/components/BrandListTable';
import { useBrandStore } from '@/features/brand/store/useBrandStore';

const BrandPage = () => {
  const { fetchBrandListAction, createBrandAction } = useBrandStore();

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchBrandListAction();
  }, [fetchBrandListAction]);

  const handleCreateBrand = async (name: string) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await createBrandAction(name);
      setSuccessMessage('เพิ่มแบรนด์สำเร็จแล้ว');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('เกิดข้อผิดพลาด');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">จัดการ Brand</h1>

        {errorMessage && (
          <div className="mb-4 text-red-600 font-medium">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="mb-4 text-green-600 font-medium">{successMessage}</div>
        )}

        <div className="mb-6 ">
          <BrandForm mode="create" onSubmit={handleCreateBrand} />
        </div>

        <BrandListTable />
      </div>
    </AdminLayout>
  );
};

export default BrandPage;

