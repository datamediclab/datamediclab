import { useState, useEffect } from 'react';
import DeviceForm from '../components/DeviceForm';
import { useRouter } from 'next/router';

const CreateDevicePage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/device/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to create device');

      const result = await res.json();
      router.push('/device'); // กลับไปหน้ารายการ device หลังสร้างสำเร็จ
    } catch (error) {
      console.error('[CreateDevicePage] Error:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">เพิ่มอุปกรณ์ใหม่</h1>
      <DeviceForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default CreateDevicePage;
