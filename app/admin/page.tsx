'use client';

// app/admin/page.tsx

import { useEffect, useState } from 'react';
import SidebarAdmin from '@/components/shared/SidebarAdmin';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    brand: 0,
    customer: 0,
    device: 0,
    recoveryJob: 0,
  });

  useEffect(() => {
    const fetchStatsFromApi = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      }
    };

    fetchStatsFromApi();
  }, []);

  return (
    <div className="flex min-h-screen">
      <SidebarAdmin />
      <main className="flex-1 bg-white dark:bg-zinc-800 p-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
          แดชบอร์ดผู้ดูแลระบบ
        </h1>
        <p className="text-zinc-700 dark:text-zinc-300 mb-6">
          ยินดีต้อนรับเข้าสู่หน้าแดชบอร์ด คุณสามารถจัดการระบบได้จากเมนูด้านซ้าย
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded shadow">
            <h2 className="text-lg font-semibold dark:text-white">จำนวนแบรนด์</h2>
            <p className="text-3xl font-bold text-blue-600">{stats.brand}</p>
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded shadow">
            <h2 className="text-lg font-semibold dark:text-white">จำนวนลูกค้า</h2>
            <p className="text-3xl font-bold text-green-600">{stats.customer}</p>
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded shadow">
            <h2 className="text-lg font-semibold dark:text-white">จำนวนอุปกรณ์</h2>
            <p className="text-3xl font-bold text-purple-600">{stats.device}</p>
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded shadow">
            <h2 className="text-lg font-semibold dark:text-white">รายการกู้ข้อมูล</h2>
            <p className="text-3xl font-bold text-red-600">{stats.recoveryJob}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
