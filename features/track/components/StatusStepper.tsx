// features/track/components/StatusStepper.tsx

"use client";
import React, { useMemo } from "react";
import { Check, Package, Inbox, Search, Receipt, BadgeCheck, HardDrive, PartyPopper, Ban } from "lucide-react";
import { STATUS_TH, STATUS_ORDER } from "@/lib/status";

// derive a type from STATUS_ORDER (no external type import required)
export type StatusKey = (typeof STATUS_ORDER)[number];
const toStatusKey = (s: string | null | undefined): StatusKey | null => {
  if (!s) return null;
  return (STATUS_ORDER as readonly string[]).includes(s) ? (s as StatusKey) : null;
};

/**
 * แถบขั้นตอนสถานะงานแบบกราฟิก (Stepper)
 * ใช้แสดงลำดับสถานะตั้งแต่ต้นจนจบ พร้อมไฮไลท์สถานะปัจจุบัน
 */

// ไอคอนต่อสถานะ (เลือกที่สื่อความหมายง่าย ๆ)
const STATUS_ICON: Partial<Record<StatusKey, React.ReactNode>> = {
  WAITING_FOR_CUSTOMER_DEVICE: <Package className="w-4 h-4" />, // กล่อง = ยังรอรับของ
  RECEIVED: <Inbox className="w-4 h-4" />,                      // รับเข้า
  DIAGNOSING: <Search className="w-4 h-4" />,                   // ตรวจเช็ค
  QUOTED: <Receipt className="w-4 h-4" />,                      // แจ้งราคา/ใบเสนอราคา
  APPROVED: <BadgeCheck className="w-4 h-4" />,                 // อนุมัติ
  RECOVERING: <HardDrive className="w-4 h-4" />,                // กู้ข้อมูล/ทำงาน
  READY_FOR_PICKUP: <Check className="w-4 h-4" />,              // พร้อมรับ
  COMPLETED: <PartyPopper className="w-4 h-4" />,               // เสร็จงาน 🎉
  CANCELLED: <Ban className="w-4 h-4" />,                       // ยกเลิก
};

export type StatusStepperProps = {
  /** สถานะปัจจุบัน (raw key) เช่น WAITING_FOR_CUSTOMER_DEVICE */
  currentStatus?: string | null;
  /** แสดง label ใต้แต่ละจุดไหม (ค่าเริ่มต้น: true) */
  showLabels?: boolean;
  /** คลาสเพิ่มเติมของคอมโพเนนต์ */
  className?: string;
};

const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus, showLabels = true, className }) => {
  const sk = useMemo(() => toStatusKey(currentStatus), [currentStatus]);
  const index = useMemo(() => (sk ? STATUS_ORDER.indexOf(sk) : -1), [sk]);

  const isCancelled = sk === "CANCELLED";
  const steps: readonly StatusKey[] = STATUS_ORDER;
  const maxIdx = steps.length - 1;
  const progressPct = index < 0 ? 0 : (index / Math.max(1, maxIdx)) * 100;

  return (
    <div className={"relative w-full " + (className ?? "")}> 
      {/* เส้นพื้นหลัง */}
      <div className="absolute left-0 right-0 top-5 h-[3px] md:top-6 md:h-1 bg-gray-300" />
      {/* เส้นความคืบหน้า */}
      {!isCancelled && (
        <div className="absolute left-0 top-5 h-[3px] md:top-6 md:h-1 bg-green-600 transition-all" style={{ width: `${progressPct}%` }} />
      )}

      <ol className="relative z-10 flex items-center justify-between gap-3 md:gap-4">
        {steps.map((key, i) => {
          const isDone = !isCancelled && index > i;
          const isCurrent = !isCancelled && index === i;

          const baseCircle = "w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center text-xs";
          const circleCls = isCancelled
            ? "bg-red-100 border-red-300 text-red-700"
            : isDone
              ? "bg-green-600 border-green-600 text-white"
              : isCurrent
                ? "bg-white border-blue-600 text-blue-700 ring-2 ring-blue-200"
                : "bg-gray-200 border-gray-300 text-gray-500";

          const icon = isDone ? <Check className="w-4 h-4" /> : STATUS_ICON[key] ?? <Check className="w-4 h-4" />;

          return (
            <li key={key} className="flex-1 flex flex-col items-center text-center">
              <div className={`${baseCircle} ${circleCls}`}>{icon}</div>
              {showLabels && (
                <div className="mt-2 text-[10px] sm:text-xs md:text-sm text-gray-700 leading-tight">
                  {STATUS_TH[key] ?? key}
                </div>
              )}
            </li>
          );
        })}

        {isCancelled && (
          <li className="flex-1 flex flex-col items-center text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 bg-red-600 border-red-600 text-white flex items-center justify-center">
              {STATUS_ICON.CANCELLED}
            </div>
            {showLabels && (
              <div className="mt-2 text-[10px] sm:text-xs md:text-sm text-red-700 leading-tight">{STATUS_TH.CANCELLED ?? "ยกเลิกงาน"}</div>
            )}
          </li>
        )}
      </ol>
    </div>
  );
};

export default StatusStepper;
