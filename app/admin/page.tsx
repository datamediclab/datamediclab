// app/admin/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Cpu, FileCheck, Loader2, Smile, XCircle, Undo2, type LucideIcon } from 'lucide-react';
import SidebarAdmin from '@/components/shared/SidebarAdmin';
import { useAdminStore } from '@/app/store/useAdminStore';

const AdminDashboardPage = () => {
  const { admin } = useAdminStore();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!admin) return;
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
  }, [admin]);

  const statusLabels: Record<string, { label: string; Icon: LucideIcon; color: string }> = {
    WAITING_FOR_CUSTOMER_DEVICE: { label: 'รอลูกค้านำอุปกรณ์มา', Icon: Clock, color: 'text-yellow-500' },
    UNDER_DIAGNOSIS: { label: 'กำลังวินิจฉัยอุปกรณ์', Icon: Cpu, color: 'text-blue-500' },
    ANALYSIS_COMPLETE: { label: 'วิเคราะห์ข้อมูลเสร็จสิ้น', Icon: FileCheck, color: 'text-green-500' },
    RECOVERY_IN_PROGRESS: { label: 'กำลังกู้ข้อมูล', Icon: Loader2, color: 'text-indigo-500' },
    RECOVERY_SUCCESSFUL: { label: 'กู้ข้อมูลสำเร็จ', Icon: Smile, color: 'text-green-600' },
    RECOVERY_FAILED: { label: 'กู้ข้อมูลไม่สำเร็จ', Icon: XCircle, color: 'text-red-500' },
    DEVICE_RETURNED: { label: 'ส่งอุปกรณ์คืนแล้ว', Icon: Undo2, color: 'text-gray-500' },
  };

  return (
    <div className="flex flex-col sm:flex-row bg-zinc-50 dark:bg-zinc-900 min-h-[calc(100vh-4rem)]">
      <div className="hidden md:block">
        <SidebarAdmin />
      </div>
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <button
          type="button"
          className="md:hidden mb-3 inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800"
          onClick={() => setMobileOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          เมนู
        </button>
        <div className="bg-white dark:bg-zinc-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-3 sm:mb-4">แดชบอร์ดผู้ดูแลระบบ</h1>
          <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 mb-4 sm:mb-6">ยินดีต้อนรับเข้าสู่หน้าแดชบอร์ด คุณสามารถจัดการระบบได้จากเมนูด้านซ้าย</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'จำนวนแบรนด์', value: stats.brand ?? 0, color: 'text-blue-600' },
              { label: 'จำนวนลูกค้า', value: stats.customer ?? 0, color: 'text-green-600' },
              { label: 'จำนวนอุปกรณ์', value: stats.device ?? 0, color: 'text-purple-600' }
            ].map((item, idx) => (
              <div key={idx} className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-xl shadow">
                <h2 className="text-xs sm:text-sm font-semibold text-left dark:text-white">{item.label}</h2>
                <p className={`text-xl sm:text-2xl font-bold ${item.color} text-center`}>{item.value}</p>
              </div>
            ))}
          </div>

          <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white mb-4">รายการกู้ข้อมูลแยกตามสถานะ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(statusLabels).map(([key, { label, Icon, color }]) => (
              <Link
                href={`/admin/change-status/${key}`}
                key={key}
                className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg shadow hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-all flex flex-col justify-between h-28"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`${color} w-6 h-6`} />
                  <h3 className="text-sm sm:text-lg font-medium text-left dark:text-white">{label}</h3>
                </div>
                <p className={`text-2xl sm:text-4xl font-bold ${color} text-center`}>{stats[key] ?? 0}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[80vw] bg-zinc-900 text-white shadow-2xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">เมนู</span>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-sm bg-zinc-800 hover:bg-zinc-700"
                onClick={() => setMobileOpen(false)}
                aria-label="ปิดเมนู"
              >✕</button>
            </div>
            <SidebarAdmin />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
