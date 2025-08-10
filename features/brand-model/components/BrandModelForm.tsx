'use client'

import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import type { BrandRef, BrandModelFormValues } from '@/features/brand-model/types/types'

type BrandModelFormProps = {
  mode: 'create' | 'edit'
  defaultValues?: BrandModelFormValues
  onSubmit: (data: BrandModelFormValues) => void
  brandList: BrandRef[]
}

const BrandModelForm = ({ mode, defaultValues, onSubmit, brandList }: BrandModelFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }, // ✅ เพิ่ม isSubmitting
  } = useForm<BrandModelFormValues>({
    // ใช้ type กลางจากไฟล์ types: { name: string; brandId: number | '' }
    defaultValues: defaultValues ?? { name: '', brandId: '' },
  })

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white">ชื่อรุ่นสินค้า</label>
        <input
          type="text"
          {...register('name', {
            required: 'กรุณากรอกชื่อรุ่นสินค้า',
            maxLength: { value: 120, message: 'ชื่อยาวเกิน 120 ตัวอักษร' },
            // ✅ normalize ช่องว่างซ้ำ
            setValueAs: (v) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : ''),
          })}
          className="mt-1 block w-full rounded border border-gray-300 bg-gray-800 text-white px-3 py-2 text-sm"
          disabled={isSubmitting}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-white">ยี่ห้อสินค้า</label>
        <select
          {...register('brandId', {
            required: 'กรุณาเลือกยี่ห้อสินค้า',
            // ✅ แปลงค่าจาก select (string) → number | ''
            setValueAs: (v) => (v === '' ? '' : Number(v)),
            validate: (v) =>
              (v !== '' && Number.isFinite(v as number)) || 'กรุณาเลือกยี่ห้อสินค้า',
          })}
          className="mt-1 block w-full rounded border border-gray-300 bg-gray-800 text-white px-3 py-2 text-sm"
          disabled={isSubmitting}
        >
          <option value="">-- เลือกยี่ห้อ --</option>
          {brandList.map((brand) => (
            <option key={brand.id} value={brand.id} className="text-white bg-gray-800">
              {brand.name}
            </option>
          ))}
        </select>
        {errors.brandId && (
          <p className="text-red-500 text-sm mt-1">{errors.brandId.message as string}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'กำลังบันทึก...' : mode === 'edit' ? 'บันทึกรุ่นสินค้า' : 'เพิ่มรุ่นสินค้า'}
      </button>
    </form>
  )
}

export default BrandModelForm
