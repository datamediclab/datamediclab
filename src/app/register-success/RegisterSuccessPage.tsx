"use client";

import Link from "next/link";

const RegisterSuccessPage = () => {
  return (
    <section className="min-h-[75vh] flex items-center justify-center bg-gray-100 px-6 py-12">
      <div className="text-center max-w-2xl mx-auto">
        <img
          src="/logo.png"
          alt="Data Medic Lab Logo"
          className="w-28 h-auto mx-auto mb-6"
        />
        <h1
          className="text-4xl sm:text-5xl font-extrabold text-green-700 mb-4 leading-tight"
          style={{ fontFamily: 'Sarabun, sans-serif' }}
        >
          ✅ ส่งข้อมูลเรียบร้อยแล้ว
        </h1>
        <p
          className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6"
          style={{ fontFamily: 'Sarabun, sans-serif' }}
        >
          ทีมงานจะติดต่อคุณกลับภายใน 24 ชั่วโมง
        </p>
        <div className="text-center">
          <Link
            href="/"
            className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded transition duration-300"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RegisterSuccessPage;
