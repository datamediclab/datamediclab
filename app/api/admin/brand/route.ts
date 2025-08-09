// app/api/admin/brand/route.ts 

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper สำหรับ meta debug
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

export const GET = async () => {
  try {
    await prisma.$queryRaw`select 1 as up`;
    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ ok: true, data: brands, meta: getMeta() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('GET /api/admin/brand', message);
    return NextResponse.json({ ok: false, error: message, meta: getMeta() }, { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'Unsupported Content-Type' }, { status: 415 });
    }

    const body = await req.json();
    const nameRaw = (body as { name?: string }).name;
    const name = typeof nameRaw === 'string' ? nameRaw.trim() : '';
    if (name.length === 0) {
      return NextResponse.json({ ok: false, error: 'ชื่อแบรนด์ไม่ถูกต้อง' }, { status: 400 });
    }

    // ตรวจซ้ำก่อนสร้าง
    const existing = await prisma.brand.findFirst({ where: { name } });
    if (existing) {
      return NextResponse.json({ ok: false, error: 'มีแบรนด์นี้อยู่แล้ว' }, { status: 409 });
    }

    const newBrand = await prisma.brand.create({ data: { name } });
    return NextResponse.json({ ok: true, data: newBrand }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'ข้อมูลซ้ำ (unique)' }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error('POST /api/admin/brand', message);
    return NextResponse.json({ ok: false, error: message, meta: getMeta() }, { status: 500 });
  }
};
