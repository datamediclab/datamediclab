// app/api/admin/stats/route.ts 
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export const GET = async () => {
  try {
    // รวมสถิติรวม
    const [adminCount, brandCount, customerCount, deviceCount] = await Promise.all([
      prisma.admin.count(),
      prisma.brand.count(),
      prisma.customer.count(),
      prisma.device.count(),
    ]);

    // นับงานกู้ข้อมูลแยกตามสถานะ
    const statusKeys = [
      'WAITING_FOR_CUSTOMER_DEVICE',
      'UNDER_DIAGNOSIS',
      'ANALYSIS_COMPLETE',
      'RECOVERY_IN_PROGRESS',
      'RECOVERY_SUCCESSFUL',
      'RECOVERY_FAILED',
      'DEVICE_RETURNED',
    ] as const;

    type StatusKey = typeof statusKeys[number];
    const statusCounts: Record<StatusKey, number> = {
      WAITING_FOR_CUSTOMER_DEVICE: 0,
      UNDER_DIAGNOSIS: 0,
      ANALYSIS_COMPLETE: 0,
      RECOVERY_IN_PROGRESS: 0,
      RECOVERY_SUCCESSFUL: 0,
      RECOVERY_FAILED: 0,
      DEVICE_RETURNED: 0,
    };

    // 1) พยายามนับจาก RecoveryJob.status ก่อน
    try {
      const groupedJob = await prisma.recoveryJob.groupBy({
        by: ['status'],
        _count: { _all: true },
      });
      for (const row of groupedJob as unknown as { status: StatusKey; _count: { _all: number } }[]) {
        if (statusKeys.includes(row.status)) statusCounts[row.status] = row._count._all;
      }
    } catch {/* ignore */}

    // 2) ถ้ารวมแล้วยังเป็นศูนย์ → fallback ไปนับจาก Device.currentStatus (ดูจากสกรีน DB คุณมีค่านี้)
    const totalFromJob = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    if (totalFromJob === 0) {
      try {
        const groupedDevice = await prisma.device.groupBy({
          by: ['currentStatus'],
          _count: { _all: true },
        });
        for (const row of groupedDevice as unknown as { currentStatus: StatusKey; _count: { _all: number } }[]) {
          if (statusKeys.includes(row.currentStatus)) statusCounts[row.currentStatus] = row._count._all;
        }
      } catch {/* ignore */}
    }

    const totalRecoveryJobs = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      admin: adminCount,
      brand: brandCount,
      customer: customerCount,
      device: deviceCount,
      recoveryJob: totalRecoveryJobs,
      ...statusCounts,
    });
  } catch (error) {
    console.error('GET /api/admin/stats', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};