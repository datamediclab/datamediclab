// features/brand/components/BrandForm.tsx

'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import type { Brand } from '@/features/brand/types/types';

// กำหนด Type สำหรับข้อมูลในฟอร์ม
interface FormInputs {
  name: string;
}

// กำหนด Type สำหรับ Props ของคอมโพเนนต์
export interface BrandFormProps {
  mode: 'create' | 'edit';
  onSubmit: (name: string) => Promise<void>;
  initialData?: Pick<Brand, 'name'>; // ใช้ type จาก Brand
}

const BrandForm = ({ mode, onSubmit, initialData }: BrandFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInputs>({
    defaultValues: {
      name: initialData?.name || '',
    },
  });

  const processSubmit: SubmitHandler<FormInputs> = async (data) => {
    await onSubmit(data.name);
    if (mode === 'create') {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4 rounded-lg shadow-md">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          ชื่อแบรนด์
        </label>
        <input
          id="name"
          type="text"
          {...register('name', { required: 'กรุณากรอกชื่อแบรนด์' })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        />
        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
      </div>
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'กำลังบันทึก...' : mode === 'create' ? 'เพิ่มแบรนด์' : 'บันทึกการเปลี่ยนแปลง'}
        </button>
      </div>
    </form>
  );
};

export default BrandForm;
