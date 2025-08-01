// app/page.jsx

export default function HomePage() {
  return (
    <section className="min-h-[75vh] flex items-center justify-center bg-gray-100 px-6 py-12">
      <div className="text-center max-w-2xl mx-auto">
        <img
          src="/logo.png"
          alt="Data Medic Lab Logo"
          className="w-28 h-auto mx-auto mb-6"
        />
        <h1
          className="text-4xl sm:text-5xl font-extrabold text-blue-800 mb-4 leading-tight"
          style={{ fontFamily: 'Sarabun, sans-serif' }}
        >
          Data Medic Lab
        </h1>
        <p
          className="text-gray-700 text-base sm:text-lg leading-relaxed"
          style={{ fontFamily: 'Sarabun, sans-serif' }}
        >
          บริการกู้ข้อมูลจากฮาร์ดดิสก์ SSD มือถือ และอุปกรณ์เก็บข้อมูลทุกประเภท<br />
          วิเคราะห์ฟรี ไม่มีค่าใช้จ่ายล่วงหน้า โดยทีมงานมืออาชีพ
        </p>
      </div>
    </section>
  );
}
