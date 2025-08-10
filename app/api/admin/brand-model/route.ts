// app/api/admin/brand-model/route.ts 

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type BrandModelWhere = {
  name?: { contains: string; mode: 'insensitive' };
  brandId?: number;
};

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

export async function GET(req: NextRequest) {
  try {
    await prisma.$queryRaw`select 1 as up`;

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const brandIdParam = searchParams.get('brandId');
    const brandId = brandIdParam ? Number(brandIdParam) : undefined;
    const takeParam = Number(searchParams.get('take') || '100');
    const take = Number.isFinite(takeParam) && takeParam > 0 && takeParam <= 500 ? takeParam : 100;

    const where: BrandModelWhere = {};
    if (q) where.name = { contains: q, mode: 'insensitive' };
    if (Number.isFinite(brandId)) where.brandId = Number(brandId);

    const models = await prisma.brandModel.findMany({
      where: Object.keys(where).length ? where : undefined,
      select: {
        id: true,
        name: true,
        brandId: true,
        createdAt: true,
        updatedAt: true,
        brand: { select: { id: true, name: true } },
      },
      orderBy: [{ brand: { name: 'asc' } }, { name: 'asc' }],
      take,
    });
    return NextResponse.json({ ok: true, data: models, meta: getMeta() });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json({ ok: false, error: 'ฐานข้อมูลไม่พร้อมใช้งาน', meta: getMeta() }, { status: 503 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ ok: false, error: `ข้อผิดพลาดฐานข้อมูล (${error.code})`, meta: getMeta() }, { status: 500 });
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error('GET /api/admin/brand-model', message);
    return NextResponse.json({ ok: false, error: message, meta: getMeta() }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'Unsupported Content-Type' }, { status: 415 });
    }

    const body = (await req.json()) as { name?: string; brandId?: number | string };

    const rawName = body.name;
    const name = typeof rawName === 'string' ? rawName.trim().split(' ').filter(Boolean).join(' ') : '';
    if (name.length === 0) {
      return NextResponse.json({ ok: false, error: 'ชื่อรุ่นไม่ถูกต้อง' }, { status: 400 });
    }

    const rawBrandId = body.brandId;
    const parsedBrandId = typeof rawBrandId === 'string' ? Number(rawBrandId) : rawBrandId;
    if (typeof parsedBrandId !== 'number' || !Number.isFinite(parsedBrandId)) {
      return NextResponse.json({ ok: false, error: 'brandId ไม่ถูกต้อง' }, { status: 400 });
    }

    const brand = await prisma.brand.findUnique({ where: { id: parsedBrandId }, select: { id: true } });
    if (!brand) {
      return NextResponse.json({ ok: false, error: 'ไม่พบแบรนด์ที่เลือก' }, { status: 404 });
    }

    const dup = await prisma.brandModel.findFirst({ where: { name, brandId: parsedBrandId }, select: { id: true } });
    if (dup) {
      return NextResponse.json({ ok: false, error: 'มีรุ่นนี้ในแบรนด์นี้อยู่แล้ว' }, { status: 409 });
    }

    const created = await prisma.brandModel.create({
      data: { name, brandId: parsedBrandId },
      select: { id: true, name: true, brandId: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ ok: false, error: 'ข้อมูลซ้ำ (unique)' }, { status: 409 });
      }
      return NextResponse.json({ ok: false, error: `ข้อผิดพลาดฐานข้อมูล (${error.code})` }, { status: 500 });
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json({ ok: false, error: 'ฐานข้อมูลไม่พร้อมใช้งาน' }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error('POST /api/admin/brand-model', message);
    return NextResponse.json({ ok: false, error: message, meta: getMeta() }, { status: 500 });
  }
}
