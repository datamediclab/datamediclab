// brand/components/BrandListTable.tsx

'use client';

import { useEffect, useState } from 'react';
import type { Brand } from '@/features/brand/types/types';
import { useBrandStore } from '../store/useBrandStore';
import ConfirmActionDialog from '@/components/shared/dialogs/ConfirmActionDialog';
import Link from 'next/link';

const BrandListTable = () => {
  const { brandList, fetchBrandListAction, deleteBrand, isLoading, error } = useBrandStore();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchBrandListAction();
  }, [fetchBrandListAction]);

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedId !== null) {
      await deleteBrand(selectedId);
    }
    setSelectedId(null);
    setShowConfirm(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">รายการแบรนด์</h2>
        <button
          onClick={() => fetchBrandListAction()}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          รีเฟรช
        </button>
      </div>
      {isLoading && <p className="text-gray-400">กำลังโหลดข้อมูล...</p>}
      {error && <p className="text-red-500">เกิดข้อผิดพลาด: {error}</p>}
      {!isLoading && brandList.length === 0 ? (
        <p className="text-gray-400">ยังไม่มีข้อมูลแบรนด์</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="border px-3 py-2 text-left">ชื่อแบรนด์</th>
              <th className="border px-3 py-2 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {brandList
              .slice()
              .sort((a: Brand, b: Brand) => a.name.localeCompare(b.name))
              .map((brand) => (
                <tr key={brand.id}>
                  <td className="border px-3 py-2">{brand.name}</td>
                  <td className="border px-3 py-2 text-center space-x-2">
                    <Link
                      href={`/admin/brand/edit/${brand.id}`}
                      className="text-blue-400 hover:underline"
                    >
                      แก้ไข
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(brand.id)}
                      className="text-red-500 hover:underline"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      <ConfirmActionDialog
        open={showConfirm}
        title="ยืนยันการลบแบรนด์"
        description="คุณต้องการลบแบรนด์นี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setSelectedId(null);
          setShowConfirm(false);
        }}
      />
    </div>
  );
};

export default BrandListTable;
