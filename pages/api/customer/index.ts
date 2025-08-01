// pages/api/customer/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { fullName: 'asc' },
      select: {
        id: true,
        fullName: true,
      },
    });
    res.status(200).json(customers);
  } catch (error) {
    console.error('[API] Get Customers Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
