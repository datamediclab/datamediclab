'use client'

// app/admin/change-status/job/[id]/page.tsx
// หน้าเปลี่ยนสถานะ "รายงานเดียว" สำหรับแอดมิน (แยกออกจาก store + components แล้ว)

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import useTrackStore from '@/features/track/store/useTrackStore'
import type { TrackItem, TrackStatus, UpdateStatusPayload } from '@/features/track/types/types'
import { TRACK_STATUSES } from '@/features/track/types/types'

const JobChangeStatusPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter()

  // parse id ให้ปลอดภัย
  const id = useMemo(() => {
    const n = Number(params.id)
    return Number.isFinite(n) && n > 0 ? n : null
  }, [params.id])

  // selectors แยกรายฟิลด์ ป้องกัน getSnapshot loop
  const currentItem = useTrackStore((s) => s.currentItem as TrackItem | null)
  const isLoading = useTrackStore((s) => s.isLoading)
  const error = useTrackStore((s) => s.error)
  const fetchTrackByIdAction = useTrackStore((s) => s.fetchTrackByIdAction)
  const updateTrackStatusAction = useTrackStore((s) => s.updateTrackStatusAction)
  const clearErrorAction = useTrackStore((s) => s.clearErrorAction)

  const [status, setStatus] = useState<TrackStatus | ''>('')
  const [note, setNote] = useState('')
  const [okMsg, setOkMsg] = useState('')

  // โหลดข้อมูลเมื่อ id เปลี่ยน
  useEffect(() => {
    if (!id) return
    fetchTrackByIdAction(id).catch(() => {})
  }, [id, fetchTrackByIdAction])

  // เติมค่า default ของ status เมื่อโหลดงานสำเร็จ
  useEffect(() => {
    if (!currentItem) return
    const next = (currentItem.allowedNextStatuses?.[0] as TrackStatus | undefined) ?? currentItem.currentStatus
    setStatus(next ?? '')
  }, [currentItem])

  const statusOptions: TrackStatus[] = (currentItem?.allowedNextStatuses?.length ?? 0) > 0
    ? (currentItem!.allowedNextStatuses as TrackStatus[])
    : (TRACK_STATUSES as unknown as TrackStatus[])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setOkMsg('')
    clearErrorAction()
    if (!id || !status) return

    const payload: UpdateStatusPayload = { id, status, note: note.trim() || undefined }
    try {
      await updateTrackStatusAction(payload)
      setOkMsg('อัปเดตสถานะเรียบร้อย')
      // เปิดใช้ถ้าต้องการย้อนกลับอัตโนมัติ: router.back()
    } catch (err) {
      // error ถูกเก็บใน store.error แล้ว
    }
  }

  if (!id) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold">เปลี่ยนสถานะงาน</h1>
        <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">ไม่พบรหัสงานที่ถูกต้องจาก URL</div>
        <div className="mt-6"><Link href="/admin" className="underline">กลับไปหน้า Admin</Link></div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin" className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50">← กลับ</Link>
        <h1 className="text-2xl font-semibold">เปลี่ยนสถานะงาน #{id}</h1>
      </div>

      {/* ข้อมูลงาน */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {isLoading ? (
          <p className="py-8">กำลังโหลดข้อมูล…</p>
        ) : currentItem ? (
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="text-zinc-500">ชื่อลูกค้า:</span>{' '}
                <span className="font-medium">{currentItem.customerName}</span>
              </div>
              <div>
                <span className="text-zinc-500">อุปกรณ์:</span>{' '}
                <span className="font-medium">{currentItem.deviceLabel}</span>
              </div>
              <div>
                <span className="text-zinc-500">สถานะปัจจุบัน:</span>{' '}
                <span className="font-medium">{currentItem.currentStatus}</span>
              </div>
            </div>
            {currentItem.lastUpdatedAt && (
              <div className="text-xs text-zinc-500">อัปเดตล่าสุด: {new Date(currentItem.lastUpdatedAt).toLocaleString()}</div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800">ไม่พบข้อมูลงานนี้</div>
        )}
      </section>

      {/* ฟอร์มเปลี่ยนสถานะ */}
      <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="status" className="mb-1 block text-sm text-zinc-600">เลือกสถานะใหม่</label>
              <select
                id="status"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                value={status || ''}
                onChange={(e) => setStatus(e.target.value as TrackStatus)}
              >
                <option value="" disabled>-- เลือกสถานะ --</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="note" className="mb-1 block text-sm text-zinc-600">หมายเหตุ (ถ้ามี)</label>
              <input
                id="note"
                type="text"
                placeholder="เช่น โทรแจ้งลูกค้าแล้ว / รออะไหล่"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {(error || okMsg) && (
            <div className={'rounded-xl border px-3 py-2 text-sm ' + (error ? 'border-red-300 bg-red-50 text-red-700' : 'border-emerald-300 bg-emerald-50 text-emerald-700')}>
              {error ?? okMsg}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={!status || isLoading} className="rounded-2xl px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-blue-500/20 transition hover:shadow disabled:opacity-50 dark:bg-blue-600/90 dark:text-white">
              {isLoading ? 'กำลังบันทึก…' : 'บันทึกสถานะ'}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-2xl border px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
              ย้อนกลับ
            </button>
          </div>
        </form>
      </section>

      {/* ประวัติการเปลี่ยนสถานะ */}
      {currentItem?.statusHistory && currentItem.statusHistory.length > 0 && (
        <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-base font-semibold">ประวัติการเปลี่ยนสถานะ</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-600 dark:border-zinc-800">
                  <th className="px-3 py-2">วันที่</th>
                  <th className="px-3 py-2">สถานะ</th>
                  <th className="px-3 py-2">หมายเหตุ</th>
                  <th className="px-3 py-2">โดย</th>
                </tr>
              </thead>
              <tbody>
                {currentItem.statusHistory.map((h) => (
                  <tr key={h.id} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="px-3 py-2">{new Date(h.changedAt).toLocaleString()}</td>
                    <td className="px-3 py-2">{h.status}</td>
                    <td className="px-3 py-2">{h.note ?? '-'}</td>
                    <td className="px-3 py-2">{h.changedBy ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  )
}

export default JobChangeStatusPage
