// features/register-device/types/types.ts
export enum DeviceType {
  HDD = "HDD",
  SSD = "SSD",
  EXTERNAL_DRIVE = "EXTERNAL_DRIVE",
  FLASH_DRIVE = "FLASH_DRIVE",
  MEMORY_CARD = "MEMORY_CARD",
  OTHER = "OTHER",
}

export enum RegisterStatus {
  WAITING_FOR_CUSTOMER_DEVICE = "WAITING_FOR_CUSTOMER_DEVICE",
  RECEIVED = "RECEIVED",
  IN_DIAGNOSTIC = "IN_DIAGNOSTIC",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Capacity string like "500GB" or "1TB"
export type Capacity = `${number}${"GB" | "TB"}`;

export type Customer = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
};

export type CustomerData = {
  fullName: string;
  phone: string;
  email?: string;
};

export type CustomerHistoryItem = {
  id: string;
  deviceType?: string;
  brandName?: string;
  modelName?: string;
  serialNumber?: string;
  problem?: string;
  status?: string;
  createdAt: string; // ISO string
};

export type DeviceData = {
  serialNumber?: string;
  deviceType: DeviceType | "";
  brandId?: number;
  modelId?: number;
  capacity?: Capacity | "";
  description?: string;
};

export type RegisterDeviceFormValues = DeviceData;

export type RegisterDevicePayload =
  | {
      isNewCustomer: true;
      customerData: CustomerData;
      selectedCustomer?: never;
      deviceData: DeviceData;
    }
  | {
      isNewCustomer: false;
      customerData?: never;
      selectedCustomer: Customer;
      deviceData: DeviceData;
    };
