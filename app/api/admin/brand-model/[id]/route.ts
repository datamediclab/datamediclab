// app/api/admin/brand-model/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface BrandModelContext {
  params: Promise<{ id: string }>
}

type JsonOk<T> = { ok: true; data: T };
type JsonErr = { ok: false; error: string };

export async function GET(_req: NextRequest, context: BrandModelContext) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) {
      return NextResponse.json<JsonErr>({ ok: false, error: 'ID ไม่ถูกต้อง' }, { status: 400 });
    }

    const brandModel = await prisma.brandModel.findUnique({
      where: { id },
      include: { brand: true },
    });

    if (!brandModel) {
      return NextResponse.json<JsonErr>({ ok: false, error: 'ไม่พบข้อมูลรุ่นของแบรนด์' }, { status: 404 });
    }

    return NextResponse.json<JsonOk<typeof brandModel>>({ ok: true, data: brandModel });
  } catch (error: unknown) {
    console.error('❌ GET /api/admin/brand-model/[id] error:', error);
    const message = error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลได้';
    return NextResponse.json<JsonErr>({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: BrandModelContext) {
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json<JsonErr>({ ok: false, error: 'Unsupported Content-Type' }, { status: 415 });
    }

    const { id: idStr } = await context.params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) {
      return NextResponse.json<JsonErr>({ ok: false, error: 'ID ต้องเป็นตัวเลข' }, { status: 400 });
    }

    const body = await req.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json<JsonErr>({ ok: false, error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง' }, { status: 400 });
    }

    const { name, brandId } = body as { name?: string; brandId?: number | string };
    const current = await prisma.brandModel.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json<JsonErr>({ ok: false, error: 'ไม่พบข้อมูลรุ่นของแบรนด์ที่ต้องการแก้ไข' }, { status: 404 });
    }

    const dataToUpdate: { name?: string; brandId?: number } = {};

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (trimmed.length === 0) {
        return NextResponse.json<JsonErr>({ ok: false, error: 'name ต้องไม่เป็นค่าว่าง' }, { status: 400 });
      }
      dataToUpdate.name = trimmed;
    }

    if (brandId !== undefined) {
      const numericBrandId = Number(brandId);
      if (!Number.isFinite(numericBrandId)) {
        return NextResponse.json<JsonErr>({ ok: false, error: 'brandId ต้องเป็นตัวเลข' }, { status: 400 });
      }
      const brandExists = await prisma.brand.findUnique({ where: { id: numericBrandId } });
      if (!brandExists) {
        return NextResponse.json<JsonErr>({ ok: false, error: `ไม่พบแบรนด์ ID: ${numericBrandId}` }, { status: 404 });
      }
      dataToUpdate.brandId = numericBrandId;
    }

    const nextName = dataToUpdate.name ?? current.name;
    const nextBrandId = dataToUpdate.brandId ?? current.brandId;
    const dup = await prisma.brandModel.findFirst({
      where: { name: nextName, brandId: nextBrandId, NOT: { id } },
      select: { id: true },
    });
    if (dup) {
      return NextResponse.json<JsonErr>({ ok: false, error: 'ชื่อรุ่นซ้ำในแบรนด์นี้' }, { status: 409 });
    }

    const updated = await prisma.brandModel.update({ where: { id }, data: dataToUpdate });
    return NextResponse.json<JsonOk<typeof updated>>({ ok: true, data: updated }, { status: 200 });
  } catch (error: unknown) {
    console.error('❌ PUT /api/admin/brand-model/[id] error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json<JsonErr>({ ok: false, error: 'ชื่อรุ่นซ้ำในแบรนด์นี้' }, { status: 409 });
      }
      if (error.code === 'P2025') {
        return NextResponse.json<JsonErr>({ ok: false, error: 'ไม่พบข้อมูลรุ่นของแบรนด์ที่ต้องการแก้ไข' }, { status: 404 });
      }
      if (error.code === 'P2003') {
        return NextResponse.json<JsonErr>({ ok: false, error: 'ข้อมูลอ้างอิงไม่ถูกต้อง (foreign key)' }, { status: 409 });
      }
    }
    const message = error instanceof Error ? error.message : 'ไม่สามารถแก้ไขข้อมูลได้';
    return NextResponse.json<JsonErr>({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: BrandModelContext) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) {
      return NextResponse.json<JsonErr>({ ok: false, error: 'ID ต้องเป็นตัวเลข' }, { status: 400 });
    }

    const deleted = await prisma.brandModel.delete({ where: { id } });
    return NextResponse.json<JsonOk<typeof deleted>>({ ok: true, data: deleted });
  } catch (error: unknown) {
    console.error('❌ DELETE /api/admin/brand-model/[id] error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json<JsonErr>({ ok: false, error: 'ไม่พบรุ่นสินค้าที่ต้องการลบ' }, { status: 404 });
      }
      if (error.code === 'P2003') {
        return NextResponse.json<JsonErr>({ ok: false, error: 'ลบไม่ได้ เนื่องจากมีข้อมูลที่อ้างอิงอยู่' }, { status: 409 });
      }
    }
    return NextResponse.json<JsonErr>({ ok: false, error: 'ไม่สามารถลบรุ่นสินค้าได้' }, { status: 500 });
  }
}
