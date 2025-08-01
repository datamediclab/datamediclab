// pages/api/device/create.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma'; // คุณต้องมี lib/prisma.ts ที่สร้าง PrismaClient

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const {
      customerId,
      brandId,
      deviceType,
      capacity,
      serialNumber,
      description,
      currentStatus,
    } = req.body;

    const device = await prisma.device.create({
      data: {
        customerId,
        brandId,
        deviceType,
        capacity,
        serialNumber,
        description,
        currentStatus,
      },
    });

    return res.status(200).json(device);
  } catch (error) {
    console.error('[API] Create Device Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
