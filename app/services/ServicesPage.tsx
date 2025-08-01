import Link from "next/link";
import Image from "next/image";

const ServicesPage = () => {
  return (
    <section className="min-h-[75vh] flex items-center justify-center bg-gray-100 px-6 py-12">
      <div className="text-center max-w-2xl mx-auto">
        <Image
          src="/logo.png"
          alt="Data Medic Lab Logo"
          width={112}
          height={112}
          className="mx-auto mb-6"
        />
        <h1
          className="text-4xl sm:text-5xl font-extrabold text-blue-800 mb-4 leading-tight"
          style={{ fontFamily: 'Sarabun, sans-serif' }}
        >
          บริการกู้ข้อมูล
        </h1>
        <p
          className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6"
          style={{ fontFamily: 'Sarabun, sans-serif' }}
        >
          รับกู้ข้อมูลจากฮาร์ดดิสก์ที่มีปัญหาทุกประเภท โดยทีมงานมืออาชีพ<br />
          วิเคราะห์ฟรี ไม่มีค่าใช้จ่ายล่วงหน้า
        </p>
        <ul className="text-left text-gray-800 text-base list-disc list-inside space-y-2 max-w-md mx-auto mb-8">
          <li>ไม่อ่าน ไม่คิดเงิน</li>
          <li>วิเคราะห์ฟรี ไม่มีค่าใช้จ่ายล่วงหน้า</li>
          <li>รองรับ HDD, SSD, Flash Drive, มือถือ ฯลฯ</li>
          <li>ใช้เครื่องมือมาตรฐานระดับสากล</li>
          <li>รักษาความลับลูกค้า 100%</li>
        </ul>
        <div className="max-w-3xl w-full bg-white shadow-md rounded-lg p-6 sm:p-8 mx-auto">
          <h2
            className="text-xl sm:text-2xl font-bold text-blue-800 mb-4"
            style={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            เริ่มต้นด้วยการลงทะเบียนส่งอุปกรณ์
          </h2>
          <p
            className="text-gray-700 mb-4 text-sm sm:text-base"
            style={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            เพื่อป้องกันความผิดพลาดในการส่งอุปกรณ์ กรุณาลงทะเบียนก่อนทุกครั้ง โดยระบุข้อมูลผู้ส่ง และประเภทของปัญหาที่พบ<br />
            เมื่อเสร็จแล้ว คุณจะได้รับรหัสเพื่อติดไว้ที่กล่องพัสดุ หรือแจ้งต่อเจ้าหน้าที่รับอุปกรณ์
          </p>
          <div className="text-center">
            <Link
              href="/register-device"
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded transition duration-300"
            >
              ลงทะเบียนส่งอุปกรณ์
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesPage;
