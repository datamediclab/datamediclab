import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const devices = await prisma.device.findMany({
      orderBy: { receivedAt: 'desc' },
      include: {
        customer: { select: { fullName: true } },
        brand: { select: { name: true } },
      },
    });

    res.status(200).json(devices);
  } catch (error) {
    console.error('[API] Get Device List Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
