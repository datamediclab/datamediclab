/*
  Warnings:

  - You are about to alter the column `name` on the `Brand` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(120)`.
  - You are about to alter the column `name` on the `BrandModel` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(120)`.
  - You are about to drop the column `changedById` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `technicianId` on the `Device` table. All the data in the column will be lost.
  - You are about to alter the column `serialNumber` on the `Device` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(120)`.
  - You are about to drop the column `amountDecimal` on the `PaymentRecord` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `PaymentRecord` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to drop the column `technicianId` on the `RecoveryJob` table. All the data in the column will be lost.
  - You are about to drop the column `technicianId` on the `RepairRecord` table. All the data in the column will be lost.
  - You are about to alter the column `cost` on the `RepairRecord` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to drop the column `changedById` on the `StatusHistory` table. All the data in the column will be lost.
  - You are about to drop the column `actorId` on the `TrackLog` table. All the data in the column will be lost.
  - You are about to drop the `AdminActivityLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[serialNumber]` on the table `Device` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."AdminActivityLog" DROP CONSTRAINT "AdminActivityLog_adminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AdminActivityLog" DROP CONSTRAINT "AdminActivityLog_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CustomerNote" DROP CONSTRAINT "CustomerNote_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Device" DROP CONSTRAINT "Device_changedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Device" DROP CONSTRAINT "Device_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Device" DROP CONSTRAINT "Device_technicianId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RecoveryJob" DROP CONSTRAINT "RecoveryJob_technicianId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RepairRecord" DROP CONSTRAINT "RepairRecord_technicianId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StatusHistory" DROP CONSTRAINT "StatusHistory_changedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."TrackLog" DROP CONSTRAINT "TrackLog_actorId_fkey";

-- DropIndex
DROP INDEX "public"."PaymentRecord_paidAt_idx";

-- DropIndex
DROP INDEX "public"."RecoveryJob_deviceId_createdAt_idx";

-- DropIndex
DROP INDEX "public"."RepairRecord_deviceId_createdAt_idx";

-- DropIndex
DROP INDEX "public"."StatusHistory_deviceId_changedAt_idx";

-- DropIndex
DROP INDEX "public"."TrackLog_deviceId_createdAt_idx";

-- AlterTable
ALTER TABLE "public"."Brand" ALTER COLUMN "name" SET DATA TYPE VARCHAR(120);

-- AlterTable
ALTER TABLE "public"."BrandModel" ALTER COLUMN "name" SET DATA TYPE VARCHAR(120);

-- AlterTable
ALTER TABLE "public"."Device" DROP COLUMN "changedById",
DROP COLUMN "technicianId",
ALTER COLUMN "serialNumber" SET DATA TYPE VARCHAR(120),
ALTER COLUMN "currentStatus" SET DEFAULT 'WAITING_FOR_CUSTOMER_DEVICE';

-- AlterTable
ALTER TABLE "public"."PaymentRecord" DROP COLUMN "amountDecimal",
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."RecoveryJob" DROP COLUMN "technicianId",
ADD COLUMN     "assignedAdminId" INTEGER;

-- AlterTable
ALTER TABLE "public"."RepairRecord" DROP COLUMN "technicianId",
ADD COLUMN     "technicianAdminId" INTEGER,
ALTER COLUMN "cost" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."StatusHistory" DROP COLUMN "changedById",
ADD COLUMN     "changedByAdminId" INTEGER;

-- AlterTable
ALTER TABLE "public"."TrackLog" DROP COLUMN "actorId",
ADD COLUMN     "actorAdminId" INTEGER;

-- DropTable
DROP TABLE "public"."AdminActivityLog";

-- DropTable
DROP TABLE "public"."customers";

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" SERIAL NOT NULL,
    "fullName" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "email" CITEXT,
    "lineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "public"."Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "public"."Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "public"."Customer"("phone");

-- CreateIndex
CREATE INDEX "Customer_createdAt_idx" ON "public"."Customer"("createdAt");

-- CreateIndex
CREATE INDEX "Customer_updatedAt_idx" ON "public"."Customer"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Device_serialNumber_key" ON "public"."Device"("serialNumber");

-- CreateIndex
CREATE INDEX "PaymentRecord_deviceId_paidAt_idx" ON "public"."PaymentRecord"("deviceId", "paidAt");

-- AddForeignKey
ALTER TABLE "public"."Device" ADD CONSTRAINT "Device_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerNote" ADD CONSTRAINT "CustomerNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecoveryJob" ADD CONSTRAINT "RecoveryJob_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RepairRecord" ADD CONSTRAINT "RepairRecord_technicianAdminId_fkey" FOREIGN KEY ("technicianAdminId") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StatusHistory" ADD CONSTRAINT "StatusHistory_changedByAdminId_fkey" FOREIGN KEY ("changedByAdminId") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrackLog" ADD CONSTRAINT "TrackLog_actorAdminId_fkey" FOREIGN KEY ("actorAdminId") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
