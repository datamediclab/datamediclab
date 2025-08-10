// app/admin/brand-model/[id]/edit/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/layouts/AdminLayout'
import { useBrandModelStore } from '@/features/brand-model/store/useBrandModelStore'
import BrandModelForm from '@/features/brand-model/components/BrandModelForm'
import type { BrandRef, BrandModelFormValues } from '@/features/brand-model/types/types'

const BrandModelEditPage = () => {
  const router = useRouter()
  const params = useParams()
  const brandModelId = typeof params?.id === 'string' ? Number(params.id) : 0

  const {
    selectedBrandModel,
    fetchBrandModelByIdAction,
    updateBrandModelAction,
    setSelectedBrandModel,
  } = useBrandModelStore()

  const [brandList, setBrandList] = useState<BrandRef[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!brandModelId) return

    const fetchData = async () => {
      try {
        // โหลดรายละเอียดรุ่นตาม id
        await fetchBrandModelByIdAction(brandModelId)

        // โหลดรายการยี่ห้อทั้งหมด (โครงสร้างมาตรฐาน { ok, data })
        const brandRes = await fetch('/api/admin/brand', { cache: 'no-store' })
        const brandJson: { ok?: boolean; data?: BrandRef[]; error?: string } = await brandRes.json()
        if (!brandRes.ok || brandJson.ok === false || !Array.isArray(brandJson.data)) {
          throw new Error(brandJson?.error || 'โหลดรายการยี่ห้อไม่สำเร็จ')
        }
        // เก็บเฉพาะฟิลด์ที่จำเป็นเพื่อใช้ใน select
        setBrandList(brandJson.data.map(({ id, name }) => ({ id, name })))
      } catch (error) {
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error)
        setErrorMessage('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      }
    }

    fetchData()
    return () => setSelectedBrandModel(null)
  }, [brandModelId, fetchBrandModelByIdAction, setSelectedBrandModel])

  const handleUpdate = async (formData: BrandModelFormValues) => {
    setErrorMessage('')
    setSuccessMessage('')
    try {
      const body: { name?: string; brandId?: number } = { name: formData.name }
      if (formData.brandId !== '') body.brandId = Number(formData.brandId)

      await updateBrandModelAction(brandModelId, body)
      setSuccessMessage('แก้ไขข้อมูลสำเร็จ')
      router.push('/admin/brand-model')
    } catch (err) {
      console.error('❌ แก้ไขไม่สำเร็จ:', err)
      setErrorMessage(err instanceof Error ? err.message : 'ไม่สามารถแก้ไขข้อมูลได้')
    }
  }

  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">แก้ไขรุ่นสินค้า</h1>

        {errorMessage && <div className="mb-4 text-red-600 font-medium">{errorMessage}</div>}
        {successMessage && <div className="mb-4 text-green-600 font-medium">{successMessage}</div>}

        {selectedBrandModel ? (
          <BrandModelForm
            mode="edit"
            defaultValues={{
              name: selectedBrandModel.name,
              brandId: selectedBrandModel.brandId, // number | '' ตาม type ฟอร์ม
            }}
            brandList={brandList}
            onSubmit={handleUpdate}
          />
        ) : (
          <p className="text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
        )}
      </div>
    </AdminLayout>
  )
}

export default BrandModelEditPage
