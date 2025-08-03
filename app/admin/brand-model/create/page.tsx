'use client'

import { useRouter } from 'next/navigation'
import BrandModelForm, { BrandModelFormValues } from '@/features/brand-model/components/BrandModelForm'
import { createBrandModel } from '@/features/brandModel/api/brandModelApi'

const CreateBrandModelPage = () => {
  const router = useRouter()

  const handleCreate = async (data: BrandModelFormValues) => {
    try {
      await createBrandModel(data)
      router.push('/admin/brandModel')
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการสร้างรุ่นสินค้า:', error)
      // TODO: แสดงข้อความแจ้งเตือนใน UI
    }
  }

  return (
    <div className="max-w-xl mx-auto py-6">
      <h1 className="text-xl font-semibold mb-4">เพิ่มรุ่นสินค้า</h1>
      <BrandModelForm mode="create" onSubmit={handleCreate} />
    </div>
  )
}

export default CreateBrandModelPage
