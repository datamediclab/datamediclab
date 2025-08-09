
// app/api/admin/brand-model/route.ts 

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async () => {
  try {
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
    // 4) Validation + Content-Type
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'Unsupported Content-Type' }, { status: 415 });
    }

    const body = await req.json();
    let { name, brandId } = body as { name?: string; brandId?: number | string };

    name = typeof name === 'string' ? name.trim() : '';
    if (name.length === 0) {
      return NextResponse.json({ ok: false, error: 'ชื่อรุ่นไม่ถูกต้อง' }, { status: 400 });
    }

    if (typeof brandId === 'string') brandId = Number(brandId);
    if (typeof brandId !== 'number' || !Number.isFinite(brandId)) {
      return NextResponse.json({ ok: false, error: 'brandId ไม่ถูกต้อง' }, { status: 400 });
    }

    // 2) ตรวจสอบว่า brand มีอยู่จริง
    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) {
      return NextResponse.json({ ok: false, error: 'ไม่พบแบรนด์ที่เลือก' }, { status: 400 });
    }

    const dup = await prisma.brandModel.findFirst({ where: { name, brandId } });
    if (dup) {
      return NextResponse.json({ ok: false, error: 'มีรุ่นนี้ในแบรนด์นี้อยู่แล้ว' }, { status: 409 });
    }

    const created = await prisma.brandModel.create({ data: { name, brandId } });
    // 1) คืน 201 เมื่อสร้างสำเร็จ
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (error: unknown) {
    // 3) รองรับ Unique Constraint
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'ข้อมูลซ้ำ (unique)' }, { status: 409 });
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error('POST /api/admin/brand-model', message);
    const meta = {
      runtime: process.env.NEXT_RUNTIME ?? 'unknown',
      db: (() => { try { const u = new URL(process.env.DATABASE_URL ?? ''); return { host: `${u.hostname}:${u.port || '5432'}` }; } catch { return null; } })(),
    } as const;
    return NextResponse.json({ ok: false, error: message, meta }, { status: 500 });
  }
};
