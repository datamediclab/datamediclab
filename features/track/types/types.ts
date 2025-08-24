// =============================
// File: features/track/types.ts
// =============================

// ✅ Common API response schema (no `any`)
export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: string };
export type ApiResp<T> = ApiOk<T> | ApiErr;

// ✅ Canonical statuses
export const TRACK_STATUSES = [
  'RECEIVED',
  'DIAGNOSING',
  'IN_PROGRESS',
  'WAITING_CUSTOMER',
  'READY_FOR_PICKUP',
  'COMPLETED',
  'CANCELLED',
] as const;
export type TrackStatus = typeof TRACK_STATUSES[number];

// helper: type guard เวลา parse พารามิเตอร์จาก URL
export const isTrackStatus = (v: string): v is TrackStatus =>
  (TRACK_STATUSES as readonly string[]).includes(v);

// ใช้แทน Key ของแผนผังสถานะ (อ่านง่าย และเท่ากับ TrackStatus)
export type StatusKey = TrackStatus;

// นับจำนวนงานรายสถานะ (ใช้กับแดชบอร์ด)
export type TrackCounts = Record<TrackStatus, number>;

// ✅ Lightweight customer reference used in lists / headers
export interface CustomerLite {
  id: number;
  fullName: string;
  email?: string | null; // ใช้แสดงแทนเบอร์โทรตามนโยบายล่าสุด
}

// ✅ History entry for status transitions
export interface TrackHistory {
  id: number;
  status: TrackStatus;
  note?: string | null;
  changedBy?: string | null; // employee/display name
  changedAt: string; // ISO string
}

// ✅ Main item used by ChangeStatus page & listing
export interface TrackItem {
  id: number;
  customerId?: number;
  customerName: string;
  customerEmail?: string | null;

  deviceType?: string | null;
  deviceBrand?: string | null;
  deviceModel?: string | null;
  deviceSerialNo?: string | null;
  problem?: string | null;

  // Derived/combined label for compact display (e.g., "Notebook • Dell XPS 13 • SN123")
  deviceLabel: string;

  currentStatus: TrackStatus;
  lastUpdatedAt?: string; // ISO

  // Next statuses allowed by backend rules/transition map
  allowedNextStatuses?: TrackStatus[];

  statusHistory: TrackHistory[];
}

// ✅ Payload for updating status
export interface UpdateStatusPayload {
  id: number; // track/job id
  status: TrackStatus;
  note?: string; // optional note
}

// ✅ API response helpers
export type FetchTrackByIdResp = ApiResp<TrackItem>;
export type UpdateStatusResp = ApiResp<{ id: number; currentStatus: TrackStatus }>;

// response สำหรับ “รายการตามสถานะ” (หน้า list)
export type FetchTrackListByStatusResp = ApiResp<TrackItem[]>;

// สถิติแดชบอร์ดที่มี map ของสถานะ (ให้ตรงกับ useAdminStatsStore)
export interface AdminStats {
  brand: number;
  customer: number;
  device: number;
  statuses: TrackCounts;
}
export type FetchAdminStatsResp = ApiResp<AdminStats>;
