// app/register-device/page.tsx

"use client";

import RegisterDeviceForm from '@/features/register-device/components/RegisterDeviceForm';

export default function Page() {
  return (
    //<section className="py-8 px-4 ">
    <section className="flex flex-col items-center justify-start bg-gray-100 px-4 py-16 w-full">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">
          ลงทะเบียนส่งอุปกรณ์
        </h1>
        <p className="text-sm text-blue-800  mb-6">
          กรอกข้อมูลลูกค้าและอุปกรณ์ให้ครบถ้วน ระบบจะแสดงประวัติโดยอัตโนมัติเมื่อเลือก “ลูกค้าเก่า”.
        </p>
        <RegisterDeviceForm />
      </div>
    </section>
  );
}
