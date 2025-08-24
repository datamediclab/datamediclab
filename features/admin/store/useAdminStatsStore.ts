// features/admin/store/useAdminStatsStore.ts
import { create } from 'zustand'

export interface AdminStats {
  admin: number
  brand: number
  customer: number
  device: number
  recoveryJob: number
  statuses: Record<string, number>
}

// API response types (no any)
type ApiOk<T> = { ok: true; data: T }
type ApiErr = { ok: false; error: string }
type ApiResp<T> = ApiOk<T> | ApiErr

interface AdminStatsState {
  data: AdminStats | null
  isLoading: boolean
  error: string | null
  fetchAdminStatsAction: () => Promise<void>
  reset: () => void
}

export const useAdminStatsStore = create<AdminStatsState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  // GET /api/admin/stats -> { ok: true, data: AdminStats }
  fetchAdminStatsAction: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' })
      const json: ApiResp<AdminStats> = await res.json()
      if (!res.ok || json.ok === false) {
        throw new Error(('error' in json ? json.error : '') || 'โหลดสถิติไม่สำเร็จ')
      }
      set({ data: json.data })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลได้'
      console.error('❌ fetchAdminStatsAction failed:', error)
      set({ error: message, data: null })
    } finally {
      set({ isLoading: false })
    }
  },

  reset: () => set({ data: null, isLoading: false, error: null })
}))
