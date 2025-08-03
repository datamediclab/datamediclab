"use client";

import { useEffect } from "react";
import { useBrandStore } from "../store/useBrandStore";

const ListBrandPage = () => {
  const { brandList, fetchBrandListAction, deleteBrand } = useBrandStore();

  useEffect(() => {
    fetchBrandListAction();
  }, [fetchBrandListAction]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">รายการแบรนด์</h1>

      <div className="mb-4">
        <a
          href="/admin/brand/create"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + เพิ่มแบรนด์
        </a>
      </div>

      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">ชื่อแบรนด์</th>
            <th className="py-2 px-4 border-b text-left">วันที่เพิ่ม</th>
            <th className="py-2 px-4 border-b">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {brandList.map((brand) => (
            <tr key={brand.id}>
              <td className="py-2 px-4 border-b">{brand.name}</td>
              <td className="py-2 px-4 border-b text-sm text-gray-600">
                {new Date(brand.createdAt).toLocaleDateString("th-TH")}
              </td>
              <td className="py-2 px-4 border-b text-center space-x-2">
                <a
                  href={`/brand/edit/${brand.id}`}
                  className="text-blue-600 hover:underline"
                >
                  แก้ไข
                </a>
                <button
                  onClick={() => {
                    if (confirm("คุณต้องการลบแบรนด์นี้ใช่หรือไม่?")) {
                      deleteBrand(brand.id);
                    }
                  }}
                  className="text-red-600 hover:underline"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
          {brandList.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center py-4 text-gray-500">
                ไม่พบข้อมูลแบรนด์
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListBrandPage;
