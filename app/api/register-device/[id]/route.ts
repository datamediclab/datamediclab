// app/api/register-device/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, DeviceType, StatusEnum } from '@prisma/client'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface CustomerData {
  fullName: string
  phone: string
  email?: string | null
}
interface SelectedCustomer { id: number }
interface DeviceData {
  deviceType: DeviceType | string
  capacity: string
  brandId: number
  modelId?: number | null
  serialNumber?: string | null
  description?: string | null
  receivedAt?: string | null
  currentStatus?: StatusEnum | string
}
interface RegisterDevicePayload {
  isNewCustomer: boolean
  customerData?: CustomerData
  selectedCustomer?: SelectedCustomer
  deviceData: DeviceData
}

const isNonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
const toInt = (v: unknown): number | null => {
  const n = typeof v === 'string' ? parseInt(v, 10) : typeof v === 'number' ? v : NaN
  return Number.isFinite(n) ? n : null
}
const getMeta = () => ({
  runtime: process.env.NEXT_RUNTIME ?? 'unknown',
  db: (() => { try { const u = new URL(process.env.DATABASE_URL ?? '') ; return { host: `${u.hostname}:${u.port || '5432'}` } } catch { return null } })(),
} as const)

const asDeviceType = (v: unknown): DeviceType | null => {
  const s = typeof v === 'string' ? v.trim().toUpperCase() : ''
  return (Object.values(DeviceType) as string[]).includes(s) ? (s as DeviceType) : null
}
const asStatusEnum = (v: unknown): StatusEnum | null => {
  const s = typeof v === 'string' ? v.trim().toUpperCase() : ''
  return (Object.values(StatusEnum) as string[]).includes(s) ? (s as StatusEnum) : null
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const customerIdParam = searchParams.get('customerId')
    const customerId = customerIdParam ? toInt(customerIdParam) : null

    const where = customerId ? { customerId } : undefined

    const rows = await prisma.device.findMany({
      where: where as { customerId?: number },
      orderBy: { id: 'desc' },
      take: 50,
    })

    return NextResponse.json({ ok: true, data: rows, meta: getMeta() })
  } catch (error) {
    console.error('GET /api/register-device error:', error)
    const message = error instanceof Error ? error.message : 'ไม่สามารถโหลดรายการได้'
    return NextResponse.json({ ok: false, error: message, meta: getMeta() }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'Unsupported Content-Type' }, { status: 415 })
    }

    const body = (await req.json()) as RegisterDevicePayload
    const { isNewCustomer, customerData, selectedCustomer, deviceData } = body

    if (!deviceData) {
      return NextResponse.json({ ok: false, error: 'missing deviceData' }, { status: 400 })
    }

    const deviceTypeEnum = asDeviceType(deviceData.deviceType)
    if (!deviceTypeEnum) {
      return NextResponse.json({ ok: false, error: 'กรุณาระบุชนิดอุปกรณ์ (deviceType) ให้ถูกต้อง' }, { status: 400 })
    }

    if (!isNonEmpty(deviceData.capacity)) {
      return NextResponse.json({ ok: false, error: 'กรุณาระบุความจุ (capacity)' }, { status: 400 })
    }

    const brandIdNum = toInt(deviceData.brandId)
    if (brandIdNum === null) {
      return NextResponse.json({ ok: false, error: 'brandId ต้องเป็นตัวเลข' }, { status: 400 })
    }

    const modelIdNum = deviceData.modelId == null ? null : toInt(deviceData.modelId)
    if (deviceData.modelId !== undefined && modelIdNum === null) {
      return NextResponse.json({ ok: false, error: 'modelId ต้องเป็นตัวเลขหรือไม่ระบุ' }, { status: 400 })
    }

    const receivedAtDate = deviceData.receivedAt ? new Date(deviceData.receivedAt) : null
    if (receivedAtDate && Number.isNaN(receivedAtDate.getTime())) {
      return NextResponse.json({ ok: false, error: 'receivedAt ไม่ใช่วันที่ที่ถูกต้อง' }, { status: 400 })
    }

    const currentStatusEnum = isNonEmpty(deviceData.currentStatus as string)
      ? asStatusEnum(deviceData.currentStatus)
      : StatusEnum.WAITING_FOR_CUSTOMER_DEVICE
    if (!currentStatusEnum) {
      return NextResponse.json({ ok: false, error: 'currentStatus ไม่ถูกต้อง' }, { status: 400 })
    }

    let customerId: number | null = null
    if (isNewCustomer) {
      if (!customerData || !isNonEmpty(customerData.fullName) || !isNonEmpty(customerData.phone)) {
        return NextResponse.json({ ok: false, error: 'ข้อมูลลูกค้าใหม่ไม่ครบถ้วน' }, { status: 400 })
      }
      try {
        const customer = await prisma.customer.create({
          data: {
            fullName: customerData.fullName.trim(),
            phone: customerData.phone.trim(),
            email: customerData.email ? customerData.email.trim() : null,
          },
          select: { id: true },
        })
        customerId = customer.id
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          return NextResponse.json({ ok: false, error: 'เบอร์โทรหรืออีเมลซ้ำกับลูกค้าที่มีอยู่' }, { status: 409 })
        }
        throw e
      }
    } else {
      const id = selectedCustomer?.id
      if (!id || !Number.isFinite(id)) {
        return NextResponse.json({ ok: false, error: 'กรุณาเลือกลูกค้าที่มีอยู่ หรือระบุ selectedCustomer.id' }, { status: 400 })
      }
      const exists = await prisma.customer.findUnique({ where: { id }, select: { id: true } })
      if (!exists) {
        return NextResponse.json({ ok: false, error: 'ไม่พบบัญชีลูกค้าที่เลือก' }, { status: 404 })
      }
      customerId = id
    }

    const created = await prisma.device.create({
      data: {
        customerId: customerId!,
        deviceType: deviceTypeEnum,
        capacity: deviceData.capacity.trim(),
        brandId: brandIdNum,
        modelId: modelIdNum,
        serialNumber: deviceData.serialNumber ?? null,
        description: deviceData.description ?? null,
        currentStatus: currentStatusEnum,
        receivedAt: receivedAtDate ?? undefined,
      },
    })

    return NextResponse.json({ ok: true, data: created }, { status: 201 })
  } catch (error) {
    console.error('POST /api/register-device error:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json({ ok: false, error: 'ข้อมูลอ้างอิง (brand/model/customer) ไม่ถูกต้อง' }, { status: 409 })
      }
    }
    const message = error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้'
    return NextResponse.json({ ok: false, error: message, meta: getMeta() }, { status: 500 })
  }
}
