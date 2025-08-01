"use client";

import Image from "next/image";

const ContactPage = () => {
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
          ติดต่อเรา
        </h1>
        <p
          className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6"
          style={{ fontFamily: 'Sarabun, sans-serif' }}
        >
          หากคุณมีคำถามหรือต้องการสอบถามข้อมูลเพิ่มเติมเกี่ยวกับการกู้ข้อมูล<br />
          เรายินดีให้บริการและคำปรึกษาโดยไม่มีค่าใช้จ่ายล่วงหน้า
        </p>

        <div className="bg-white shadow-lg rounded-lg p-6 text-left max-w-md mx-auto">
          <ul className="text-gray-800 text-base space-y-3">
            <li><strong>📞 โทรศัพท์:</strong> 084-494-9798</li>
            <li><strong>💬 Line:</strong> <a href="https://line.me/R/ti/p/@datamediclab" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">@datamediclab</a></li>
            <li><strong>📘 Facebook:</strong> <a href="https://facebook.com/datamediclab" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Data Medic Lab</a></li>
            <li><strong>📧 Email:</strong> <a href="mailto:datamediclab@example.com" className="text-blue-700 underline">datamediclab@example.com</a></li>
            <li><strong>🕘 เวลาทำการ:</strong> ทุกวัน 09:00 - 18:00 น.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
