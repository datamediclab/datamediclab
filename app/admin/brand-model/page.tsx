'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/layouts/AdminLayout'
import { useBrandModelStore } from '@/features/brand-model/store/useBrandModelStore'
import BrandModelForm from '@/features/brand-model/components/BrandModelForm'
import BrandModelListTable from '@/features/brand-model/components/BrandModelListTable'
import { createClient } from '@/utils/supabase/client'

const BrandModelListPage = () => {
  const { setBrandModelList, setLoading } = useBrandModelStore()
  const [brandList, setBrandList] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [brandModelRes, brandRes] = await Promise.all([
          fetch('/api/brand-model'),
          fetch('/api/brand'),
        ])
        const [brandModelData, brandData] = await Promise.all([
          brandModelRes.json(),
          brandRes.json(),
        ])
        setBrandModelList(brandModelData)
        setBrandList(brandData)
      } catch (err) {
        console.error('โหลดข้อมูลไม่สำเร็จ:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [setBrandModelList, setLoading])

  const handleCreateBrandModel = async (formData: { name: string; brandId: string }) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('BrandModel').insert([formData])
      if (error) throw error
      console.log('✅ เพิ่มรุ่นสินค้าเรียบร้อย')
    } catch (err) {
      console.error('❌ บันทึกไม่สำเร็จ:', err)
    }
  }

  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">จัดการรุ่นสินค้า</h1>

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
