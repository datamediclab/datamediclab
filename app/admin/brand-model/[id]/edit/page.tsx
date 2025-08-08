// app/admin/brand-model/[id]/edit/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/layouts/AdminLayout'
import { useBrandModelStore } from '@/features/brand-model/store/useBrandModelStore'
import BrandModelForm from '@/features/brand-model/components/BrandModelForm'

const BrandModelEditPage = () => {
  const router = useRouter()
  const params = useParams()
  const brandModelId = typeof params?.id === 'string' ? params.id : ''

  const {
    selectedBrandModel,
    fetchBrandModelByIdAction,
    updateBrandModelAction,
    setSelectedBrandModel,
  } = useBrandModelStore()

  const [brandList, setBrandList] = useState<{ id: string; name: string }[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!brandModelId) return

    const fetchData = async () => {
      try {
        await fetchBrandModelByIdAction(Number(brandModelId))

        const brandRes = await fetch('/api/admin/brand')
        const brandData = await brandRes.json()
        setBrandList(brandData)
      } catch (error) {
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error)
        setErrorMessage('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      }
    }

    fetchData()

    return () => setSelectedBrandModel(null)
  }, [brandModelId, fetchBrandModelByIdAction, setSelectedBrandModel])

  const handleUpdate = async (formData: { name: string; brandId: string }) => {
    setErrorMessage('')
    setSuccessMessage('')
    try {
      await updateBrandModelAction(Number(brandModelId), {
        name: formData.name,
        brandId: Number(formData.brandId),
      })
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

        {errorMessage && (
          <div className="mb-4 text-red-600 font-medium">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="mb-4 text-green-600 font-medium">{successMessage}</div>
        )}

        {selectedBrandModel ? (
          <BrandModelForm
            mode="edit"
            defaultValues={{
              ...selectedBrandModel,
              brandId: selectedBrandModel.brandId.toString()
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

