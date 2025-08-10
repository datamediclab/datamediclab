'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useBrandModelStore } from '@/features/brand-model/store/useBrandModelStore'
import ConfirmActionDialog from '@/components/shared/dialogs/ConfirmActionDialog'
import type { BrandRef } from '@/features/brand-model/types/types'

const BrandModelListTable = () => {
  const { brandModelList, deleteBrandModelAction } = useBrandModelStore()
  const [openConfirmId, setOpenConfirmId] = useState<number | null>(null)
  const [confirmName, setConfirmName] = useState<string>('')

  const handleConfirmDelete = async () => {
    if (openConfirmId === null) return
    try {
      await deleteBrandModelAction(openConfirmId)
    } catch (error) {
      console.error('❌ ลบรุ่นสินค้าไม่สำเร็จ:', error)
    } finally {
      setOpenConfirmId(null)
      setConfirmName('')
    }
  }

  if (!brandModelList.length) {
    return <p className="text-sm text-gray-500">ยังไม่มีรุ่นสินค้าในระบบ</p>
  }

  const sorted = brandModelList
    .slice()
    .sort((a, b) => (a.brand?.name ?? '').localeCompare(b.brand?.name ?? '') || a.name.localeCompare(b.name))

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
          {sorted.map((model) => (
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
                  onClick={() => {
                    setOpenConfirmId(model.id)
                    setConfirmName(model.name)
                  }}
                  className="text-red-600 hover:underline"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Single confirm dialog outside the map to avoid multiple instances */}
      <ConfirmActionDialog
        open={openConfirmId !== null}
        title="ยืนยันการลบรุ่นสินค้า"
        description={`คุณต้องการลบรุ่นสินค้า "${confirmName}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setOpenConfirmId(null)
          setConfirmName('')
        }}
      />
    </div>
  )
}

export default BrandModelListTable
