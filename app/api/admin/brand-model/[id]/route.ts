// app/api/admin/brand-model/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// โปรเจกต์นี้ใช้รูปแบบ params เป็น Promise ให้สอดคล้องทั้งแอป
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'ID ไม่ถูกต้อง' }, { status: 400 });

    const brandModel = await prisma.brandModel.findUnique({
      where: { id },
      include: { brand: true },
    });
    if (!brandModel) return NextResponse.json({ error: 'ไม่พบข้อมูลรุ่นของแบรนด์' }, { status: 404 });

    return NextResponse.json(brandModel);
  } catch (error) {
    console.error('❌ GET BrandModel Error:', error);
    const message = error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลได้';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'ID ไม่ถูกต้อง' }, { status: 400 });

    const body = await req.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง' }, { status: 400 });
    }

    const { name, brandId } = body as { name?: string; brandId?: number | string };
    if (!name && brandId === undefined) {
      return NextResponse.json({ error: 'กรุณาระบุ name หรือ brandId อย่างน้อยหนึ่งอย่าง' }, { status: 400 });
    }

    const dataToUpdate: { name?: string; brandId?: number } = {};
    if (name) dataToUpdate.name = String(name);

    if (brandId !== undefined) {
      const numericBrandId = Number(brandId);
      if (Number.isNaN(numericBrandId)) {
        return NextResponse.json({ error: 'brandId ต้องเป็นตัวเลข' }, { status: 400 });
      }
      const brandExists = await prisma.brand.findUnique({ where: { id: numericBrandId } });
      if (!brandExists) return NextResponse.json({ error: `ไม่พบแบรนด์ ID ${numericBrandId}` }, { status: 404 });
      dataToUpdate.brandId = numericBrandId;
    }

    const updated = await prisma.brandModel.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('❌ PUT BrandModel Error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'ไม่พบข้อมูลรุ่นของแบรนด์ที่ต้องการแก้ไข' }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : 'ไม่สามารถแก้ไขข้อมูลได้';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'ID ต้องเป็นตัวเลข' }, { status: 400 });

    const deleted = await prisma.brandModel.delete({ where: { id } });
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error('❌ DELETE BrandModel Error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'ไม่พบรุ่นสินค้าที่ต้องการลบ' }, { status: 404 });
    }
    return NextResponse.json({ error: 'ไม่สามารถลบรุ่นสินค้าได้' }, { status: 500 });
  }
}
