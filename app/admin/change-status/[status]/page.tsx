'use client'

// app/admin/change-status/[status]/page.tsx
// รายการงานตามสถานะ + ค้นหา + ไปหน้าแก้สถานะรายไอดี

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import useTrackStore from '@/features/track/store/useTrackStore'
import type { TrackItem, TrackStatus } from '@/features/track/types/types'
import { normalizeToTrackStatus } from '@/lib/status'

const ChangeStatusByStatusPage = ({ params }: { params: { status: string } }) => {
  const router = useRouter()

  // แปลงคีย์จาก URL เป็น TrackStatus (มี fallback ภายในฟังก์ชัน normalize)
  const statusKey: TrackStatus = useMemo(() => normalizeToTrackStatus(params.status), [params.status])

  // selectors รายฟิลด์ (กัน rerender/loop)
  const list = useTrackStore((s) => s.list as TrackItem[])
  const isLoading = useTrackStore((s) => s.isLoading)
  const error = useTrackStore((s) => s.error)
  const fetchTrackListByStatusAction = useTrackStore((s) => s.fetchTrackListByStatusAction)

  const [keyword, setKeyword] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    // ให้สโตร์แปลงคีย์ไปเป็นรูปแบบที่ API ต้องการเอง (UI ส่ง TrackStatus อย่างเดียว)
    fetchTrackListByStatusAction(statusKey).catch(() => {})
  }, [statusKey, fetchTrackListByStatusAction])

  // กรองเฉพาะ keyword (สมมติว่า API กรองตามสถานะแล้ว)
  const filtered: TrackItem[] = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    const rows = list
    if (!q) return rows
    return rows.filter((it) =>
      [it.customerName, it.customerEmail ?? '', it.deviceLabel, it.problem ?? '']
        .join(' | ')
        .toLowerCase()
        .includes(q)
    )
  }, [keyword, list])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin" className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50">← กลับ</Link>
        <h1 className="text-2xl font-semibold">รายการงานสถานะ: {statusKey}</h1>
        <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          ทั้งหมด {list.length} รายการ
        </span>
      </div>

      {/* Controls */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="ค้นหา: ลูกค้า/อีเมล/อุปกรณ์/อาการเสีย"
            className="w-full md:max-w-sm rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={selectedId == null}
              onClick={() => selectedId && router.push(`/admin/change-status/job/${selectedId}`)}
              className="rounded-2xl px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-blue-500/20 transition hover:shadow disabled:opacity-50 dark:bg-blue-600/90 dark:text-white"
            >
              เปลี่ยนสถานะรายการที่เลือก
            </button>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {error && (
          <div className="mb-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        {isLoading ? (
          <p className="py-8">กำลังโหลดข้อมูล…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-600 dark:border-zinc-800">
                  <th className="px-3 py-2">เลือก</th>
                  <th className="px-3 py-2">รหัส</th>
                  <th className="px-3 py-2">ลูกค้า</th>
                  <th className="px-3 py-2">อุปกรณ์</th>
                  <th className="px-3 py-2">อัปเดตล่าสุด</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center" colSpan={5}>ไม่มีรายการ</td>
                  </tr>
                ) : (
                  filtered.map((it) => (
                    <tr key={it.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="px-3 py-2">
                        <input
                          type="radio"
                          name="selectRow"
                          checked={selectedId === it.id}
                          onChange={() => setSelectedId(it.id)}
                        />
                      </td>
                      <td className="px-3 py-2">#{it.id}</td>
                      <td className="px-3 py-2">
                        <div className="font-medium">{it.customerName}</div>
                        {it.customerEmail && <div className="text-xs text-zinc-500">{it.customerEmail}</div>}
                      </td>
                      <td className="px-3 py-2">{it.deviceLabel}</td>
                      <td className="px-3 py-2">{it.lastUpdatedAt ? new Date(it.lastUpdatedAt).toLocaleString() : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default ChangeStatusByStatusPage

