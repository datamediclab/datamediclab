// features/brand/store/useBrandStore.ts

import { create } from 'zustand'
import type { Brand } from '@/features/brand/types/types'

// API response types (no any)
type ApiOk<T> = { ok: true; data: T }
type ApiErr = { ok: false; error: string }
type ApiResp<T> = ApiOk<T> | ApiErr

const normalizeName = (s: string) => s.trim().split(' ').filter(Boolean).join(' ')

interface BrandStoreState {
  brandList: Brand[]
  isLoading: boolean
  error: string | null
  // actions
  fetchBrandListAction: () => Promise<void>
  getBrandByIdAction: (id: number) => Promise<Brand | null>
  createBrandAction: (name: string) => Promise<Brand | null>
  updateBrandAction: (id: number, data: { name: string }) => Promise<Brand | null>
  deleteBrandAction: (id: number) => Promise<boolean>
}

export const useBrandStore = create<BrandStoreState>((set, get) => ({
  brandList: [],
  isLoading: false,
  error: null,

  // GET /api/admin/brand -> { ok: true, data: Brand[] }
  fetchBrandListAction: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/admin/brand', { cache: 'no-store' })
      const json: ApiResp<Brand[]> = await res.json()
      if (!res.ok || json.ok === false) {
        const msg = 'error' in json ? json.error : 'โหลดแบรนด์ล้มเหลว'
        throw new Error(msg)
      }
      const list: Brand[] = Array.isArray(json.data) ? json.data : []
      set({ brandList: list })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการโหลดแบรนด์'
      console.error('❌ fetchBrandListAction failed:', error)
      set({ error: message, brandList: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  // GET /api/admin/brand/:id -> { ok: true, data: Brand }
  getBrandByIdAction: async (id: number) => {
    if (!Number.isFinite(id)) {
      const msg = 'ID ต้องเป็นตัวเลข'
      console.error('❌ getBrandByIdAction error:', msg)
      set({ error: msg })
      return null
    }
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/admin/brand/${id}`, { cache: 'no-store' })
      const json: ApiResp<Brand> = await res.json()
      if (!res.ok || json.ok === false || !json.data) {
        const msg = 'error' in json ? json.error : 'ไม่พบแบรนด์นี้'
        throw new Error(msg)
      }
      return json.data
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'ไม่สามารถดึงข้อมูลแบรนด์'
      console.error('❌ getBrandByIdAction error:', error)
      set({ error: message })
      return null
    } finally {
      set({ isLoading: false })
    }
  },

  // POST /api/admin/brand -> { ok: true, data: Brand }
  createBrandAction: async (name: string) => {
    set({ isLoading: true, error: null })
    try {
      const normalized = normalizeName(name)
      if (!normalized) throw new Error('กรุณาระบุชื่อแบรนด์')

      const res = await fetch('/api/admin/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: normalized }),
      })
      const json: ApiResp<Brand> = await res.json()
      if (!res.ok || json.ok === false || !json.data) {
        const msg = 'error' in json ? json.error : 'เกิดข้อผิดพลาดในการเพิ่มแบรนด์'
        throw new Error(msg)
      }

      const created: Brand = json.data
      set((state) => ({ brandList: [...state.brandList, created] }))
      return created
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'ไม่สามารถเพิ่มแบรนด์ได้'
      console.error('❌ createBrandAction error:', error)
      set({ error: message })
      return null
    } finally {
      set({ isLoading: false })
    }
  },

  // PATCH /api/admin/brand/:id -> { ok: true, data: Brand }
  updateBrandAction: async (id: number, data: { name: string }) => {
    set({ isLoading: true, error: null })
    try {
      const normalized = normalizeName(data.name)
      if (!normalized) throw new Error('กรุณาระบุชื่อแบรนด์')

      const res = await fetch(`/api/admin/brand/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: normalized }),
      })
      const json: ApiResp<Brand> = await res.json()
      if (!res.ok || json.ok === false || !json.data) {
        const msg = 'error' in json ? json.error : 'อัปเดตแบรนด์ล้มเหลว'
        throw new Error(msg)
      }

      const updated: Brand = json.data
      set((state) => ({
        brandList: state.brandList.map((b): Brand => (b.id === id ? updated : b)),
      }))
      return updated
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'ไม่สามารถอัปเดตแบรนด์ได้'
      console.error('❌ updateBrandAction error:', error)
      set({ error: message })
      return null
    } finally {
      set({ isLoading: false })
    }
  },

  // DELETE /api/admin/brand/:id -> 204 | { ok: true, data: { id } }
  deleteBrandAction: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/admin/brand/${id}`, { method: 'DELETE' })

      if (res.status === 204) {
        set((state) => ({ brandList: state.brandList.filter((b): b is Brand => b.id !== id) }))
        return true
      }

      const json: ApiResp<{ id: number; name?: string }> = await res.json()
      if (!res.ok || json.ok === false) {
        const msg = 'error' in json ? json.error : 'ลบไม่สำเร็จ'
        throw new Error(msg)
      }

      set((state) => ({ brandList: state.brandList.filter((b): b is Brand => b.id !== id) }))
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'ไม่สามารถลบแบรนด์ได้'
      console.error('❌ deleteBrandAction error:', error)
      set({ error: message })
      return false
    } finally {
      set({ isLoading: false })
    }
  },
}))
