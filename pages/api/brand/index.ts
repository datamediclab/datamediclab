// pages/api/brand/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });
    res.status(200).json(brands);
  } catch (error) {
    console.error('[API] Get Brands Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
