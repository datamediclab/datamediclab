// app/api/admin/brand/route.ts 

import { prisma } from '@/lib/prisma'; // ✨ แก้ไข: นำเข้า Prisma จากไฟล์กลาง
import { NextResponse } from 'next/server';

// บังคับให้ใช้ Node.js runtime (Prisma ใช้ไม่ได้บน Edge)
export const runtime = 'nodejs';
// กัน cache ระหว่างดีบั๊ก และให้รันเสมอจากฟังก์ชัน
export const dynamic = 'force-dynamic';

export const GET = async () => {
  try {
    await prisma.$queryRaw`select 1 as up`;

    const meta = {
      runtime: process.env.NEXT_RUNTIME ?? 'unknown',
      db: (() => { try { const u = new URL(process.env.DATABASE_URL ?? ''); return { host: `${u.hostname}:${u.port || '5432'}` }; } catch { return null; } })(),
    } as const;

    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ ok: true, data: brands, meta });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('GET /api/admin/brand', message);
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
    const { name } = body as { name?: string };

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ ok: false, error: 'ชื่อแบรนด์ไม่ถูกต้อง' }, { status: 400 });
    }

    const existing = await prisma.brand.findFirst({ where: { name } });
    if (existing) {
      return NextResponse.json({ ok: false, error: 'มีแบรนด์นี้อยู่แล้ว' }, { status: 409 });
    }

    const newBrand = await prisma.brand.create({ data: { name } });
    return NextResponse.json({ ok: true, data: newBrand });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('POST /api/admin/brand', message);
    const meta = {
      runtime: process.env.NEXT_RUNTIME ?? 'unknown',
      db: (() => { try { const u = new URL(process.env.DATABASE_URL ?? ''); return { host: `${u.hostname}:${u.port || '5432'}` }; } catch { return null; } })(),
    } as const;
    return NextResponse.json({ ok: false, error: message, meta }, { status: 500 });
  }
};
