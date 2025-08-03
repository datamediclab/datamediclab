// brand/components/BrandListTable.tsx

'use client';

import { useEffect, useState } from 'react';
import { useBrandStore } from '../store/useBrandStore';
import ConfirmActionDialog from '@/components/shared/dialogs/ConfirmActionDialog';
import Link from 'next/link';

const BrandListTable = () => {
  const { brandList, fetchBrandListAction, deleteBrand } = useBrandStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchBrandListAction();
  }, [fetchBrandListAction]);

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedId) {
      await deleteBrand(selectedId);
    }
    setSelectedId(null);
    setShowConfirm(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-lg font-semibold mb-4 text-white">รายการแบรนด์</h2>
      {brandList.length === 0 ? (
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
            {brandList.map((brand) => (
              <tr key={brand.id}>
                <td className="border px-3 py-2">{brand.name}</td>
                <td className="border px-3 py-2 text-center space-x-2">

                  <Link href={`/admin/brand/edit/${brand.id}`}
                    className="text-blue-400 hover:underline">
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
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default BrandListTable;



