 // NOTE: This Canvas intentionally contains two separate files — RegisterDeviceForm.tsx and useCustomerStore.ts — so that they can be reviewed and edited together while remembering they are distinct files in the actual project structure.

// =============================
// ✅ RegisterDeviceForm.tsx (Combobox version - shadcn/ui)
// =============================
"use client";

import { useForm } from "react-hook-form";
import React, { useEffect, useMemo, useState } from "react";
import useRegisterDeviceStore from "../store/useRegisterDeviceStore";
import { useBrandStore } from "@/features/brand/store/useBrandStore";
import { useBrandModelStore } from "@/features/brand-model/store/useBrandModelStore";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import RegisterDeviceListTable from "./RegisterDeviceListTable";
import useCustomerStore from "@/features/customer/store/useCustomerStore ";



export type Customer = { id: string; fullName: string; phone: string; email?: string };
export type CustomerData = { fullName: string; phone: string; email?: string };
export type CustomerHistoryItem = {
  id: string;
  deviceType?: string;
  brandName?: string;
  modelName?: string;
  serialNumber?: string;
  problem?: string;
  status?: string;
  createdAt: string;
};

const deviceTypeOptions = [
  { value: "HDD", label: "Hard Drive" },
  { value: "SSD", label: "SSD" },
  { value: "EXTERNAL_DRIVE", label: "External Drive" },
  { value: "FLASH_DRIVE", label: "Flash Drive" },
  { value: "MEMORY_CARD", label: "Memory Card" },
  { value: "OTHER", label: "อื่น ๆ" },
];

export type RegisterDeviceFormValues = {
  serialNumber?: string;
  deviceType: string;
  brandId: number;
  modelId: number;
  capacity?: string;
  description?: string;
};

const CustomerOption = React.memo(function CustomerOption({ c, onPick }: { c: Customer; onPick: (c: Customer) => void }) {
  return (
    <CommandItem onSelect={() => onPick(c)}>
      <div className="flex flex-col">
        <span className="font-medium">{c.fullName}</span>
        <span className="text-xs text-zinc-300">
          {c.phone}
          {c.email ? ` • ${c.email}` : ""}
        </span>
      </div>
    </CommandItem>
  );
});

const RegisterDeviceForm = () => {
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [searchKeyword, setSearchKeyword] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerHistory, setCustomerHistory] = useState<CustomerHistoryItem[]>([]);
  const [open, setOpen] = useState(false);

  const { registerDeviceAction, currentDevice, clearCurrentDeviceAction } = useRegisterDeviceStore();
  const { brandList, fetchBrandListAction } = useBrandStore();
  const { brandModelList, fetchBrandModelListAction } = useBrandModelStore();
  const { searchCustomerAction, fetchCustomerHistoryAction } = useCustomerStore();

  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm<RegisterDeviceFormValues>({
    defaultValues: {
      serialNumber: "",
      deviceType: "",
      brandId: undefined as unknown as number,
      modelId: undefined as unknown as number,
      capacity: "",
      description: "",
    },
  });

  const selectedBrandId = watch("brandId");

  useEffect(() => {
    fetchBrandListAction();
    fetchBrandModelListAction();
  }, [fetchBrandListAction, fetchBrandModelListAction]);

  useEffect(() => {
    if (currentDevice) {
      reset({
        serialNumber: currentDevice.serialNumber || "",
        deviceType: currentDevice.deviceType,
        brandId: Number(currentDevice.brandId),
        modelId: Number(currentDevice.modelId),
        capacity: currentDevice.capacity || "",
        description: currentDevice.description || "",
      });
    }
  }, [currentDevice, reset]);

  // debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchKeyword.trim() !== "") {
        try {
          const result = await searchCustomerAction(searchKeyword);
          setFilteredCustomers(result);
          setOpen(result.length > 0);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "ค้นหาลูกค้าไม่สำเร็จ";
          console.error("search debounce failed:", msg);
          setFilteredCustomers([]);
          setOpen(false);
        }
      } else {
        setFilteredCustomers([]);
        setOpen(false);
      }
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchKeyword, searchCustomerAction]);

  const memoCustomers = useMemo(() => filteredCustomers, [filteredCustomers]);

  const customerData: CustomerData | undefined = isNewCustomer ? { fullName, phone, email } : undefined;

  const onSubmit = async (data: RegisterDeviceFormValues) => {
    const payload = {
      isNewCustomer,
      customerData,
      selectedCustomer: isNewCustomer ? undefined : selectedCustomer || undefined,
      deviceData: {
        deviceType: data.deviceType,
        brandId: data.brandId,
        modelId: data.modelId,
        serialNumber: data.serialNumber || "",
        capacity: data.capacity || "",
        description: data.description || "",
        problem: data.description || "",
        currentStatus: "WAITING_FOR_CUSTOMER_DEVICE",
        createdAt: new Date().toISOString(),
      },
    } as const;

    await registerDeviceAction(payload);
    reset();
    clearCurrentDeviceAction?.();
    setFullName("");
    setPhone("");
    setEmail("");
    setSearchKeyword("");
    setCustomerHistory([]);
    setSelectedCustomer(null);
    try {
      (useRegisterDeviceStore.getState() as unknown as { setSelectedCustomerAction?: (c: Customer|null)=>void })
        .setSelectedCustomerAction?.(null);
    } catch {}
    setOpen(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ===== Section 1: ข้อมูลลูกค้า ===== */}
      <section className="bg-zinc-800 rounded-xl shadow-md border border-zinc-700 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">ข้อมูลลูกค้า</h3>
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" checked={isNewCustomer} onChange={() => setIsNewCustomer(true)} /> ลูกค้าใหม่
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={!isNewCustomer} onChange={() => setIsNewCustomer(false)} /> ลูกค้าเก่า
            </label>
          </div>
        </div>

        {isNewCustomer ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <input type="text" className="bg-zinc-900 text-white border border-zinc-600 rounded px-3 h-11 w-full" placeholder="ชื่อ - นามสกุลลูกค้า" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <input type="text" className="bg-zinc-900 text-white border border-zinc-600 rounded px-3 h-11 w-full" placeholder="เบอร์โทรลูกค้า" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <input type="email" className="bg-zinc-900 text-white border border-zinc-600 rounded px-3 h-11 w-full" placeholder="อีเมลลูกค้า (ถ้ามี)" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        ) : (
          <div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button type="button" className="w-full bg-zinc-900 text-white border border-zinc-600 rounded px-3 py-3 sm:py-2 text-left" onClick={() => setOpen((o) => !o)}>
                  {selectedCustomer ? `${selectedCustomer.fullName} (${selectedCustomer.phone})` : "ค้นหาชื่อลูกค้า หรือเบอร์โทร"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 bg-zinc-800 border border-zinc-700 max-w-[calc(100vw-2rem)] w-[--radix-popover-trigger-width] sm:w-[420px]">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="พิมพ์ชื่อหรือตัวเลขเบอร์โทร..." value={searchKeyword} onValueChange={(q) => setSearchKeyword(q)} />
                  <CommandEmpty>ไม่พบข้อมูลลูกค้า</CommandEmpty>
                  <CommandGroup>
                    {memoCustomers.map((c) => (
                      <CustomerOption
                        key={c.id}
                        c={c}
                        onPick={async (picked) => {
                          setSelectedCustomer(picked);
                          try {
                            const h = await fetchCustomerHistoryAction(picked.id);
                            setCustomerHistory(Array.isArray(h) ? h : []);
                          } catch (err: unknown) {
                            const msg = err instanceof Error ? err.message : "โหลดประวัติลูกค้าไม่สำเร็จ";
                            console.error("fetch history failed:", msg);
                            setCustomerHistory([]);
                          }
                          try {
                            (useRegisterDeviceStore.getState() as unknown as { setSelectedCustomerAction?: (c: Customer | null) => void }).setSelectedCustomerAction?.(picked);
                          } catch {}
                          setOpen(false);
                          setSearchKeyword("");
                        }}
                      />
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {(selectedCustomer || customerHistory.length > 0) && (
              <div className="mt-3">
                <RegisterDeviceListTable items={customerHistory} />
              </div>
            )}
          </div>
        )}
      </section>

      {/* ===== Section 2: ข้อมูลอุปกรณ์/ที่จัดส่ง ===== */}
      <section className="bg-zinc-800 rounded-xl shadow-md border border-zinc-700 p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-3">ข้อมูลอุปกรณ์ / รายละเอียดที่จัดส่ง</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <select {...register("deviceType", { required: true })} className="bg-zinc-900 text-white border border-zinc-600 rounded px-3 h-11 w-full">
            <option value="">-- เลือกประเภทอุปกรณ์ --</option>
            {deviceTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <input {...register("serialNumber")} className="bg-zinc-900 text-white border border-zinc-600 rounded px-3 h-11 w-full" placeholder="Serial Number" />

          <select {...register("brandId", { required: true, valueAsNumber: true })} className="bg-zinc-900 text-white border border-zinc-600 rounded px-3 h-11 w-full">
            <option value="">-- เลือกยี่ห้อ --</option>
            {brandList.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select {...register("modelId", { required: true, valueAsNumber: true })} className="bg-zinc-900 text-white border border-zinc-600 rounded px-3 h-11 w-full" disabled={!selectedBrandId}>
            <option value="">{selectedBrandId ? "-- เลือกรุ่น --" : "กรุณาเลือกยี่ห้อก่อน"}</option>
            {brandModelList.filter((m) => m.brandId === selectedBrandId).map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <input {...register("capacity")} className="bg-zinc-900 text-white border border-zinc-600 rounded px-3 h-11 w-full" placeholder="ความจุ (เช่น 1TB, 500GB)" />

          <input {...register("description")} className="bg-zinc-900 text-white border border-zinc-600 rounded px-3 h-11 w-full" placeholder="ปัญหาที่พบ / รายละเอียดอื่น ๆ" />
        </div>

        <div className="mt-4 text-center">
          <button type="submit" className="px-6 py-3 sm:py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 w-full sm:w-auto" disabled={isSubmitting}>
            {currentDevice ? "บันทึกการแก้ไข" : "ลงทะเบียนอุปกรณ์"}
          </button>
        </div>
      </section>
    </form>
  );
};

export default RegisterDeviceForm;


