"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const RegisterDevicePage = () => {
  const [brandList, setBrandList] = useState<{ id: string; name: string }[]>([]);
  

  

  const router = useRouter();
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const [deviceData, setDeviceData] = useState({
    type: 'HDD',
    brand_id: '',
    model: '',
    serialNumber: '',
    problem: '',
    currentStatus: 'รอรับอุปกรณ์จากลูกค้า',
    created_at: new Date().toISOString(),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone')
        .order('created_at', { ascending: false });
      if (!error && data) setCustomerList(data);
    };

    const fetchBrands = async () => {
      const { data, error } = await supabase
        .from('Brand')
        .select('id, name')
        .order('name', { ascending: true });
      if (!error && data) {
        setBrandList(data);
      }
    };

    if (!isNewCustomer) fetchCustomers();
    fetchBrands();
  }, [isNewCustomer]);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeviceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDeviceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let customerId = '';

      if (isNewCustomer) {
        const { data: inserted, error: customerError } = await supabase
          .from('customers')
          .insert([{ ...customerData }])
          .select()
          .single();
        if (customerError) throw customerError;
        customerId = inserted.id;
      } else {
        customerId = selectedCustomerId;
      }

      const { error: deviceError } = await supabase.from('devices').insert([
        {
          ...deviceData,
          customer_id: customerId,
        },
      ]);
      if (deviceError) throw deviceError;
      router.push('/register-success');
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('เกิดข้อผิดพลาดในการส่งข้อมูล');
      }
    }
    setLoading(false);
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100 px-6 py-12">
      <div className="text-center w-full max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-800 mb-2 leading-tight" style={{ fontFamily: 'Sarabun, sans-serif' }}>
          ลงทะเบียนส่งอุปกรณ์
        </h1>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-8" style={{ fontFamily: 'Sarabun, sans-serif' }}>
          กรุณากรอกข้อมูลของคุณให้ครบถ้วน เพื่อให้ทีมงานสามารถตรวจสอบและติดต่อกลับได้รวดเร็วที่สุด
        </p>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl px-6 py-8 text-left w-full">
          {error && <p className="text-red-500 text-sm mb-4 text-center">❌ {error}</p>}

          <div className="mb-6 flex justify-center gap-6">
            <label className={`inline-flex items-center font-semibold text-base transition-colors ${isNewCustomer ? 'text-blue-800' : 'text-gray-500'}`}>
              <input type="radio" checked={isNewCustomer} onChange={() => setIsNewCustomer(true)} className="mr-2" />
              ลูกค้าใหม่
            </label>
            <label className={`inline-flex items-center font-semibold text-base transition-colors ${!isNewCustomer ? 'text-blue-800' : 'text-gray-500'}`}>
              <input type="radio" checked={!isNewCustomer} onChange={() => setIsNewCustomer(false)} className="mr-2" />
              ลูกค้าเก่า
            </label>
          </div>

          <h2 className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลลูกค้า</h2>

          {isNewCustomer ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="sm:col-span-1">
                <label className="block text-gray-700 mb-2">ชื่อ-นามสกุล</label>
                <input type="text" name="name" value={customerData.name} onChange={handleCustomerChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="กรอกชื่อ-นามสกุล" required />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-gray-700 mb-2">เบอร์โทร</label>
                <input type="tel" name="phone" value={customerData.phone} onChange={handleCustomerChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="กรอกเบอร์โทร" required />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-gray-700 mb-2">อีเมล</label>
                <input type="email" name="email" value={customerData.email} onChange={handleCustomerChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="example@email.com" required />
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">เลือกลูกค้า</label>
              <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" required>
                <option value="">-- เลือกลูกค้า --</option>
                {customerList.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>
          )}

          <h2 className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลอุปกรณ์</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">ประเภทอุปกรณ์</label>
              <select name="type" value={deviceData.type} onChange={handleDeviceChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
                <option>HDD</option>
                <option>SSD</option>
                <option>Flash Drive</option>
                <option>มือถือ</option>
                <option>อื่น ๆ</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">ยี่ห้อ</label>
              <select
                name="brand_id"
                value={deviceData.brand_id}
                onChange={handleDeviceChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">-- เลือกยี่ห้อ --</option>
                {brandList.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              
            </div>
            <div>
              <label className="block text-gray-700 mb-2">รุ่น</label>
              <input type="text" name="model" value={deviceData.model} onChange={handleDeviceChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="Blue 1TB" />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Serial Number</label>
              <input type="text" name="serialNumber" value={deviceData.serialNumber} onChange={handleDeviceChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="SN123456" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-700 mb-2 mt-4">รายละเอียดปัญหา</label>
              <textarea name="problem" value={deviceData.problem} onChange={handleDeviceChange} rows={4} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="อธิบายอาการที่พบ เช่น เสียบแล้วไม่หมุน เสียงดัง กดแล้วไม่เจอข้อมูล" required></textarea>
            </div>
          </div>

          <div className="text-center mt-8">
            <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded text-lg transition duration-300" disabled={loading}>
              {loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลลงทะเบียน'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default RegisterDevicePage;

