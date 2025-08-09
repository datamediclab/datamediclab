// app/api/customer/search/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const qRaw = url.searchParams.get('q');
    const q = typeof qRaw === 'string' ? qRaw.trim() : '';

    if (q.length === 0) {
      return NextResponse.json({ ok: true, data: [] });
    }

    const result = await prisma.customer.findMany({
      where: {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'ไม่สามารถค้นหาได้';
    console.error('GET /api/customer/search', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
