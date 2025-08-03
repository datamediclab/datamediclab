// features/brand/components/BrandForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { useBrandStore } from '../store/useBrandStore';

interface BrandFormProps {
  initialName?: string;
  brandId?: string;
  isEdit?: boolean;
}

const BrandForm = ({ initialName = '', brandId, isEdit = false }: BrandFormProps) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { createBrandAction, updateBrandAction } = useBrandStore();

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('กรุณากรอกชื่อแบรนด์');
      return;
    }

    try {
      setLoading(true);
      if (isEdit && brandId) {
        await updateBrandAction(brandId, name.trim());
        setSuccess('แก้ไขแบรนด์สำเร็จ');
      } else {
        await createBrandAction(name.trim());
        setSuccess('เพิ่มแบรนด์สำเร็จ');
        setName('');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('เกิดข้อผิดพลาดที่ไม่รู้จัก');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div>
        <label className="block font-medium">ชื่อแบรนด์</label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มแบรนด์'}
      </button>
    </form>
  );
};

export default BrandForm;
