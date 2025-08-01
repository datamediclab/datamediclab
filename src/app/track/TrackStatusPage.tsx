"use client";

import { useState } from "react";

const TrackStatusPage = () => {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckStatus = async () => {
    if (!phone) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/track-status?phone=${phone}`);
      if (!res.ok) throw new Error("ไม่พบข้อมูลจากระบบ");
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      setStatus(null);
      setError(err.message || "เกิดข้อผิดพลาด");
    }
    setLoading(false);
  };

  return (
    <section className="min-h-[75vh] flex flex-col items-center justify-center bg-gray-100 px-4 py-12">
      <h1 className="text-3xl font-bold mb-4 text-blue-800">ติดตามสถานะงาน</h1>

      <input
        type="text"
        placeholder="กรอกเบอร์โทรศัพท์ที่ลงทะเบียน"
        className="px-4 py-2 border rounded-md mb-4 w-full max-w-sm text-gray-900"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button
        onClick={handleCheckStatus}
        className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded"
        disabled={loading}
      >
        {loading ? "กำลังตรวจสอบ..." : "ตรวจสอบสถานะ"}
      </button>

      {error && <p className="text-red-600 mt-4 text-sm">❌ {error}</p>}

      {status && (
        <div className="mt-8 bg-white p-4 rounded shadow w-full max-w-md">
          <h2 className="text-lg font-semibold text-green-700 mb-2">สถานะล่าสุด:</h2>
          <p className="text-gray-800">{status?.currentStatus || "ไม่พบข้อมูล"}</p>
          <p className="text-sm text-gray-500 mt-2">
            อัปเดตล่าสุด: {status?.updatedAt ? new Date(status.updatedAt).toLocaleString() : "-"}
          </p>

          {(status.deviceType || status.deviceBrand || status.deviceModel || status.deviceSerialN || status.problem || status.name || status.email) && (
            <div className="mt-4 text-sm text-gray-700">
              {status.name && <p><strong>ชื่อผู้ส่ง:</strong> {status.name}</p>}
              {status.email && <p><strong>อีเมล:</strong> {status.email}</p>}
              {status.deviceType && <p><strong>อุปกรณ์:</strong> {status.deviceType}</p>}
              {status.deviceBrand && <p><strong>ยี่ห้อ:</strong> {status.deviceBrand}</p>}
              {status.deviceModel && <p><strong>รุ่น:</strong> {status.deviceModel}</p>}
              {status.deviceSerialN && <p><strong>SN:</strong> {status.deviceSerialN}</p>}
              {status.problem && <p><strong>ปัญหา:</strong> {status.problem}</p>}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default TrackStatusPage;
