// app/api/admin/stats/route.ts 
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { STATUS_ORDER, type StatusKey } from '@/lib/status';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

export async function GET() {
  try {
    // ดึงข้อมูลจาก DB โดยตรง
    const [adminCount, brandCount, customerCount, deviceCount] = await Promise.all([
      prisma.admin.count(),
      prisma.brand.count(),
      prisma.customer.count(),
      prisma.device.count(),
    ]);

    const counts: Record<StatusKey, number> = Object.fromEntries(
      STATUS_ORDER.map((k) => [k, 0])
    ) as Record<StatusKey, number>;

    const groupedJob = await prisma.recoveryJob.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    for (const row of groupedJob as Array<{ status: string; _count: { _all: number } }>) {
      if ((STATUS_ORDER as readonly string[]).includes(row.status)) {
        counts[row.status as StatusKey] = row._count._all;
      }
    }

    if (Object.values(counts).reduce((a, b) => a + b, 0) === 0) {
      const groupedDevice = await prisma.device.groupBy({
        by: ['currentStatus'],
        _count: { _all: true },
      });
      for (const row of groupedDevice as Array<{ currentStatus: string; _count: { _all: number } }>) {
        if ((STATUS_ORDER as readonly string[]).includes(row.currentStatus)) {
          counts[row.currentStatus as StatusKey] = row._count._all;
        }
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
