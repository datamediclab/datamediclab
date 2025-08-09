// app/api/admin/brand-model/route.ts 

import { prisma } from '@/lib/prisma'; // ✨ แก้ไข: นำเข้า Prisma จากไฟล์กลาง
import { NextResponse } from 'next/server';

// Prisma ใช้ไม่ได้บน Edge — บังคับ Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const preferredRegion = ['sin1'];

export const GET = async () => {
  try {
    // quick DB ping (helps surface connection errors in logs)
    await prisma.$queryRaw`select 1 as up`;

    const meta = {
      runtime: process.env.NEXT_RUNTIME ?? 'unknown',
      db: (() => { try { const u = new URL(process.env.DATABASE_URL ?? ''); return { host: `${u.hostname}:${u.port || '5432'}` }; } catch { return null; } })(),
    } as const;

    const models = await prisma.brandModel.findMany({
      select: {
        id: true,
        name: true,
        brand: { select: { id: true, name: true } },
      },
      orderBy: [{ brand: { name: 'asc' } }, { name: 'asc' }],
    });
    return NextResponse.json({ ok: true, data: models, meta });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.error('GET /api/admin/brand-model', message);
    const meta = {
      runtime: process.env.NEXT_RUNTIME ?? 'unknown',
      db: (() => { try { const u = new URL(process.env.DATABASE_URL ?? ''); return { host: `${u.hostname}:${u.port || '5432'}` }; } catch { return null; } })(),
    } as const;
    return NextResponse.json({ ok: false, error: message, meta }, { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    let { name, brandId } = body as { name?: string; brandId?: number | string };

    name = typeof name === 'string' ? name.trim() : undefined;
    if (!name) {
      return NextResponse.json({ ok: false, error: 'ชื่อรุ่นไม่ถูกต้อง' }, { status: 400 });
    }

    if (typeof brandId === 'string') brandId = Number(brandId);
    if (typeof brandId !== 'number' || !Number.isFinite(brandId)) {
      return NextResponse.json({ ok: false, error: 'brandId ไม่ถูกต้อง' }, { status: 400 });
    }

    // ห้ามซ้ำ (unique: name + brandId)
    const dup = await prisma.brandModel.findFirst({ where: { name, brandId } });
    if (dup) {
      return NextResponse.json({ ok: false, error: 'มีรุ่นนี้ในแบรนด์นี้อยู่แล้ว' }, { status: 409 });
    }

    const created = await prisma.brandModel.create({ data: { name, brandId } });
    return NextResponse.json({ ok: true, data: created });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.error('POST /api/admin/brand-model', message);
    const meta = {
      runtime: process.env.NEXT_RUNTIME ?? 'unknown',
      db: (() => { try { const u = new URL(process.env.DATABASE_URL ?? ''); return { host: `${u.hostname}:${u.port || '5432'}` }; } catch { return null; } })(),
    } as const;
    return NextResponse.json({ ok: false, error: message, meta }, { status: 500 });
  }
};


