// app/api/customer/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newCustomer = await prisma.customer.create({ data });
    return NextResponse.json(newCustomer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเพิ่มลูกค้า';
    console.error('❌ customer POST error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}