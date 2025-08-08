// ✅ RegisterDeviceStore

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface CustomerData {
  fullName: string;
  phone: string;
  email?: string;
}

interface SelectedCustomer {
  id: string;
  fullName: string;
  phone: string;
}

interface DeviceData {
  deviceType: string;
  brandId: number;
  modelId: number;
  serialNumber: string;
  capacity: string;
  description: string;
  problem: string;
  currentStatus: string;
  createdAt: string;
}

interface DeviceItem {
  id: number;
  serialNumber: string;
  deviceType: string;
  brandId: number;
  modelId: number | null;
  brand?: { name?: string };
  model?: { name?: string };
  capacity: string;
  currentStatus: string;
  createdAt: string;
}

interface RegisterDevicePayload {
  isNewCustomer: boolean;
  customerData?: CustomerData;
  selectedCustomer?: SelectedCustomer;
  deviceData: DeviceData;
}

interface RegisterDeviceStore {
  isLoading: boolean;
  error: string | null;
  currentDevice: DeviceData | null;
  deviceList: DeviceItem[];
  selectedCustomer: SelectedCustomer | null;
  setCurrentDeviceAction: (device: DeviceData) => void;
  clearCurrentDeviceAction: () => void;
  setDeviceListAction: (devices: DeviceItem[]) => void;
  getDeviceListAction: () => Promise<void>;
  registerDeviceAction: (payload: RegisterDevicePayload) => Promise<boolean>;
}

const useRegisterDeviceStore = create<RegisterDeviceStore>()(
  devtools((set, get) => ({
    isLoading: false,
    error: null,
    currentDevice: null,
    deviceList: [],
    selectedCustomer: null,

    setCurrentDeviceAction: (device) => set({ currentDevice: device }),
    clearCurrentDeviceAction: () => set({ currentDevice: null }),

    setDeviceListAction: (devices) => set({ deviceList: devices }),

    getDeviceListAction: async () => {
      const { selectedCustomer } = get();
      if (!selectedCustomer) return;
      try {
        const res = await fetch(`/api/register-device?customerId=${selectedCustomer.id}`);
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลอุปกรณ์ได้');
        const data = await res.json();
        const mapped = data.map((d: Record<string, unknown>) => ({
          ...d,
          id: Number(d.id),
          brandId: Number(d.brandId),
          modelId: d.modelId ? Number(d.modelId) : null,
        }));
        set({ deviceList: mapped });
      } catch (error) {
        console.error('❌ getDeviceListAction error:', error);
      }
    },

    registerDeviceAction: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        const res = await fetch('/api/register-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const result = await res.json();
          throw new Error(result?.error || 'ไม่สามารถลงทะเบียนอุปกรณ์ได้');
        }

        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
        console.error('❌ registerDeviceAction error:', error);
        set({ error: message });
        return false;
      } finally {
        set({ isLoading: false });
      }
    },
  }))
);

export default useRegisterDeviceStore;


  
