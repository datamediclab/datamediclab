// app/(whatever)/track/page.tsx
"use client";

import React from "react";
import TrackForm from "@/features/track/components/TrackForm";

import { localizeStatus } from "@/lib/status";
import useTrackStore from "@/features/track/store/useTrackStore";

const Page = () => {
  const { status, error } = useTrackStore();

  return (
    <section className="min-h-[75vh] flex flex-col items-center justify-center bg-gray-100 px-4 py-12">
      <h1 className="text-3xl font-bold mb-4 text-blue-800">ติดตามสถานะงาน</h1>

      <TrackForm />

      {error && <p className="text-red-600 mt-4 text-sm">❌ {error}</p>}

      {status && (
        <div className="mt-8 bg-white p-4 rounded shadow w-full max-w-md">
          <h2 className="text-lg font-semibold text-green-700 mb-2">สถานะล่าสุด:</h2>
          <p className="text-gray-800">{localizeStatus(status.currentStatus) || "ไม่พบข้อมูล"}</p>
          <p className="text-sm text-gray-500 mt-2">
            อัปเดตล่าสุด: {status.updatedAt ? new Date(status.updatedAt).toLocaleString() : "-"}
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

export default Page;