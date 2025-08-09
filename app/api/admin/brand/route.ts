// app/api/admin/brand/route.ts 

import { prisma } from '@/lib/prisma'; // ✨ แก้ไข: นำเข้า Prisma จากไฟล์กลาง
import { NextResponse } from 'next/server';

// บังคับให้ใช้ Node.js runtime (Prisma ใช้ไม่ได้บน Edge)
export const runtime = 'nodejs';
// กัน cache ระหว่างดีบั๊ก และให้รันเสมอจากฟังก์ชัน
export const dynamic = 'force-dynamic';

// ✨ ไม่ต้องใช้ const prisma = new PrismaClient(); อีกต่อไป

export const GET = async () => {
  try {
    // quick DB ping (helps surface connection errors in logs)
    await prisma.$queryRaw`select 1 as up`;

    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ ok: true, data: brands });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.error('GET /api/admin/brand', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
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
    // eslint-disable-next-line no-console
    console.error('POST /api/admin/brand', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
};
