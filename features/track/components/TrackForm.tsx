'use client'
import React, { useEffect, useState } from 'react'
import useTrackStore from '@/features/track/store/useTrackStore'
import type { CustomerLite } from '@/features/track/types/types'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import StatusStepper from '@/features/track/components/StatusStepper'
import { localizeStatus } from '@/lib/status'

const TrackForm: React.FC = () => {
  const {
    query, suggestions, selectedCustomer, last4, loading,
    status: trackStatus, error, jobs, selectedJobIndex,
    setQueryAction, searchCustomersAction, pickCustomerAction, setLast4Action,
    verifyAndFetchStatusAction, resetAction, setSelectedJobIndexAction,
  } = useTrackStore()

  const [open, setOpen] = useState(false)
  const [verifyOpen, setVerifyOpen] = useState(false)

  // jobs มาจาก store เป็น TrackItem[] แล้ว
  const jobOptions = jobs

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim()) {
        searchCustomersAction(query); setOpen(true)
      } else setOpen(false)
    }, 250)
    return () => clearTimeout(t)
  }, [query, searchCustomersAction])

  useEffect(() => {
    if (!loading && trackStatus) setVerifyOpen(false)
  }, [loading, trackStatus])

  return (
    <div className="w-full max-w-3xl flex flex-col gap-4">
      {/* Customer search */}
      <div className="w-full max-w-sm self-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button type="button" className="px-4 py-2 border rounded-md w-full text-left bg-white text-gray-900" onClick={() => setOpen(true)}>
              {trackStatus && selectedCustomer ? `${selectedCustomer.fullName} (${selectedCustomer.email ?? 'ไม่มีอีเมล'})` : 'ค้นหาชื่อลูกค้า หรืออีเมล'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0 bg-white border w-[--radix-popover-trigger-width] sm:w-[420px]">
            <Command>
              <CommandInput placeholder="พิมพ์ชื่อหรืออีเมล..." className="text-gray-900 placeholder:text-gray-600" value={query} onValueChange={(v) => setQueryAction(v)} />
              <CommandEmpty className="text-gray-700">ไม่พบลูกค้าที่ตรงกัน</CommandEmpty>
              <CommandGroup>
                {suggestions.map((c: CustomerLite) => (
                  <CommandItem key={c.id} value={c.fullName} onSelect={() => {
                    pickCustomerAction(c); setLast4Action(''); setQueryAction(''); setOpen(false); setVerifyOpen(true)
                  }}>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{c.fullName}</span>
                      <span className="text-xs text-gray-700">{c.email ?? 'ไม่มีอีเมล'}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Verify last-4 overlay */}
      {verifyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setVerifyOpen(false); setLast4Action('') }} />
          <div className="relative bg-zinc-900 text-white border border-zinc-700 rounded-xl w-[90vw] max-w-md p-4">
            <div className="mb-2">
              <div className="text-lg font-medium">ยืนยันตัวตน</div>
              <div className="text-zinc-300">กรุณากรอก 4 ตัวท้ายของเบอร์โทรสำหรับ <span className="font-medium text-white">{selectedCustomer?.fullName}</span></div>
            </div>
            <div className="grid gap-2">
              <input type="text" inputMode="numeric" maxLength={4}
                     className="w-full rounded-lg bg-zinc-800 text-white px-3 py-2 border border-zinc-700"
                     placeholder="กรอก 4 ตัวท้ายเบอร์โทร" value={last4}
                     onChange={(e) => { setLast4Action(e.target.value); if (error) resetAction() }}
                     disabled={!selectedCustomer} />
              {error && <div className="text-red-400 text-xs">{error}</div>}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600" onClick={() => setVerifyOpen(false)}>ยกเลิก</button>
              <button type="button" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
                      disabled={loading || !selectedCustomer || last4.length !== 4}
                      onClick={() => verifyAndFetchStatusAction()}>
                {loading ? 'กำลังตรวจสอบ...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job picker (ถ้ามีหลายงาน) */}
      {trackStatus && jobOptions.length > 1 && (
        <div className="bg-white border rounded-2xl p-3 text-gray-900">
          <div className="text-sm font-medium mb-2">เลือกงานอื่น ๆ</div>
          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {jobOptions.map((j, i) => {
                const active = i === selectedJobIndex
                const label = j.deviceLabel || [j.deviceBrand, j.deviceModel, j.deviceSerialNo].filter(Boolean).join(' ') || `งาน #${j.id}`
                return (
                  <button key={j.id} onClick={() => setSelectedJobIndexAction(i)}
                          className={`px-3 py-2 rounded-full border text-xs whitespace-nowrap transition-colors ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'}`}
                          title={label}>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Result status + stepper */}
      {trackStatus && (
        <div className="mt-0 bg-white border rounded-2xl shadow-sm p-6 text-gray-900">
          <div className="mb-3">
            <div className="text-sm font-semibold text-green-700">สถานะล่าสุด:</div>
            <div className="text-base font-medium">{localizeStatus(trackStatus)}</div>
          </div>
          <StatusStepper currentStatus={trackStatus} />
        </div>
      )}
    </div>
  )
}

export default TrackForm
