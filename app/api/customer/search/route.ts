// app/api/customer/search/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';

  if (!q) return NextResponse.json([]);

  const result = await prisma.customer.findMany({
    where: {
      OR: [
        { fullName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return NextResponse.json(result);
}
