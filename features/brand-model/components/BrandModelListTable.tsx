'use client'

import Link from 'next/link'
import { useBrandModelStore } from '@/features/brand-model/store/useBrandModelStore'

const BrandModelListTable = () => {
  const { brandModelList } = useBrandModelStore()

  if (!brandModelList.length) {
    return <p className="text-sm text-gray-500">ยังไม่มีรุ่นสินค้าในระบบ</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border">
        <thead className="bg-zinc-100">
          <tr>
            <th className="border px-3 py-2 text-left">ชื่อรุ่น</th>
            <th className="border px-3 py-2 text-left">รหัสยี่ห้อ</th>
            <th className="border px-3 py-2 text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {brandModelList.map((model) => (
            <tr key={model.id} className="border-t">
              <td className="px-3 py-2">{model.name}</td>
              <td className="px-3 py-2">{model.brandId}</td>
              <td className="px-3 py-2 text-center">
                <Link
                  href={`/admin/brand-model/${model.id}/edit`}
                  className="text-blue-600 hover:underline"
                >
                  แก้ไข
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BrandModelListTable
