// app/api/admin/brand-model/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma' // ✨ แก้ไข: นำเข้า Prisma จากไฟล์กลาง
import { Prisma } from '@prisma/client' // ✅ เพิ่มเพื่อใช้ตรวจจับ error

type BrandModelContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: BrandModelContext) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID ไม่ถูกต้อง' }, { status: 400 });
    }

    const brandModel = await prisma.brandModel.findUnique({
      where: { id },
      include: {
        brand: true,
      },
    });

    if (!brandModel) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลรุ่นของแบรนด์' }, { status: 404 });
    }

    return NextResponse.json(brandModel);
  } catch (error) {
    console.error('❌ GET BrandModel Error:', error);
    const message = error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลได้';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ✅ PUT: แก้ไขข้อมูลรุ่นของแบรนด์
export async function PUT(req: NextRequest, context: BrandModelContext) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID ไม่ถูกต้อง' }, { status: 400 });
    }

    const body = await req.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง' }, { status: 400 });
    }

    const { name, brandId } = body;

    if (!name && !brandId) {
      return NextResponse.json(
        { error: 'กรุณาระบุข้อมูลที่ต้องการแก้ไข (name หรือ brandId)' },
        { status: 400 }
      );
    }

    const dataToUpdate: { name?: string; brandId?: number } = {};
    if (name) {
      dataToUpdate.name = name;
    }
    if (brandId) {
      const numericBrandId = Number(brandId);
      if (isNaN(numericBrandId)) {
        return NextResponse.json({ error: 'brandId ต้องเป็นตัวเลข' }, { status: 400 });
      }
      dataToUpdate.brandId = numericBrandId;
      const brandExists = await prisma.brand.findUnique({ where: { id: numericBrandId } });
      if (!brandExists) {
        return NextResponse.json({ error: `ไม่พบแบรนด์ที่มี ID: ${brandId}` }, { status: 404 });
      }
    }

    const updatedBrandModel = await prisma.brandModel.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedBrandModel);
  } catch (error: unknown) {
    console.error('❌ PUT BrandModel Error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'ไม่พบข้อมูลรุ่นของแบรนด์ที่ต้องการแก้ไข' }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : 'ไม่สามารถแก้ไขข้อมูลได้';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ✅ DELETE: ลบข้อมูลรุ่นของแบรนด์
export async function DELETE(req: NextRequest, context: BrandModelContext) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'id ต้องเป็นตัวเลข' }, { status: 400 });
    }

    const deleted = await prisma.brandModel.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deleted });
  } catch (err: unknown) {
    console.error('❌ DELETE BrandModel Error:', err);

    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json(
        { error: `ไม่พบรุ่นสินค้าที่ต้องการลบ (ID: ${context.params})` },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: 'ไม่สามารถลบรุ่นสินค้าได้' }, { status: 500 });
  }
}
