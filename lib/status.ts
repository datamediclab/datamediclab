// lib/status.ts
import type { TrackStatus } from '@/features/track/types/types'
import { TRACK_STATUSES } from '@/features/track/types/types'

// 1) ลำดับสถานะ (แหล่งความจริงเดียว)
export const STATUS_ORDER = [
  "WAITING_FOR_CUSTOMER_DEVICE",
  "RECEIVED",
  "DIAGNOSING",
  "QUOTED",
  "APPROVED",
  "RECOVERING",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
] as const;

// สร้างชนิดจากลำดับด้านบน (type-safe)
export type StatusKey = typeof STATUS_ORDER[number];

// 2) คำแปลไทย (ผูก type กับ StatusKey เพื่อบังคับให้ครบทุกคีย์)
export const STATUS_TH: Record<StatusKey, string> = {
  WAITING_FOR_CUSTOMER_DEVICE: "รอรับอุปกรณ์",
  RECEIVED: "รับอุปกรณ์แล้ว",
  DIAGNOSING: "กำลังตรวจเช็ค",
  QUOTED: "แจ้งราคาแล้ว",
  APPROVED: "ยืนยันซ่อม/กู้ข้อมูล",
  RECOVERING: "กำลังกู้ข้อมูล",
  READY_FOR_PICKUP: "พร้อมรับอุปกรณ์",
  COMPLETED: "งานเสร็จสิ้น",
  CANCELLED: "ยกเลิกงาน",
};

// แผนที่คำแปลสำหรับ TrackStatus (ใช้กับแดชบอร์ด/รายการ)
export const STATUS_TH_TRACK: Record<TrackStatus, string> = {
  RECEIVED: 'รับอุปกรณ์แล้ว',
  DIAGNOSING: 'กำลังตรวจเช็ค',
  IN_PROGRESS: 'กำลังกู้ข้อมูล',
  WAITING_CUSTOMER: 'รอลูกค้า',
  READY_FOR_PICKUP: 'พร้อมรับอุปกรณ์',
  COMPLETED: 'งานเสร็จสิ้น',
  CANCELLED: 'ยกเลิกงาน',
};

// 3) Helper
export const localizeStatus = (raw?: unknown): string => {
  const key = String(raw ?? "") as StatusKey;
  return (STATUS_TH as Record<string, string>)[key] ?? String(raw ?? "");
};

// (ออปชัน) ให้เช็คว่าค่าเป็นสถานะที่รองรับจริงไหม
export const isStatusKey = (raw: unknown): raw is StatusKey =>
  STATUS_ORDER.includes(String(raw) as StatusKey);

// (ออปชัน) index ของสถานะใน stepper
export const statusIndex = (raw: unknown): number =>
  STATUS_ORDER.indexOf(String(raw) as StatusKey);



// RAW (DB/API) → UI (TrackStatus)
export const RAW_TO_TRACK_ALIASES: Record<string, TrackStatus> = {
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
};

// ให้ค่าอะไรก็ได้ → เป็น TrackStatus มาตรฐาน (กันพังด้วย fallback)
export const normalizeToTrackStatus = (raw?: string | null): TrackStatus => {
  const s = String(raw ?? '').trim().toUpperCase().replace(/[^A-Z]/g, '_');
  const candidate = (RAW_TO_TRACK_ALIASES[s] ?? s) as string;
  const ok = (TRACK_STATUSES as readonly string[]).includes(candidate);
  return (ok ? candidate : 'WAITING_CUSTOMER') as TrackStatus;
};

// UI (TrackStatus) → คีย์ที่แบ็กเอนด์ต้องการ (StatusKey)
export const UI_TO_RAW: Record<TrackStatus, StatusKey> = {
  RECEIVED: 'RECEIVED',
  DIAGNOSING: 'DIAGNOSING',
  IN_PROGRESS: 'RECOVERING',
  WAITING_CUSTOMER: 'WAITING_FOR_CUSTOMER_DEVICE',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};




