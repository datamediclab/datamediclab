
// app/api/register-device/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DeviceType, StatusEnum } from '@prisma/client';

// ---- helpers (no-any, safe guards) ----
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function toInt(v: unknown): number | null {
  if (typeof v === 'number' && Number.isInteger(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function isEnumValue<T extends string>(value: unknown, enumObj: Record<string, T>): value is T {
  return typeof value === 'string' && (Object.values(enumObj) as string[]).includes(value);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'รูปแบบข้อมูลไม่ถูกต้อง (อ่าน JSON ไม่ได้)' }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: 'payload ต้องเป็น object' }, { status: 400 });
  }

  const isNewCustomer = body.isNewCustomer === true;
  const customerData = isRecord(body.customerData) ? body.customerData : undefined;
  const selectedCustomer = isRecord(body.selectedCustomer) ? body.selectedCustomer : undefined;
  const deviceData = isRecord(body.deviceData) ? body.deviceData : undefined;

  if (!deviceData) {
    return NextResponse.json({ error: 'deviceData จำเป็นต้องมี' }, { status: 400 });
  }

  const brandId = toInt(deviceData.brandId);
  const modelId = toInt(deviceData.modelId);
  const deviceTypeRaw = deviceData.deviceType;
  const serialNumber = typeof deviceData.serialNumber === 'string' ? deviceData.serialNumber : undefined;
  const capacity = typeof deviceData.capacity === 'string' ? deviceData.capacity : '';
  const description = typeof deviceData.description === 'string' ? deviceData.description : '';
  const currentStatusRaw = deviceData.currentStatus;

  if (brandId == null) {
    return NextResponse.json({ error: 'brandId ไม่ถูกต้อง' }, { status: 400 });
  }

  if (!isEnumValue(deviceTypeRaw, DeviceType)) {
    return NextResponse.json({ error: 'deviceType ไม่ถูกต้อง' }, { status: 400 });
  }

  // อนุญาตไม่ส่ง currentStatus ได้ (ให้ค่าเริ่มต้น)
  const currentStatus: StatusEnum = isEnumValue(currentStatusRaw, StatusEnum)
    ? (currentStatusRaw as StatusEnum)
    : StatusEnum.WAITING_FOR_CUSTOMER_DEVICE;

  // ---- resolve customerId ----
  let customerId: number | null = null;

  if (isNewCustomer) {
    if (!customerData || typeof customerData.fullName !== 'string' || typeof customerData.phone !== 'string') {
      return NextResponse.json({ error: 'ข้อมูลลูกค้าใหม่ไม่ครบถ้วน' }, { status: 400 });
    }
    try {
      const newCustomer = await prisma.customer.create({
        data: {
          fullName: customerData.fullName,
          phone: customerData.phone,
          email: typeof customerData.email === 'string' ? customerData.email : null,
        },
      });
      customerId = newCustomer.id;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'บันทึกลูกค้าใหม่ไม่สำเร็จ';
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  } else {
    const selectedId = selectedCustomer ? toInt(selectedCustomer.id) : null;
    if (selectedId == null) {
      return NextResponse.json({ error: 'กรุณาเลือกลูกค้าเก่าให้ถูกต้อง' }, { status: 400 });
    }
    customerId = selectedId;
  }

  try {
    const newDevice = await prisma.device.create({
      data: {
        customerId: customerId as number,
        brandId,
        modelId: modelId ?? undefined,
        deviceType: deviceTypeRaw as DeviceType,
        serialNumber, // schema.prisma ต้องเป็น serialNumber ตามที่ใช้อยู่
        capacity,
        description,
        currentStatus,
        receivedAt: new Date(),
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, id: newDevice.id }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูลอุปกรณ์';
    console.error('❌ register-device POST error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
