// app/api/admin/stats/route.ts 
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper meta (ใช้ดู runtime และปลายทาง DB อย่างย่อ)
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

// สถานะงานกู้ข้อมูลที่ระบบรองรับ (string union)
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

type StatsOk = {
  ok: true;
  data: {
    admin: number;
    brand: number;
    customer: number;
    device: number;
    recoveryJob: number;
    statuses: Record<StatusKey, number>;
  };
  meta: ReturnType<typeof getMeta>;
};

type StatsErr = {
  ok: false;
  error: string;
  meta: ReturnType<typeof getMeta>;
};

export async function GET(_req: NextRequest) {
  try {
    // Health check: ยืนยันว่า connection ใช้งานได้จริงบน Vercel
    await prisma.$queryRaw`select 1 as up`;

    // นับสถิติรวมหลัก ๆ (กัน error รายตัวด้วย .catch(() => 0))
    const [adminCount, brandCount, customerCount, deviceCount] = await Promise.all([
      prisma.admin.count().catch(() => 0),
      prisma.brand.count().catch(() => 0),
      prisma.customer.count().catch(() => 0),
      prisma.device.count().catch(() => 0),
    ]);

    // เตรียมตัวนับสถานะ
    const counts: Record<StatusKey, number> = Object.fromEntries(
      statusKeys.map((k) => [k, 0])
    ) as Record<StatusKey, number>;

    // 1) พยายามดึงจาก recoveryJob.status ก่อน
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
      // ตารางอาจยังไม่พร้อม: ข้าม
    }

    // 2) ถ้าจำนวนทั้งหมดจาก jobs ยังเป็น 0 → ลอง fallback จาก device.currentStatus
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
        // ตาราง/คอลัมน์อาจยังไม่พร้อม: ปล่อย 0
      }
    }

    const totalRecoveryJobs = Object.values(counts).reduce((a, b) => a + b, 0);

    return NextResponse.json<StatsOk>({
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
  } catch (error: unknown) {
    // จัดการ Prisma errors แยกเป็นรายเคส
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json<StatsErr>({ ok: false, error: 'ฐานข้อมูลไม่พร้อมใช้งาน', meta: getMeta() }, { status: 503 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json<StatsErr>({ ok: false, error: `ข้อผิดพลาดฐานข้อมูล (${error.code})`, meta: getMeta() }, { status: 500 });
    }

    console.error('GET /api/admin/stats', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json<StatsErr>({ ok: false, error: message, meta: getMeta() }, { status: 500 });
  }
}
