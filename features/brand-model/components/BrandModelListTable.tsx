'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useBrandModelStore } from '@/features/brand-model/store/useBrandModelStore'
import ConfirmActionDialog from '@/components/shared/dialogs/ConfirmActionDialog'

const BrandModelListTable = () => {
  const { brandModelList, deleteBrandModelAction } = useBrandModelStore()
  const [openConfirmId, setOpenConfirmId] = useState<number | null>(null)

  const handleConfirmDelete = async () => {
    if (!openConfirmId) return
    try {
      await deleteBrandModelAction(openConfirmId)
      setOpenConfirmId(null)
    } catch (error) {
      console.error('❌ ลบรุ่นสินค้าไม่สำเร็จ:', error)
    }
  }

  if (!brandModelList.length) {
    return <p className="text-sm text-gray-500">ยังไม่มีรุ่นสินค้าในระบบ</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border">
        <thead className="bg-zinc-100">
          <tr>
            <th className="border px-3 py-2 text-left">ชื่อยี่ห้อ</th>
            <th className="border px-3 py-2 text-left">ชื่อรุ่น</th>
            <th className="border px-3 py-2 text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {brandModelList.map((model) => (
            <tr key={model.id} className="border-t">
              <td className="px-3 py-2">{model.brand?.name || '-'}</td>
              <td className="px-3 py-2">{model.name}</td>
              <td className="px-3 py-2 text-center space-x-4">
                <Link
                  href={`/admin/brand-model/${model.id}/edit`}
                  className="text-blue-600 hover:underline"
                >
                  แก้ไข
                </Link>
                <button
                  onClick={() => setOpenConfirmId(model.id)}
                  className="text-red-600 hover:underline"
                >
                  ลบ
                </button>
                <ConfirmActionDialog
                  open={openConfirmId === model.id}
                  title="ยืนยันการลบ"
                  description={`คุณต้องการลบรุ่นสินค้า "${model.name}" ใช่หรือไม่?`}
                  onConfirm={handleConfirmDelete}
                  onCancel={() => setOpenConfirmId(null)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BrandModelListTable

