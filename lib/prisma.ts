
// lib/prisma.ts — ตามมาตรฐานโปรเจกต์ (ใช้ named export)
// ใช้ร่วมกับ Next.js (Node.js runtime เท่านั้นสำหรับ Prisma)

import { PrismaClient } from '@prisma/client'

// ป้องกันการใช้งานกับ Edge runtime
if (process.env.NEXT_RUNTIME === 'edge') {
  throw new Error('Prisma is not supported on the Edge runtime. Set `export const runtime = "nodejs"` in your route.')
}

const makePrismaClient = () =>
  new PrismaClient({
    log: ['warn', 'error'],
  })

// เก็บ instance ไว้บน globalThis เพื่อกันการสร้างซ้ำตอน HMR/dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma: PrismaClient = globalForPrisma.prisma ?? makePrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Helper สำหรับเช็คการเชื่อมต่อฐานข้อมูลอย่างปลอดภัย (ไม่ใช้ any)
export const pingDb = async (): Promise<boolean> => {
  try {
    const rows = await prisma.$queryRaw<{ up: number }[]>`select 1 as up`
    return !!rows?.[0]?.up
  } catch {
    return false
  }
}

// หมายเหตุการใช้งาน:
// import { prisma } from '@/lib/prisma'
// ห้ามใช้ default export อีกต่อไป
