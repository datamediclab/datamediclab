// app/admin/brand-model/page.tsx

'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/layouts/AdminLayout'
import { useBrandModelStore } from '@/features/brand-model/store/useBrandModelStore'
import BrandModelForm from '@/features/brand-model/components/BrandModelForm'
import BrandModelListTable from '@/features/brand-model/components/BrandModelListTable'
import type { BrandRef, BrandModelFormValues } from '@/features/brand-model/types/types'

const BrandModelListPage = () => {
  const { fetchBrandModelListAction, createBrandModelAction } = useBrandModelStore()

  const [brandList, setBrandList] = useState<BrandRef[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchBrandModelListAction()

        const brandRes = await fetch('/api/admin/brand')
        if (!brandRes.ok) throw new Error('ไม่สามารถโหลดข้อมูลแบรนด์ได้')
        const brandData = await brandRes.json()
        setBrandList(brandData)
      } catch (err) {
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', err)
        setErrorMessage('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      }
    }
    fetchData()
  }, [fetchBrandModelListAction])

  const handleCreateBrandModel = async (formData: BrandModelFormValues) => {
    setErrorMessage('')
    setSuccessMessage('')
    try {
      // formData.brandId อาจเป็น '' (string ว่าง) มาจาก <select>
      const brandIdValue =
        typeof formData.brandId === 'string'
          ? Number(formData.brandId)
          : formData.brandId

      if (!brandIdValue || Number.isNaN(brandIdValue)) {
        setErrorMessage('กรุณาเลือกแบรนด์')
        return
      }

      const name = (formData.name || '').trim()
      if (!name) {
        setErrorMessage('กรุณากรอกชื่อรุ่นสินค้า')
        return
      }

      await createBrandModelAction({
        name,
        brandId: brandIdValue,
      })
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
            brandList={brandList}
          />
        </div>

        <BrandModelListTable />
      </div>
    </AdminLayout>
  )
}

export default BrandModelListPage
