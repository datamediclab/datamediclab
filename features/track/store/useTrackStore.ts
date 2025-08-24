import { create } from 'zustand'
import type {
  CustomerLite,
  TrackItem,
  TrackStatus,
  UpdateStatusPayload,
  FetchTrackByIdResp,
  FetchTrackListByStatusResp,
  UpdateStatusResp,
} from '@/features/track/types/types'
import type { StatusKey } from '@/lib/status'
import { UI_TO_RAW } from '@/lib/status'

// helpers
const onlyDigits = (s: string) => s.replace(/\D/g, '')
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const isTrackItem = (v: unknown): v is TrackItem => {
  if (!isRecord(v)) return false
  const o = v as Record<string, unknown>
  return typeof o.id === 'number' && typeof o.currentStatus === 'string'
}

interface TrackState {
  // customer-facing
  query: string
  suggestions: CustomerLite[]
  selectedCustomer: CustomerLite | null
  last4: string
  loading: boolean
  status: TrackStatus | null
  jobs: TrackItem[]
  selectedJobIndex: number

  // admin-facing
  list: TrackItem[]
  currentItem: TrackItem | null
  isLoading: boolean
  error: string | null

  // actions (customer)
  setQueryAction: (q: string) => void
  searchCustomersAction: (q: string) => Promise<void>
  pickCustomerAction: (c: CustomerLite) => void
  setLast4Action: (v: string) => void
  verifyAndFetchStatusAction: () => Promise<void>
  setSelectedJobIndexAction: (index: number) => void

  // actions (admin)
  clearErrorAction: () => void
  fetchTrackListByStatusAction: (status: TrackStatus) => Promise<void>
  fetchTrackByIdAction: (id: number) => Promise<void>
  updateTrackStatusAction: (payload: UpdateStatusPayload) => Promise<void>

  resetAction: () => void
}

const useTrackStore = create<TrackState>((set, get) => ({
  // customer defaults
  query: '',
  suggestions: [],
  selectedCustomer: null,
  last4: '',
  loading: false,
  status: null,
  jobs: [],
  selectedJobIndex: 0,

  // admin defaults
  list: [],
  currentItem: null,
  isLoading: false,
  error: null,

  // ==== customer actions ====
  setQueryAction: (q) => set({ query: q }),

  searchCustomersAction: async (q: string) => {
    try {
      const url = `/api/track/search?q=${encodeURIComponent(q)}`
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) {
        const ct = res.headers.get('content-type') || ''
        let msg = `HTTP ${res.status} ${res.statusText}`
        if (ct.includes('application/json')) {
          const j: unknown = await res.json().catch(() => null)
          if (isRecord(j) && typeof (j as { error?: unknown }).error === 'string') msg = (j as { error: string }).error
        }
        set({ error: msg, suggestions: [] })
        return
      }
      const items: Array<{ id: number; fullName: string; email?: string | null }> = await res.json()
      set({ suggestions: items.map((it) => ({ id: it.id, fullName: it.fullName, email: it.email ?? null })) })
    } catch {
      set({ suggestions: [] })
    }
  },

  pickCustomerAction: (c) => set({ selectedCustomer: c }),

  setLast4Action: (v) => set({ last4: onlyDigits(v).slice(0, 4), error: null }),

  setSelectedJobIndexAction: (index) =>
    set((state) => {
      const i = Math.max(0, Math.min(index, state.jobs.length - 1))
      const job = state.jobs[i]
      return { selectedJobIndex: i, status: job ? job.currentStatus : null }
    }),

  verifyAndFetchStatusAction: async () => {
    const { selectedCustomer, last4 } = get()
    if (!selectedCustomer || last4.length !== 4) return
    set({ loading: true, error: null, status: null, jobs: [], selectedJobIndex: 0 })
    try {
      const url = `/api/track?customerId=${selectedCustomer.id}&last4=${last4}&all=1`
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) {
        const ct = res.headers.get('content-type') || ''
        let msg = `HTTP ${res.status} ${res.statusText}`
        if (ct.includes('application/json')) {
          const j: unknown = await res.json().catch(() => null)
          if (isRecord(j) && typeof (j as { error?: unknown }).error === 'string') msg = (j as { error: string }).error
        }
        set({ error: msg, loading: false, jobs: [], status: null })
        return
      }
      const data: unknown = await res.json().catch(() => null)
      const arr: unknown[] =
        (isRecord(data) && Array.isArray((data as Record<string, unknown>).data)) ?
          ((data as Record<string, unknown>).data as unknown[]) :
          (Array.isArray(data) ? data as unknown[] : [])
      const items: TrackItem[] = arr.filter(isTrackItem) as TrackItem[]
      set({ jobs: items, selectedJobIndex: 0, status: items[0]?.currentStatus ?? null, loading: false })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ตรวจสอบไม่สำเร็จ'
      set({ error: msg, loading: false })
    }
  },

  // ==== admin actions ====
  clearErrorAction: () => set({ error: null }),

  fetchTrackListByStatusAction: async (status: TrackStatus) => {
    set({ isLoading: true, error: null })
    try {
      const raw: StatusKey = UI_TO_RAW[status] ?? (status as unknown as StatusKey)
      const res = await fetch(`/api/admin/track/list?status=${encodeURIComponent(raw)}`, { cache: 'no-store' })
      if (!res.ok) {
        const ct = res.headers.get('content-type') || ''
        let msg = `HTTP ${res.status} ${res.statusText}`
        if (ct.includes('application/json')) {
          const j: unknown = await res.json().catch(() => null)
          if (isRecord(j) && typeof (j as { error?: unknown }).error === 'string') msg = (j as { error: string }).error
        }
        set({ error: msg, isLoading: false, list: [] })
        return
      }
      const json: FetchTrackListByStatusResp = await res.json()
      if (!json.ok) { set({ error: json.error, isLoading: false, list: [] }); return }
      set({ list: json.data, isLoading: false })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถโหลดรายการได้'
      set({ error: msg, isLoading: false, list: [] })
    }
  },

  fetchTrackByIdAction: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/admin/track/${id}`, { cache: 'no-store' })
      if (!res.ok) {
        const ct = res.headers.get('content-type') || ''
        let msg = `HTTP ${res.status} ${res.statusText}`
        if (ct.includes('application/json')) {
          const j: unknown = await res.json().catch(() => null)
          if (isRecord(j) && typeof (j as { error?: unknown }).error === 'string') msg = (j as { error: string }).error
        }
        set({ error: msg, isLoading: false, currentItem: null })
        return
      }
      const json: FetchTrackByIdResp = await res.json()
      if (!json.ok) throw new Error(json.error)
      set({ currentItem: json.data, isLoading: false })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลงานได้'
      set({ error: msg, isLoading: false, currentItem: null })
    }
  },

  updateTrackStatusAction: async (payload: UpdateStatusPayload) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/admin/track/${payload.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: payload.status, note: payload.note ?? undefined }),
      })
      if (!res.ok) {
        const ct = res.headers.get('content-type') || ''
        let msg = `HTTP ${res.status} ${res.statusText}`
        if (ct.includes('application/json')) {
          const j: unknown = await res.json().catch(() => null)
          if (isRecord(j) && typeof (j as { error?: unknown }).error === 'string') msg = (j as { error: string }).error
        }
        set({ error: msg, isLoading: false })
        throw new Error(msg)
      }
      const json: UpdateStatusResp = await res.json()
      if (!json.ok) throw new Error(json.error)

      const { list, currentItem } = get()
      const updatedStatus = json.data.currentStatus
      set({
        currentItem: currentItem ? { ...currentItem, currentStatus: updatedStatus } : currentItem,
        list: list.map((r) => (r.id === payload.id ? { ...r, currentStatus: updatedStatus } : r)),
        isLoading: false,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'อัปเดตสถานะไม่สำเร็จ'
      set({ error: msg, isLoading: false })
      throw err
    }
  },

  // reset
  resetAction: () =>
    set({
      query: '',
      suggestions: [],
      selectedCustomer: null,
      last4: '',
      loading: false,
      status: null,
      jobs: [],
      selectedJobIndex: 0,
      list: [],
      currentItem: null,
      isLoading: false,
      error: null,
    }),
}))

export default useTrackStore
