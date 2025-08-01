"use client";

import Link from "next/link";
import {
  FaTools,
  FaSearch,
  FaBoxOpen,
  FaFileAlt,
  FaCheckCircle,
  FaShippingFast,
} from "react-icons/fa";

const ServicesPage = () => {
  return (
    <section className="flex flex-col items-center justify-start bg-gray-100 px-4 py-16 w-full">
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">
          ส่งกู้ข้อมูลจากอุปกรณ์ของคุณ
        </h1>
        <p className="text-gray-800 text-base md:text-lg leading-relaxed">
          บริการกู้ข้อมูลจากฮาร์ดดิสก์หรือสื่อจัดเก็บอื่น ๆ ที่มีปัญหา เช่น
          HDD, SSD, Flash Drive, มือถือ ฯลฯ วิเคราะห์เบื้องต้นฟรี ไม่มีค่าใช้จ่าย
        </p>
      </div>

      {/* จุดเด่น */}
      <div className="bg-white shadow-md rounded-lg p-6 max-w-xl w-full mb-12">
        <h2 className="text-lg md:text-xl font-semibold text-blue-800 mb-4">
          จุดเด่นของบริการเรา
        </h2>
        <ul className="text-left text-gray-800 text-sm md:text-base list-disc list-inside space-y-2">
          <li>ไม่อ่าน ไม่คิดเงิน</li>
          <li>วิเคราะห์ฟรี ไม่มีค่าใช้จ่ายล่วงหน้า</li>
          <li>รองรับสื่อเก็บข้อมูลหลากหลายรูปแบบ</li>
          <li>ใช้อุปกรณ์มาตรฐานระดับสากลในการกู้</li>
          <li>ทีมงานมีประสบการณ์สูง รักษาความลับ 100%</li>
        </ul>
      </div>

      {/* ขั้นตอนการส่งกู้ข้อมูล */}
      <div className="max-w-5xl w-full mb-16">
        <h3 className="text-xl font-semibold text-blue-800 text-center mb-8">
          ขั้นตอนการส่งกู้ข้อมูล
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <FaFileAlt className="text-4xl text-blue-700 mb-2" />
            <p className="text-sm font-medium text-gray-800">ลงทะเบียนอุปกรณ์</p>
          </div>
          <div className="flex flex-col items-center">
            <FaBoxOpen className="text-4xl text-blue-700 mb-2" />
            <p className="text-sm font-medium text-gray-800">จัดส่งถึงห้องแล็บ</p>
          </div>
          <div className="flex flex-col items-center">
            <FaSearch className="text-4xl text-blue-700 mb-2" />
            <p className="text-sm font-medium text-gray-800">วิเคราะห์อาการ</p>
          </div>
          <div className="flex flex-col items-center">
            <FaTools className="text-4xl text-blue-700 mb-2" />
            <p className="text-sm font-medium text-gray-800">ดำเนินการกู้ข้อมูล</p>
          </div>
          <div className="flex flex-col items-center">
            <FaCheckCircle className="text-4xl text-blue-700 mb-2" />
            <p className="text-sm font-medium text-gray-800">แจ้งผล + รายการไฟล์</p>
          </div>
          <div className="flex flex-col items-center">
            <FaShippingFast className="text-4xl text-blue-700 mb-2" />
            <p className="text-sm font-medium text-gray-800">ส่งคืนพร้อมข้อมูล</p>
          </div>
        </div>
      </div>

      {/* ปุ่มลงทะเบียน */}
      <div className="max-w-xl w-full text-center">
        <h3 className="text-lg md:text-xl font-semibold text-blue-800 mb-3">
          พร้อมเริ่มกู้ข้อมูลของคุณแล้วใช่ไหม?
        </h3>
      
        <Link
          href="/register-device"
          className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded shadow-md"
        >
          ลงทะเบียนส่งอุปกรณ์
        </Link>
      </div>
    </section>
  );
};

export default ServicesPage;
