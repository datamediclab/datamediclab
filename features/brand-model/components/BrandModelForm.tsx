'use client'

import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import type { BrandRef, BrandModelFormValues } from '@/features/brand-model/types/types'

type BrandModelFormProps = {
  mode: 'create' | 'edit'
  defaultValues?: BrandModelFormValues
  onSubmit: (data: BrandModelFormValues) => Promise<void> | void
  brandList: BrandRef[]
}

const BrandModelForm = ({ mode, defaultValues, onSubmit, brandList }: BrandModelFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BrandModelFormValues>({
    defaultValues: defaultValues ?? { name: '', brandId: '' },
  })

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmitInternal = async (data: BrandModelFormValues) => {
    await Promise.resolve(onSubmit(data))
    if (mode === 'create') {
      reset({ name: '', brandId: '' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitInternal)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white">ชื่อรุ่นสินค้า</label>
        <input
          type="text"
          {...register('name', {
            required: 'กรุณากรอกชื่อรุ่นสินค้า',
            maxLength: { value: 120, message: 'ชื่อยาวเกิน 120 ตัวอักษร' },
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
