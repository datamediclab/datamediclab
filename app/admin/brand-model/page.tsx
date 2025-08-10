// app/admin/brand-model/page.tsx

'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/layouts/AdminLayout'
import { useBrandModelStore } from '@/features/brand-model/store/useBrandModelStore'
import BrandModelForm from '@/features/brand-model/components/BrandModelForm'
import BrandModelListTable from '@/features/brand-model/components/BrandModelListTable'
import type { BrandRef, BrandModelFormValues } from '@/features/brand-model/types/types'
import { useBrandStore } from '@/features/brand/store/useBrandStore'

const BrandModelListPage = () => {
  const { fetchBrandModelListAction, createBrandModelAction } = useBrandModelStore()
  const { brandList, fetchBrandListAction } = useBrandStore()

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const boot = async () => {
      try {
        await Promise.all([
          fetchBrandModelListAction(),
          fetchBrandListAction(), // โหลดแบรนด์ผ่าน Store กลาง
        ])
      } catch (err) {
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', err)
        setErrorMessage('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      }
    }
    boot()
  }, [fetchBrandModelListAction, fetchBrandListAction])

  const handleCreateBrandModel = async (formData: BrandModelFormValues) => {
    setErrorMessage('')
    setSuccessMessage('')
    try {
      const brandIdValue =
        typeof formData.brandId === 'string' ? Number(formData.brandId) : formData.brandId
      if (!brandIdValue || Number.isNaN(brandIdValue)) {
        setErrorMessage('กรุณาเลือกแบรนด์')
        return
      }
      const name = (formData.name || '').trim()
      if (!name) {
        setErrorMessage('กรุณากรอกชื่อรุ่นสินค้า')
        return
      }
      await createBrandModelAction({ name, brandId: brandIdValue })
      setSuccessMessage('เพิ่มรุ่นสินค้าเรียบร้อยแล้ว')
      await fetchBrandModelListAction()
    } catch (err) {
      console.error('❌ บันทึกไม่สำเร็จ:', err)
      setErrorMessage(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    }
  }

  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">จัดการรุ่นสินค้า</h1>

        {errorMessage && (
          <div className="mb-4 text-red-600 font-medium">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="mb-4 text-green-600 font-medium">{successMessage}</div>
        )}

        <div className="mb-6">
          <BrandModelForm
            mode="create"
            onSubmit={handleCreateBrandModel}
            brandList={brandList as BrandRef[]}
          />
        </div>

        <BrandModelListTable />
      </div>
    </AdminLayout>
  )
}

export default BrandModelListPage
