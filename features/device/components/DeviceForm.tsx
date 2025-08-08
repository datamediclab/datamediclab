import { useEffect, useState } from 'react';

import { useBrandStore } from '@/features/brand/store/useBrandStore';
import useCustomerStore from '@/features/customer/store/useCustomerStore ';


type DeviceFormData = {
  customerId: string;
  brandId: string;
  deviceType: string;
  capacity: string;
  serialNumber: string;
  description: string;
  currentStatus: string;
};

interface DeviceFormProps {
  onSubmit: (formData: DeviceFormData) => void;
  isSubmitting: boolean;
}

const DeviceForm = ({ onSubmit, isSubmitting }: DeviceFormProps) => {
  const [formData, setFormData] = useState<DeviceFormData>({
    customerId: '',
    brandId: '',
    deviceType: 'HDD',
    capacity: '',
    serialNumber: '',
    description: '',
    currentStatus: 'WAITING_FOR_CUSTOMER_DEVICE',
  });

  const { searchCustomerAction } = useCustomerStore();
  const { brandList, fetchBrandListAction } = useBrandStore();
  const [customerList, setCustomerList] = useState<{ id: string; fullName: string }[]>([]);

  useEffect(() => {
    const loadCustomers = async () => {
      const customers = await searchCustomerAction('');
      setCustomerList(customers);
    };
    loadCustomers();
    fetchBrandListAction();
  }, [searchCustomerAction, fetchBrandListAction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">ลูกค้า</label>
        <select name="customerId" value={formData.customerId} onChange={handleChange} required className="w-full border p-2">
          <option value="">-- เลือกลูกค้า --</option>
          {customerList.map((c) => (
            <option key={c.id} value={c.id}>{c.fullName}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium">ยี่ห้อ</label>
        <select name="brandId" value={formData.brandId} onChange={handleChange} required className="w-full border p-2">
          <option value="">-- เลือกยี่ห้อ --</option>
          {brandList.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium">ประเภทอุปกรณ์</label>
        <select name="deviceType" value={formData.deviceType} onChange={handleChange} required className="w-full border p-2">
          {['HDD', 'SSD', 'EXTERNAL_DRIVE', 'FLASH_DRIVE', 'MEMORY_CARD', 'OTHER'].map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium">ความจุ</label>
        <input name="capacity" value={formData.capacity} onChange={handleChange} required className="w-full border p-2" placeholder="เช่น 1TB" />
      </div>

      <div>
        <label className="block font-medium">Serial Number</label>
        <input name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full border p-2" />
      </div>

      <div>
        <label className="block font-medium">รายละเอียด</label>
        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2" />
      </div>

      <div>
        <label className="block font-medium">สถานะเริ่มต้น</label>
        <select name="currentStatus" value={formData.currentStatus} onChange={handleChange} required className="w-full border p-2">
          {[
            'WAITING_FOR_CUSTOMER_DEVICE',
            'UNDER_DIAGNOSIS',
            'ANALYSIS_COMPLETE',
            'RECOVERY_IN_PROGRESS',
            'RECOVERY_SUCCESSFUL',
            'RECOVERY_FAILED',
            'DEVICE_RETURNED',
          ].map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div>
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded">
          {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
        </button>
      </div>
    </form>
  );
};

export default DeviceForm;