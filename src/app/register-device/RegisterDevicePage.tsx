"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const RegisterDevicePage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    deviceType: 'HDD',
    deviceBrand: '',
    deviceModel: '',
    deviceSerialN: '',
    problem: '',
    currentStatus: 'รอรับอุปกรณ์จากลูกค้า',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('device_registrations').insert([formData]);
      if (error) throw error;
      router.push('/register-success');
    } catch (err: any) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการส่งข้อมูล');
    }
    setLoading(false);
  };

  return (
    <section className="min-h-[75vh] flex items-center justify-center bg-gray-100 px-6 py-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1
          className="text-4xl sm:text-5xl font-extrabold text-blue-800 mb-4 leading-tight"
          style={{ fontFamily: 'Sarabun, sans-serif' }}
        >
          ลงทะเบียนส่งอุปกรณ์
        </h1>
        <p
          className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6"
          style={{ fontFamily: 'Sarabun, sans-serif' }}
        >
          กรุณากรอกข้อมูลของคุณให้ครบถ้วน เพื่อให้ทีมงานสามารถตรวจสอบและติดต่อกลับได้รวดเร็วที่สุด
        </p>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 sm:p-8 text-left max-w-xl mx-auto"
        >
          {error && <p className="text-red-500 text-sm mb-4 text-center">❌ {error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">ชื่อ-นามสกุลผู้ส่ง</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="กรอกชื่อ-นามสกุล"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">เบอร์ติดต่อ</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="กรอกเบอร์โทร"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">อีเมล</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="example@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">ประเภทอุปกรณ์</label>
              <select
                name="deviceType"
                value={formData.deviceType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option>HDD</option>
                <option>SSD</option>
                <option>Flash Drive</option>
                <option>มือถือ</option>
                <option>อื่น ๆ</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 mb-2">ยี่ห้ออุปกรณ์</label>
            <input
              type="text"
              name="deviceBrand"
              value={formData.deviceBrand}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="กรอกยี่ห้อ เช่น WD, Seagate"
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 mb-2">รุ่นอุปกรณ์</label>
            <input
              type="text"
              name="deviceModel"
              value={formData.deviceModel}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="กรอกรุ่น เช่น Blue 1TB"
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 mb-2">Serial Number (SN)</label>
            <input
              type="text"
              name="deviceSerialN"
              value={formData.deviceSerialN}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="กรอก SN ของอุปกรณ์"
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 mb-2">รายละเอียดปัญหา</label>
            <textarea
              name="problem"
              value={formData.problem}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="อธิบายอาการหรือปัญหาที่พบ"
              required
            ></textarea>
          </div>
          <div className="text-center mt-6">
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded transition duration-300"
              disabled={loading}
            >
              {loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลลงทะเบียน'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default RegisterDevicePage;
