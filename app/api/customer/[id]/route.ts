// app/api/customer/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await req.json();
    const updated = await prisma.customer.update({
      where: { id: parseInt(id, 10) },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ไม่สามารถอัปเดตลูกค้าได้';
    console.error('❌ customer PUT error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.customer.delete({ where: { id: parseInt(id, 10) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ไม่สามารถลบลูกค้าได้';
    console.error('❌ customer DELETE error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
