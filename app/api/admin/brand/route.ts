// app/api/admin/brand/route.ts 

import prisma from '@/lib/prisma'; // ✨ แก้ไข: นำเข้า Prisma จากไฟล์กลาง
import { NextResponse } from 'next/server';

// ✨ ไม่ต้องใช้ const prisma = new PrismaClient(); อีกต่อไป

export const dynamic = 'force-dynamic';

export const GET = async () => {
  try {
    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(brands);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('GET /api/admin/brand', error.message);
    } else {
      console.error('GET /api/admin/brand', 'Unknown error', error);
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'ชื่อแบรนด์ไม่ถูกต้อง' }, { status: 400 });
    }

    const existing = await prisma.brand.findFirst({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: 'มีแบรนด์นี้อยู่แล้ว' }, { status: 409 });
    }

    const newBrand = await prisma.brand.create({
      data: { name },
    });

    return NextResponse.json(newBrand);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('POST /api/admin/brand', error.message);
    } else {
      console.error('POST /api/admin/brand', 'Unknown error', error);
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
