CREATE EXTENSION IF NOT EXISTS citext;

-- CreateEnum
CREATE TYPE "public"."StatusEnum" AS ENUM ('WAITING_FOR_CUSTOMER_DEVICE', 'UNDER_DIAGNOSIS', 'ANALYSIS_COMPLETE', 'RECOVERY_IN_PROGRESS', 'RECOVERY_SUCCESSFUL', 'RECOVERY_FAILED', 'DEVICE_RETURNED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'CREDIT_CARD', 'PROMPT_PAY');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'STAFF', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "public"."DeviceType" AS ENUM ('HDD', 'SSD', 'EXTERNAL_DRIVE', 'FLASH_DRIVE', 'MEMORY_CARD', 'OTHER');



-- CreateTable
CREATE TABLE "public"."customers" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" CITEXT,
    "lineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Device" (
    "id" SERIAL NOT NULL,
    "deviceType" "public"."DeviceType" NOT NULL,
    "capacity" TEXT NOT NULL,
    "serialNumber" TEXT,
    "description" TEXT,
    "currentStatus" "public"."StatusEnum" NOT NULL,
    "statusHistoryRaw" JSONB,
    "technicianNote" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" INTEGER NOT NULL,
    "brandId" INTEGER NOT NULL,
    "modelId" INTEGER,
    "technicianId" INTEGER,
    "changedById" INTEGER,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrackLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" INTEGER NOT NULL,
    "actorId" INTEGER,

    CONSTRAINT "TrackLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RepairRecord" (
    "id" SERIAL NOT NULL,
    "repairDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "cost" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" INTEGER NOT NULL,
    "technicianId" INTEGER,

    CONSTRAINT "RepairRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StatusHistory" (
    "id" SERIAL NOT NULL,
    "from" "public"."StatusEnum" NOT NULL,
    "to" "public"."StatusEnum" NOT NULL,
    "note" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" INTEGER NOT NULL,
    "changedById" INTEGER,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentRecord" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "amountDecimal" DECIMAL(12,2),
    "method" "public"."PaymentMethod" NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "deviceId" INTEGER NOT NULL,

    CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" CITEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BrandModel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brandId" INTEGER NOT NULL,

    CONSTRAINT "BrandModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminActivityLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,

    CONSTRAINT "AdminActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomerNote" (
    "id" SERIAL NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" INTEGER NOT NULL,

    CONSTRAINT "CustomerNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecoveryJob" (
    "id" SERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "technicianId" INTEGER,
    "status" "public"."StatusEnum" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoveryJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "public"."customers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "public"."customers"("email");

-- CreateIndex
CREATE INDEX "customers_createdAt_idx" ON "public"."customers"("createdAt");

-- CreateIndex
CREATE INDEX "customers_updatedAt_idx" ON "public"."customers"("updatedAt");

-- CreateIndex
CREATE INDEX "Device_customerId_receivedAt_idx" ON "public"."Device"("customerId", "receivedAt");

-- CreateIndex
CREATE INDEX "Device_currentStatus_idx" ON "public"."Device"("currentStatus");

-- CreateIndex
CREATE INDEX "Device_brandId_idx" ON "public"."Device"("brandId");

-- CreateIndex
CREATE INDEX "Device_modelId_idx" ON "public"."Device"("modelId");

-- CreateIndex
CREATE INDEX "Device_updatedAt_idx" ON "public"."Device"("updatedAt");

-- CreateIndex
CREATE INDEX "TrackLog_deviceId_createdAt_idx" ON "public"."TrackLog"("deviceId", "createdAt");

-- CreateIndex
CREATE INDEX "RepairRecord_deviceId_createdAt_idx" ON "public"."RepairRecord"("deviceId", "createdAt");

-- CreateIndex
CREATE INDEX "StatusHistory_deviceId_changedAt_idx" ON "public"."StatusHistory"("deviceId", "changedAt");

-- CreateIndex
CREATE INDEX "PaymentRecord_paidAt_idx" ON "public"."PaymentRecord"("paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "public"."Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_updatedAt_idx" ON "public"."Admin"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "public"."Brand"("name");

-- CreateIndex
CREATE INDEX "Brand_updatedAt_idx" ON "public"."Brand"("updatedAt");

-- CreateIndex
CREATE INDEX "BrandModel_updatedAt_idx" ON "public"."BrandModel"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BrandModel_name_brandId_key" ON "public"."BrandModel"("name", "brandId");

-- CreateIndex
CREATE INDEX "AdminActivityLog_deviceId_createdAt_idx" ON "public"."AdminActivityLog"("deviceId", "createdAt");

-- CreateIndex
CREATE INDEX "RecoveryJob_deviceId_createdAt_idx" ON "public"."RecoveryJob"("deviceId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Device" ADD CONSTRAINT "Device_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Device" ADD CONSTRAINT "Device_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Device" ADD CONSTRAINT "Device_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Device" ADD CONSTRAINT "Device_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."BrandModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Device" ADD CONSTRAINT "Device_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrackLog" ADD CONSTRAINT "TrackLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrackLog" ADD CONSTRAINT "TrackLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RepairRecord" ADD CONSTRAINT "RepairRecord_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RepairRecord" ADD CONSTRAINT "RepairRecord_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StatusHistory" ADD CONSTRAINT "StatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StatusHistory" ADD CONSTRAINT "StatusHistory_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentRecord" ADD CONSTRAINT "PaymentRecord_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BrandModel" ADD CONSTRAINT "BrandModel_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminActivityLog" ADD CONSTRAINT "AdminActivityLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminActivityLog" ADD CONSTRAINT "AdminActivityLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerNote" ADD CONSTRAINT "CustomerNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecoveryJob" ADD CONSTRAINT "RecoveryJob_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecoveryJob" ADD CONSTRAINT "RecoveryJob_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
