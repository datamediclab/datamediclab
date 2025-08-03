'use client'

import { useForm } from 'react-hook-form'
import { useEffect } from 'react'

export type BrandModelFormValues = {
  name: string
  brandId: string
}

type BrandModelFormProps = {
  mode: 'create' | 'edit'
  defaultValues?: BrandModelFormValues
  onSubmit: (data: BrandModelFormValues) => void
  brandList: { id: string; name: string }[]
}

const BrandModelForm = ({ mode, defaultValues, onSubmit, brandList }: BrandModelFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandModelFormValues>({
    defaultValues: defaultValues || { name: '', brandId: '' },
  })

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
    }
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white">ชื่อรุ่นสินค้า</label>
        <input
          type="text"
          {...register('name', { required: 'กรุณากรอกชื่อรุ่นสินค้า' })}
          className="mt-1 block w-full rounded border border-gray-300 bg-gray-800 text-white px-3 py-2 text-sm"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-white">ยี่ห้อสินค้า</label>
        <select
          {...register('brandId', { required: 'กรุณาเลือกยี่ห้อสินค้า' })}
          className="mt-1 block w-full rounded border border-gray-300 bg-gray-800 text-white px-3 py-2 text-sm"
        >
          <option value="">-- เลือกยี่ห้อ --</option>
          {brandList.map((brand) => (
            <option key={brand.id} value={brand.id} className="text-white bg-gray-800">
              {brand.name}
            </option>
          ))}
        </select>
        {errors.brandId && <p className="text-red-500 text-sm mt-1">{errors.brandId.message}</p>}
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {mode === 'edit' ? 'บันทึกรุ่นสินค้า' : 'เพิ่มรุ่นสินค้า'}
      </button>
    </form>
  )
}

export default BrandModelForm
