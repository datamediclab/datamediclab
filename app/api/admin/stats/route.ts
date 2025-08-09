// app/api/admin/stats/route.ts 
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper meta (ดีบั๊ก host/port ปัจจุบันของ DB และ runtime)
const getMeta = () => ({
  runtime: process.env.NEXT_RUNTIME ?? 'unknown',
  db: (() => {
    try {
      const u = new URL(process.env.DATABASE_URL ?? '');
      return { host: `${u.hostname}:${u.port || '5432'}` };
    } catch {
      return null;
    }
  })(),
} as const);

// สถานะของงานกู้ข้อมูลที่ระบบรองรับ (string union type)
const statusKeys = [
  'WAITING_FOR_CUSTOMER_DEVICE',
  'UNDER_DIAGNOSIS',
  'ANALYSIS_COMPLETE',
  'RECOVERY_IN_PROGRESS',
  'RECOVERY_SUCCESSFUL',
  'RECOVERY_FAILED',
  'DEVICE_RETURNED',
] as const;

export type StatusKey = typeof statusKeys[number];

export const GET = async () => {
  try {
    // รวมสถิติรวม (กัน error ของตารางที่อาจยังไม่สร้างด้วย try/catch รายตัว)
    const [adminCount, brandCount, customerCount, deviceCount] = await Promise.all([
      prisma.admin.count().catch(() => 0),
      prisma.brand.count().catch(() => 0),
      prisma.customer.count().catch(() => 0),
      prisma.device.count().catch(() => 0),
    ]);

    // เตรียมตัวนับสถานะแบบ map
    const counts: Record<StatusKey, number> = Object.fromEntries(
      statusKeys.map((k) => [k, 0])
    ) as Record<StatusKey, number>;

    // 1) พยายามนับจาก RecoveryJob.status ก่อน
    try {
      const groupedJob = await prisma.recoveryJob.groupBy({
        by: ['status'],
        _count: { _all: true },
      });
      for (const row of groupedJob as Array<{ status: string; _count: { _all: number } }>) {
        if ((statusKeys as readonly string[]).includes(row.status)) {
          counts[row.status as StatusKey] = row._count._all;
        }
      }
    } catch {
      // ตารางอาจยังไม่พร้อม: ข้ามไปใช้ fallback ด้านล่าง
    }

    // 2) ถ้ารวมแล้วยังเป็นศูนย์ → fallback ไปนับจาก Device.currentStatus
    const sumFromJobs = Object.values(counts).reduce((a, b) => a + b, 0);
    if (sumFromJobs === 0) {
      try {
        const groupedDevice = await prisma.device.groupBy({
          by: ['currentStatus'],
          _count: { _all: true },
        });
        for (const row of groupedDevice as Array<{ currentStatus: string; _count: { _all: number } }>) {
          if ((statusKeys as readonly string[]).includes(row.currentStatus)) {
            counts[row.currentStatus as StatusKey] = row._count._all;
          }
        }
      } catch {
        // ตาราง/คอลัมน์อาจยังไม่พร้อม: ปล่อยให้นับเป็น 0
      }
    }

    const totalRecoveryJobs = Object.values(counts).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      ok: true,
      data: {
        admin: adminCount,
        brand: brandCount,
        customer: customerCount,
        device: deviceCount,
        recoveryJob: totalRecoveryJobs,
        statuses: counts,
      },
      meta: getMeta(),
    });
  } catch (error) {
    console.error('GET /api/admin/stats', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ ok: false, error: message, meta: getMeta() }, { status: 500 });
  }
};
