// app/api/track-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function formatThai(dt: Date) {
  return dt.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phoneRaw = searchParams.get('phone');
    const phone = typeof phoneRaw === 'string' ? phoneRaw.trim() : '';

    if (!phone) {
      return NextResponse.json({ ok: false, error: 'กรุณาระบุหมายเลขโทรศัพท์' }, { status: 400 });
    }

    const customer = await prisma.customer.findFirst({
      where: { phone },
      select: { id: true, fullName: true },
    });

    if (!customer) {
      return NextResponse.json({ ok: false, error: 'ไม่พบบัญชีลูกค้าสำหรับหมายเลขโทรศัพท์นี้' }, { status: 404 });
    }

    const device = await prisma.device.findFirst({
      where: { customerId: customer.id },
      include: {
        brand: { select: { name: true } },
        model: { select: { name: true } },
      },
      orderBy: [
        { updatedAt: 'desc' },
        { receivedAt: 'desc' },
        { id: 'desc' },
      ],
    });

    if (!device) {
      return NextResponse.json({ ok: false, error: 'ไม่พบประวัติการรับอุปกรณ์ของลูกค้ารายนี้' }, { status: 404 });
    }

    const updated = device.updatedAt ?? device.receivedAt ?? new Date();

    return NextResponse.json({
      ok: true,
      data: {
        currentStatus: String(device.currentStatus),
        customerName: customer.fullName,
        brandName: device.brand?.name ?? null,
        deviceModel: device.model?.name ?? null,
        serialNumber: device.serialNumber ?? null,
        updatedAt: formatThai(updated),
      },
    });
  } catch (err: unknown) {
    console.error('GET /api/track-status error:', err);
    const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}