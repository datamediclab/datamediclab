 // app/api/register-device/route.ts

 import { NextResponse } from 'next/server';
 import prisma from '@/lib/prisma';
 import { DeviceType, StatusEnum } from '@prisma/client';
 
 export async function POST(req: Request) {
   try {
     const body = await req.json();
 
     if (
       typeof body !== 'object' ||
       body === null ||
       typeof body.deviceData !== 'object' ||
       !body.deviceData?.brandId ||
       !body.deviceData?.deviceType ||
       !body.selectedCustomer?.id ||
       typeof body.selectedCustomer.id !== 'number'
     ) {
       return NextResponse.json({ error: 'ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน' }, { status: 400 });
     }
 
     const { selectedCustomer, deviceData } = body;
     const customerId = selectedCustomer.id;
 
     const newDevice = await prisma.device.create({
       data: {
         customerId,
         brandId: parseInt(deviceData.brandId, 10),
         modelId: deviceData.modelId ? parseInt(deviceData.modelId, 10) : undefined,
         deviceType: deviceData.deviceType as DeviceType,
         serialNumber: deviceData.serialNumber || undefined,
         capacity: deviceData.capacity || '',
         description: deviceData.description || '',
         currentStatus: deviceData.currentStatus as StatusEnum,
       },
     });
 
     return NextResponse.json({ success: true, id: newDevice.id });
   } catch (error) {
     const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
     console.error('❌ register-device POST error:', error);
     return NextResponse.json({ error: message }, { status: 500 });
   }
 }
 