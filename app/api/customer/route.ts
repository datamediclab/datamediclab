// app/api/customer/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, Customer } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// helper สำหรับ debug meta
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

// type ที่คาดหวังจาก client
interface CreateCustomerPayload {
  fullName?: string;
  phone?: string;
  email?: string;
  // ฟิลด์อื่น ๆ ใส่เพิ่มได้ตาม schema จริง เช่น address เป็นต้น
  [key: string]: unknown;
}

export const GET = async () => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ ok: true, data: customers, meta: getMeta() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'ไม่สามารถดึงข้อมูลลูกค้าได้';
    console.error('GET /api/customer error:', error);
    return NextResponse.json({ ok: false, error: message, meta: getMeta() }, { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'Unsupported Content-Type' }, { status: 415 });
    }

    const body = (await req.json()) as CreateCustomerPayload;
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ ok: false, error: 'รูปแบบข้อมูลไม่ถูกต้อง' }, { status: 400 });
    }

    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';

    if (fullName.length === 0 && phone.length === 0) {
      return NextResponse.json({ ok: false, error: 'ต้องระบุอย่างน้อยชื่อหรือเบอร์โทร' }, { status: 400 });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'อีเมลไม่ถูกต้อง' }, { status: 400 });
    }

    const data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> = {
      fullName,
      phone,
      email,
      ...body,
    } as Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;

    const created = await prisma.customer.create({ data });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ ok: false, error: 'ข้อมูลซ้ำ (unique)' }, { status: 409 });
      }
    }
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเพิ่มลูกค้า';
    console.error('POST /api/customer error:', error);
    return NextResponse.json({ ok: false, error: message, meta: getMeta() }, { status: 500 });
  }
};

// PATCH: enforce required fields for prisma.customer.create
// (Applied above in POST handler)
