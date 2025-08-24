// app/admin/page.tsx

'use client'
import React, { useEffect } from 'react'
import Link from 'next/link'
import SidebarAdmin from '@/components/shared/SidebarAdmin'
import { STATUS_TH_TRACK, STATUS_ORDER } from '@/lib/status'
import { TRACK_STATUSES, type TrackStatus } from '@/features/track/types/types'
import { useAdminStatsStore } from '@/features/admin/store/useAdminStatsStore'

// Helper: แปลงคีย์ดิบจาก API หลายแบบให้เป็น TrackStatus มาตรฐาน
const ALIAS_TO_TRACK: Record<string, TrackStatus> = {
  WAITING_FOR_CUSTOMER_DEVICE: 'WAITING_CUSTOMER',
  WAITING_CUSTOMER_DEVICE: 'WAITING_CUSTOMER',
  WAITING_FOR_CUSTOMER: 'WAITING_CUSTOMER',
  QUOTED: 'WAITING_CUSTOMER',
  APPROVED: 'IN_PROGRESS',
  RECOVERING: 'IN_PROGRESS',
  RECOVERY_IN_PROGRESS: 'IN_PROGRESS',
  UNDER_DIAGNOSIS: 'DIAGNOSING',
  ANALYSIS_COMPLETE: 'DIAGNOSING',
  RECEIVED_DEVICE: 'RECEIVED',
  RECEIVE: 'RECEIVED',
  DEVICE_RETURNED: 'COMPLETED',
  RECOVERY_SUCCESSFUL: 'COMPLETED',
  RECOVERY_FAILED: 'CANCELLED',
}
const normalizeToTrackStatusLocal = (raw?: string | null): TrackStatus | null => {
  const s = String(raw ?? '').trim().toUpperCase().replace(/[^A-Z]/g, '_')
  const candidate = (ALIAS_TO_TRACK[s] ?? s) as string
  return (TRACK_STATUSES as readonly string[]).includes(candidate)
    ? (candidate as TrackStatus)
    : null
}

// ลำดับการ์ดบนแดชบอร์ด: เรียงตาม STATUS_ORDER แต่ map เป็น TrackStatus และลบซ้ำ
const ORDERED_TRACKS: TrackStatus[] = Array.from(
  new Set(
    (STATUS_ORDER as readonly string[])
      .map((k) => normalizeToTrackStatusLocal(k))
      .filter((s): s is TrackStatus => s !== null)
  )
)

const AdminDashboardPage = () => {
  const { data, isLoading, error, fetchAdminStatsAction } = useAdminStatsStore()

  useEffect(() => {
    if (!data && !isLoading) fetchAdminStatsAction()
  }, [data, isLoading, fetchAdminStatsAction])

  return (
    <div className="flex flex-col sm:flex-row bg-zinc-50 dark:bg-zinc-900 min-h-[calc(100vh-4rem)]">
      <div className="hidden md:block">
        <SidebarAdmin />
      </div>
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <div className="bg-white dark:bg-zinc-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-3 sm:mb-4">แดชบอร์ดผู้ดูแลระบบ</h1>
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'จำนวนแบรนด์', value: data?.brand ?? 0, color: 'text-blue-600' },
              { label: 'จำนวนลูกค้า', value: data?.customer ?? 0, color: 'text-green-600' },
              { label: 'จำนวนอุปกรณ์', value: data?.device ?? 0, color: 'text-purple-600' }
            ].map((item, idx) => (
              <div key={idx} className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-xl shadow">
                <h2 className="text-xs sm:text-sm font-semibold text-left dark:text-white">{item.label}</h2>
                <p className={`text-xl sm:text-2xl font-bold ${item.color} text-center`}>{item.value}</p>
              </div>
            ))}
          </div>

          <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white mb-4">รายการกู้ข้อมูลแยกตามสถานะ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ORDERED_TRACKS.map((key: TrackStatus) => (
              <Link
                href={`/admin/change-status/${key}`}
                key={key}
                className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg shadow hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-all flex flex-col justify-between h-28"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-sm sm:text-lg font-medium text-left dark:text-white">{STATUS_TH_TRACK[key]}</h3>
                </div>
                <p className={`text-2xl sm:text-4xl font-bold text-center`}>{(() => { const dict = (data?.statuses ?? {}) as Record<string, number>; let sum = 0; for (const [rk, v] of Object.entries(dict)) { const t = normalizeToTrackStatusLocal(rk); if (t === key) sum += Number(v ?? 0); } return sum; })()}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
export default AdminDashboardPage
