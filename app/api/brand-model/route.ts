// app/api/brand-model/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const GET = async () => {
  try {
    const brandModels = await prisma.brandModel.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(brandModels)
  } catch (error) {
    console.error('GET /api/brand-model error:', error)
    return new NextResponse('ไม่สามารถโหลดข้อมูลได้', { status: 500 })
  }
}
