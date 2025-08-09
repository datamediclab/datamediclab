// lib/prisma.ts — ตามมาตรฐานโปรเจกต์ (ใช้ named export)
// ใช้ร่วมกับ Next.js (Node.js runtime เท่านั้นสำหรับ Prisma)

import { PrismaClient } from '@prisma/client'

// เก็บ instance ไว้บน globalThis เพื่อกันการสร้างซ้ำตอน HMR/dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// หมายเหตุการใช้งาน:
// import { prisma } from '@/lib/prisma'
// ห้ามใช้ default export อีกต่อไป
