// app/api/customer/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ใช้มาตรฐานเดียวกับ API อื่น ๆ: params เป็น Promise
interface Ctx { params: Promise<{ id: string }> }

type JsonOk<T> = { ok: true; data: T };
type JsonErr = { ok: false; error: string };

// ---- PUT: อัปเดตข้อมูลลูกค้าตาม id ----
export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json<JsonErr>({ ok: false, error: 'Unsupported Content-Type' }, { status: 415 });
    }

    const { id } = await params;
    const customerId = Number(id);
    if (!Number.isFinite(customerId)) {
      return NextResponse.json<JsonErr>({ ok: false, error: 'ID ต้องเป็นตัวเลข' }, { status: 400 });
    }

    const body = await req.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json<JsonErr>({ ok: false, error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง' }, { status: 400 });
    }

    // ป้องกันกรณีส่ง {} มาอัปเดต
    if (Object.keys(body as object).length === 0) {
      return NextResponse.json<JsonErr>({ ok: false, error: 'ไม่มีข้อมูลสำหรับอัปเดต' }, { status: 400 });
    }

    // อัปเดตและคืนค่าล่าสุด
    const updated = await prisma.customer.update({ where: { id: customerId }, data: body });
    return NextResponse.json<JsonOk<typeof updated>>({ ok: true, data: updated }, { status: 200 });
  } catch (error: unknown) {
    console.error('❌ PUT /api/customer/[id] error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json<JsonErr>({ ok: false, error: 'ไม่พบลูกค้าที่ต้องการอัปเดต' }, { status: 404 });
      }
      if (error.code === 'P2002') {
        return NextResponse.json<JsonErr>({ ok: false, error: 'ข้อมูลซ้ำ (unique)' }, { status: 409 });
      }
      if (error.code === 'P2003') {
        return NextResponse.json<JsonErr>({ ok: false, error: 'ข้อมูลอ้างอิงไม่ถูกต้อง (foreign key)' }, { status: 409 });
      }
    }
    const message = error instanceof Error ? error.message : 'ไม่สามารถอัปเดตลูกค้าได้';
    return NextResponse.json<JsonErr>({ ok: false, error: message }, { status: 500 });
  }
}

// ---- DELETE: ลบลูกค้าตาม id ----
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const customerId = Number(id);
    if (!Number.isFinite(customerId)) {
      return NextResponse.json<JsonErr>({ ok: false, error: 'ID ต้องเป็นตัวเลข' }, { status: 400 });
    }

    const deleted = await prisma.customer.delete({ where: { id: customerId } });
    return NextResponse.json<JsonOk<typeof deleted>>({ ok: true, data: deleted }, { status: 200 });
  } catch (error: unknown) {
    console.error('❌ DELETE /api/customer/[id] error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json<JsonErr>({ ok: false, error: 'ไม่พบลูกค้าที่ต้องการลบ' }, { status: 404 });
      }
      if (error.code === 'P2003') {
        return NextResponse.json<JsonErr>({ ok: false, error: 'ลบไม่ได้ เนื่องจากมีข้อมูลที่อ้างอิงอยู่' }, { status: 409 });
      }
    }
    return NextResponse.json<JsonErr>({ ok: false, error: 'ไม่สามารถลบลูกค้าได้' }, { status: 500 });
  }
}
