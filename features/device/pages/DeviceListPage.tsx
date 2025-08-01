import { useEffect, useState } from 'react';
import Link from 'next/link';

const DeviceListPage = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const filteredDevices = devices.filter((d) =>
    d.customer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    d.brand?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.deviceType?.toLowerCase().includes(search.toLowerCase()) ||
    d.currentStatus?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedDevices = filteredDevices.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredDevices.length / pageSize);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch('/api/device/list');
        const data = await res.json();
        setDevices(data);
      } catch (err) {
        console.error('Error loading devices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center md:text-left">รายการอุปกรณ์ทั้งหมด</h1>

      <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-4">
        <Link href="/device/create" className="bg-blue-600 text-white px-4 py-2 rounded text-sm md:text-base w-full md:w-auto text-center">
          เพิ่มอุปกรณ์ใหม่
        </Link>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="ค้นหาลูกค้า / ยี่ห้อ / สถานะ..."
          className="border p-2 w-full md:w-1/3 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-center">กำลังโหลดข้อมูล...</p>
      ) : filteredDevices.length === 0 ? (
        <p className="text-center">ไม่พบข้อมูลอุปกรณ์</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">ลูกค้า</th>
                <th className="border px-2 py-1">ยี่ห้อ</th>
                <th className="border px-2 py-1">ประเภท</th>
                <th className="border px-2 py-1">ความจุ</th>
                <th className="border px-2 py-1">สถานะ</th>
                <th className="border px-2 py-1">รับเมื่อ</th>
                <th className="border px-2 py-1">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDevices.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1 whitespace-nowrap">{d.customer?.fullName}</td>
                  <td className="border px-2 py-1 whitespace-nowrap">{d.brand?.name}</td>
                  <td className="border px-2 py-1 whitespace-nowrap">{d.deviceType}</td>
                  <td className="border px-2 py-1 whitespace-nowrap">{d.capacity}</td>
                  <td className="border px-2 py-1 whitespace-nowrap">{d.currentStatus}</td>
                  <td className="border px-2 py-1 whitespace-nowrap">{new Date(d.receivedAt).toLocaleDateString()}</td>
                  <td className="border px-2 py-1 whitespace-nowrap">
                    <Link href={`/device/${d.id}`} className="text-blue-600 underline">
                      ดูรายละเอียด
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">
              ย้อนกลับ
            </button>
            <span className="text-sm">หน้า {page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">
              ถัดไป
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceListPage;
