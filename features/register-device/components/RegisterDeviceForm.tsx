// NOTE: This Canvas intentionally contains two separate files — RegisterDeviceForm.tsx and useCustomerStore.ts — so that they can be reviewed and edited together while remembering they are distinct files in the actual project structure.

// =============================
// ✅ RegisterDeviceForm.tsx (Combobox version - shadcn/ui, updated phone input formatting to match CustomerSection)
// =============================
"use client";

import { useForm } from "react-hook-form";
import React, { useEffect, useMemo, useState } from "react";
import useRegisterDeviceStore from "../store/useRegisterDeviceStore";
import { useBrandStore } from "@/features/brand/store/useBrandStore";
import { useBrandModelStore } from "@/features/brand-model/store/useBrandModelStore";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import useCustomerStore from "@/features/customer/store/useCustomerStore";
import { DeviceType, RegisterStatus, type Capacity, type Customer, type CustomerData, type CustomerHistoryItem, type RegisterDeviceFormValues } from "@/features/register-device/types/types";
import RegisterDeviceListTable from "@/features/register-device/components/RegisterDeviceListTable";

// ฟังก์ชันกรองตัวเลข
const onlyDigits = (s: string) => s.replace(/[^0-9]/g, "");
// ฟังก์ชันฟอร์แมตเบอร์โทรแบบเดียวกับ CustomerSection
const formatThaiPhone = (digits: string) => {
  // Mobile-only progressive mask like CustomerSection (0xx-xxx-xxxx)
  let d = onlyDigits(digits);
  if (d.length > 0 && d[0] !== "0") d = "0" + d; // force leading 0
  d = d.slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
};



const deviceTypeOptions = [
  { value: DeviceType.HDD, label: "Hard Drive" },
  { value: DeviceType.SSD, label: "SSD" },
  { value: DeviceType.EXTERNAL_DRIVE, label: "External Drive" },
  { value: DeviceType.FLASH_DRIVE, label: "Flash Drive" },
  { value: DeviceType.MEMORY_CARD, label: "Memory Card" },
  { value: DeviceType.OTHER, label: "อื่น ๆ" },
];

// Preset capacity options by device type
const capacityOptionsByType: Record<string, string[]> = {
  HDD: ["256GB", "500GB", "1TB", "2TB", "4TB", "8TB"],
  SSD: ["128GB", "256GB", "512GB", "1TB", "2TB", "4TB"],
  EXTERNAL_DRIVE: ["500GB", "1TB", "2TB", "4TB", "8TB"],
  FLASH_DRIVE: ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"],
  MEMORY_CARD: ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"],
  OTHER: [],
};

// Capacity limits (in GB)
const capacityLimitGB: Record<string, { min: number; max: number }> = {
  HDD: { min: 40, max: 20000 },
  SSD: { min: 64, max: 8000 },
  EXTERNAL_DRIVE: { min: 250, max: 20000 },
  FLASH_DRIVE: { min: 8, max: 2000 },
  MEMORY_CARD: { min: 8, max: 1000 },
  OTHER: { min: 1, max: 100000 },
};

type Unit = "GB" | "TB";
const rangeFor = (type: string, unit: Unit) => {
  const lim = capacityLimitGB[type] ?? capacityLimitGB.OTHER;
  const min = unit === "GB" ? lim.min : Math.max(1, Math.ceil(lim.min / 1024));
  const max = unit === "GB" ? lim.max : Math.max(min, Math.floor(lim.max / 1024));
  return { min, max };
};


const CustomerOption = React.memo(function CustomerOption({ c, onPick }: { c: Customer; onPick: (c: Customer) => void }) {
  return (
    <CommandItem onSelect={() => onPick(c)}>
      <div className="flex flex-col">
        <span className="font-medium">{c.fullName}</span>
        {c.email ? (<span className="text-xs text-zinc-300">{c.email}</span>) : null}
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
  // Verification for existing customer
  const [last4, setLast4] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  // Verify dialog state
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<Customer | null>(null);
  const [verifyError, setVerifyError] = useState("");
  // capacity selection state
  const [capacitySelect, setCapacitySelect] = useState<string>("");
  const [customCapNum, setCustomCapNum] = useState<string>("");
  const [customCapUnit, setCustomCapUnit] = useState<"GB" | "TB">("GB");
  const [customCapError, setCustomCapError] = useState("");
  const parseCapacity = (s: string) => {
    const t = String(s || "").trim().toUpperCase();
    if (t.endsWith("GB")) return { num: t.slice(0, -2).trim(), unit: "GB" as const };
    if (t.endsWith("TB")) return { num: t.slice(0, -2).trim(), unit: "TB" as const };
    return null as null | { num: string; unit: "GB" | "TB" };
  };
  

  const { registerDeviceAction, currentDevice, clearCurrentDeviceAction } = useRegisterDeviceStore();
  const { brandList, fetchBrandListAction } = useBrandStore();
  const { brandModelList, fetchBrandModelListAction } = useBrandModelStore();
  const { searchCustomerAction, fetchCustomerHistoryAction } = useCustomerStore();

  const { register, handleSubmit, watch, reset, setValue, formState: { isSubmitting, errors } } = useForm<RegisterDeviceFormValues>({
    mode: "onChange",
    defaultValues: {
      serialNumber: "",
      deviceType: "",
      brandId: undefined,
      modelId: undefined,
      capacity: "",
      description: "",
    },
  });

  const serialReg = register("serialNumber", {
    required: true,
    pattern: { value: /^[A-Z0-9]+$/, message: "ใช้ได้เฉพาะ A–Z และ 0–9" },
    setValueAs: (v: unknown) => String(v ?? "").toUpperCase().replace(/[^A-Z0-9]/g, ""),
  });

  const selectedBrandId = watch("brandId");
  const deviceTypeValue = watch("deviceType");
  const brandIdValue = watch("brandId");
  const modelIdValue = watch("modelId");
  const serialNumberValue = watch("serialNumber");
  const capacityValue = watch("capacity");
  const descriptionValue = watch("description");
  const capacityPresets = useMemo(() => capacityOptionsByType[deviceTypeValue] ?? [], [deviceTypeValue]);
  const capRange = useMemo(() => rangeFor(deviceTypeValue || "OTHER", customCapUnit), [deviceTypeValue, customCapUnit]);

  const hasDevice = Boolean(
    deviceTypeValue &&
    typeof brandIdValue === "number" && !Number.isNaN(brandIdValue) &&
    typeof modelIdValue === "number" && !Number.isNaN(modelIdValue) &&
    (serialNumberValue?.trim() ?? "") !== "" &&
    (capacityValue?.trim() ?? "") !== "" &&
    (descriptionValue?.trim() ?? "") !== ""
  );

  const newCustomerValid = fullName.trim() !== "" && onlyDigits(phone).length === 10;
  const hasCustomer = isNewCustomer
    ? newCustomerValid
    : (selectedCustomer !== null && isVerified);

  const canSubmit = hasDevice && hasCustomer;

  useEffect(() => {
    fetchBrandListAction();
    fetchBrandModelListAction();
  }, [fetchBrandListAction, fetchBrandModelListAction]);

  useEffect(() => {
    if (currentDevice) {
      reset({
        serialNumber: currentDevice.serialNumber || "",
        deviceType: (currentDevice.deviceType as DeviceType) || "",
        brandId: Number(currentDevice.brandId),
        modelId: Number(currentDevice.modelId),
        capacity: (currentDevice.capacity as Capacity) || "",
        description: currentDevice.description || "",
      });
    }
  }, [currentDevice, reset]);

  // Sync capacity selection from current form value & device type presets
  useEffect(() => {
    const cap = capacityValue || "";
    const presets = capacityPresets;
    if (cap && presets.includes(cap)) {
      setCapacitySelect(cap);
      setCustomCapNum("");
    } else {
      const parsed = parseCapacity(cap);
      if (parsed) {
        setCapacitySelect("__CUSTOM__");
        setCustomCapNum(parsed.num);
        setCustomCapUnit(parsed.unit);
      } else {
        setCapacitySelect("");
        setCustomCapNum("");
      }
    }
  }, [capacityPresets, capacityValue]);

  // Clear model when brand changes to avoid stale selection
  useEffect(() => {
    setValue("modelId", undefined, { shouldDirty: true, shouldValidate: true });
  }, [brandIdValue, setValue]);

  // debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchKeyword.trim() !== "") {
        try {
          const result = await searchCustomerAction(searchKeyword);
          setFilteredCustomers(result);
          setOpen(true);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "ค้นหาลูกค้าไม่สำเร็จ";
          console.error("search debounce failed:", msg);
          setFilteredCustomers([]);
          setOpen(true);
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
    // Narrow required numbers before building payload to satisfy TS and runtime safety
    const { brandId, modelId } = data;
    if (typeof brandId !== "number" || typeof modelId !== "number") {
      console.error("brandId/modelId must be selected (number)");
      return;
    }
    if (!isNewCustomer && !isVerified) {
      console.error("customer not verified: please confirm last 4 digits");
      return;
    }
    const payload = {
      isNewCustomer,
      customerData,
      selectedCustomer: isNewCustomer ? undefined : selectedCustomer || undefined,
      deviceData: {
        deviceType: data.deviceType as DeviceType,
        brandId: brandId,
        modelId: modelId,
        serialNumber: data.serialNumber || "",
        capacity: data.capacity || "",
        description: data.description || "",
        problem: data.description || "",
        currentStatus: RegisterStatus.WAITING_FOR_CUSTOMER_DEVICE,
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
      (useRegisterDeviceStore.getState() as unknown as { setSelectedCustomerAction?: (c: Customer | null) => void })
        .setSelectedCustomerAction?.(null);
    } catch { }
    setOpen(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ===== Section 1: ข้อมูลลูกค้า ===== */}
      <section className="bg-zinc-800 rounded-xl shadow-md border border-zinc-700 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">ข้อมูลลูกค้า</h3>
          <div className="w-full sm:w-auto">
            <div className="grid grid-cols-2 w-full sm:w-[320px] rounded-xl overflow-hidden border border-zinc-700">
              <button
                type="button"
                className={`h-10 text-sm font-medium ${isNewCustomer ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"}`}
                onClick={() => { setIsNewCustomer(true); setSelectedCustomer(null); setIsVerified(false); setVerifyOpen(false); setCustomerHistory([]); }}
              >
                ลูกค้าใหม่
              </button>
              <button
                type="button"
                className={`h-10 text-sm font-medium ${!isNewCustomer ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"}`}
                onClick={() => { setIsNewCustomer(false); setSearchKeyword(""); setOpen(false); }}
              >
                ลูกค้าเก่า
              </button>
            </div>
          </div>
        </div>


        <div className="min-h-[140px] transition-all">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
            {isNewCustomer ? (
              <>
                <input
                  type="text"
                  className="bg-zinc-900 text-white border border-zinc-600 rounded px-3 h-11 w-full"
                  placeholder="ชื่อ - นามสกุลลูกค้า"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />

                <input
                  type="tel"
                  inputMode="tel"
                  className={`bg-zinc-900 text-white rounded px-3 h-11 w-full border ${
                    isNewCustomer && onlyDigits(phone).length > 0 && onlyDigits(phone).length !== 10
                      ? "border-red-500 focus:ring-red-500"
                      : "border-zinc-600"
                  }`}
                  placeholder="0xx-xxx-xxxx"
                  value={formatThaiPhone(phone)}
                  onChange={(e) => {
                    let digits = onlyDigits(e.target.value);
                    if (digits.length > 0 && digits[0] !== "0") digits = "0" + digits; // force leading 0
                    digits = digits.slice(0, 10);
                    setPhone(digits);
                  }}
                  aria-invalid={isNewCustomer && onlyDigits(phone).length > 0 && onlyDigits(phone).length !== 10}
                  required
                />

                <input
                  type="email"
                  className="bg-zinc-900 text-white border border-zinc-600 rounded px-3 h-11 w-full"
                  placeholder="อีเมลลูกค้า (ถ้ามี)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </>
            ) : (
              <>
                <div className="col-span-1 sm:col-span-3">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full bg-zinc-900 text-white border border-zinc-600 rounded px-3 py-3 sm:py-2 text-left"
                        onClick={() => setOpen(true)}
                      >
                        {selectedCustomer ? selectedCustomer.fullName : "ค้นหาชื่อลูกค้า หรือเบอร์โทร"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 bg-zinc-800 border border-zinc-700 max-w-[calc(100vw-2rem)] w-[--radix-popover-trigger-width] sm:w-[420px]">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="พิมพ์ชื่อหรือตัวเลขเบอร์โทร..."
                          value={searchKeyword}
                          onValueChange={(q: string) => setSearchKeyword(q)}
                        />
                        <CommandEmpty>ไม่พบข้อมูลลูกค้า</CommandEmpty>
                        <CommandGroup>
                          {memoCustomers.map((c) => (
                            <CustomerOption
                              key={c.id}
                              c={c}
                              onPick={(picked) => {
                                setVerifyTarget(picked);
                                setLast4("");
                                setIsVerified(false);
                                setVerifyError("");
                                setVerifyOpen(true);
                              }}
                            />
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}
          </div>

          <div className="mt-4">
          <RegisterDeviceListTable items={customerHistory} />
        </div>

          {verifyOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => {
                  setVerifyOpen(false);
                  setVerifyError("");
                  setLast4("");
                }}
              />
              <div className="relative bg-zinc-900 text-white border border-zinc-700 rounded-xl w-[90vw] max-w-md p-4">
                <div className="mb-2">
                  <div className="text-lg font-medium">ยืนยันตัวตน</div>
                  <div className="text-zinc-300">
                    กรุณากรอก 4 ตัวท้ายของเบอร์โทรสำหรับ <span className="font-medium text-white">{verifyTarget?.fullName}</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <input
                    inputMode="numeric"
                    maxLength={4}
                    className="w-full rounded-lg bg-zinc-800 text-white px-3 py-2 border border-zinc-700"
                    placeholder="กรอก 4 ตัวท้ายเบอร์โทร"
                    value={last4}
                    onChange={(e) => {
                      const v = onlyDigits(e.target.value).slice(0, 4);
                      setLast4(v);
                      setVerifyError("");
                    }}
                  />
                  {verifyError && <div className="text-red-400 text-xs">{verifyError}</div>}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
                    onClick={() => setVerifyOpen(false)}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
                    onClick={async () => {
                      const tgt = verifyTarget; if (!tgt) return;
                      const phoneLast4 = onlyDigits(tgt.phone).slice(-4);
                      if (last4.length === 4 && last4 === phoneLast4) {
                        setSelectedCustomer(tgt);
                        setIsVerified(true);
                        setVerifyOpen(false);
                        setOpen(false);
                        setSearchKeyword("");
                        try {
                          const h = await fetchCustomerHistoryAction(tgt.id);
                          setCustomerHistory(Array.isArray(h) ? h : []);
                        } catch (err: unknown) {
                          const msg = err instanceof Error ? err.message : "โหลดประวัติลูกค้าไม่สำเร็จ";
                          console.error("fetch history failed:", msg);
                          setCustomerHistory([]);
                        }
                        try {
                          (useRegisterDeviceStore.getState() as unknown as { setSelectedCustomerAction?: (c: Customer | null) => void }).setSelectedCustomerAction?.(tgt);
                        } catch { }
                      } else {
                        setIsVerified(false);
                        setVerifyError("เลข 4 ตัวท้ายไม่ถูกต้อง");
                      }
                    }}
                    disabled={last4.length !== 4}
                  >
                    ยืนยัน
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        



      </section>

      {/* ===== Section 2: ข้อมูลอุปกรณ์ ===== */}
      <section className="bg-zinc-800 rounded-xl shadow-md border border-zinc-700 p-4 sm:p-6">
        <div className="mb-3">
          <h3 className="text-lg font-semibold">ข้อมูลอุปกรณ์</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <select {...register("deviceType", { setValueAs: (v) => (v === "" ? "" : (v as DeviceType)) })} className="bg-zinc-900 text-white border border-zinc-600 rounded px-3 h-11 w-full" required>
            <option value="">-- เลือกประเภทอุปกรณ์ --</option>
            {deviceTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            {...serialReg}
            className={`bg-zinc-900 text-white rounded px-3 h-11 w-full border ${errors.serialNumber ? "border-red-500 focus:ring-red-500" : "border-zinc-600"}`}
            placeholder="Serial Number (A–Z, 0–9 เท่านั้น)"
            autoCapitalize="characters"
            aria-invalid={Boolean(errors.serialNumber)}
            onChange={(e) => {
              const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
              e.target.value = v;
              serialReg.onChange(e);
            }}
          />
          <select {...register("brandId", { required: true, valueAsNumber: true })} className={`bg-zinc-900 text-white rounded px-3 h-11 w-full border ${errors.brandId ? "border-red-500 focus:ring-red-500" : "border-zinc-600"}`} aria-invalid={Boolean(errors.brandId)}>
            <option value="">-- เลือกยี่ห้อ --</option>
            {brandList.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>


          <select {...register("modelId", { required: true, valueAsNumber: true })} className={`bg-zinc-900 text-white rounded px-3 h-11 w-full border ${errors.modelId ? "border-red-500 focus:ring-red-500" : "border-zinc-600"}`} aria-invalid={Boolean(errors.modelId)} disabled={!selectedBrandId}>
            <option value="">-- เลือกรุ่น --</option>
            {brandModelList
              .filter((m) => Number(m.brandId) === Number(selectedBrandId))
              .map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
          </select>


          {/* Hidden field binds to RHF; we control value via setValue */}
          <input type="hidden" {...register("capacity", { required: true })} />

          <select
            className={`bg-zinc-900 text-white rounded px-3 h-11 w-full border ${errors.capacity ? "border-red-500 focus:ring-red-500" : "border-zinc-600"}`}
            aria-invalid={Boolean(errors.capacity)}
            value={capacitySelect}
            onChange={(e) => {
              const v = e.target.value;
              setCapacitySelect(v);
              if (v && v !== "__CUSTOM__") {
                setValue("capacity", v as Capacity, { shouldValidate: true, shouldDirty: true });
                setCustomCapNum("");
              } else {
                setValue("capacity", "", { shouldValidate: true, shouldDirty: true });
              }
            }}
            disabled={capacityPresets.length === 0 && deviceTypeValue !== "OTHER"}
          >
            <option value="">-- เลือกความจุ --</option>
            {capacityPresets.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
            <option value="__CUSTOM__">กำหนดเอง…</option>
          </select>


          {capacitySelect === "__CUSTOM__" && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  inputMode="numeric"
                  className="bg-zinc-900 text-white border border-zinc-600 rounded px-3 h-11 w-full"
                  placeholder="ตัวเลขเช่น 500 หรือ 1"
                  value={customCapNum}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setCustomCapNum(raw);
                    const { min, max } = capRange;
                    if (!raw) {
                      setCustomCapError("");
                      setValue("capacity", "", { shouldValidate: true, shouldDirty: true });
                      return;
                    }
                    const n = Number(raw);
                    if (n < min || n > max) {
                      setCustomCapError(`ใส่ได้ ${min}–${max} ${customCapUnit}`);
                      setValue("capacity", "", { shouldValidate: true, shouldDirty: true });
                    } else {
                      setCustomCapError("");
                      setValue("capacity", `${n}${customCapUnit}` as Capacity, { shouldValidate: true, shouldDirty: true });
                    }
                  }}
                />
                <select
                  className="bg-zinc-900 text-white border border-zinc-600 rounded px-3 h-11"
                  value={customCapUnit}
                  onChange={(e) => {
                    const unit = (e.target.value === "TB" ? "TB" : "GB") as Unit;
                    setCustomCapUnit(unit);
                    const { min, max } = rangeFor(deviceTypeValue || "OTHER", unit);
                    const n = Number(customCapNum || 0);
                    if (customCapNum && (n < min || n > max)) {
                      setCustomCapError(`ใส่ได้ ${min}–${max} ${unit}`);
                      setValue("capacity", "", { shouldValidate: true, shouldDirty: true });
                    } else {
                      setCustomCapError("");
                      const val = customCapNum ? `${n}${unit}` : "";
                      setValue("capacity", val as "" | Capacity, { shouldValidate: true, shouldDirty: true });
                    }
                  }}
                >
                  <option value="GB">GB</option>
                  <option value="TB">TB</option>
                </select>
              </div>
              <div className="text-xs text-zinc-400">ช่วงที่รองรับสำหรับ {deviceTypeValue || "OTHER"}: {capRange.min}–{capRange.max} {customCapUnit}</div>

            </div>
          )}

          <input {...register("description", { required: true })} className={`bg-zinc-900 text-white rounded px-3 h-11 w-full border ${errors.description ? "border-red-500 focus:ring-red-500" : "border-zinc-600"}`} aria-invalid={Boolean(errors.description)} placeholder="ปัญหาที่พบ / รายละเอียดอื่น ๆ" />

        </div>

        <div className="mt-4 text-center">
          <button type="submit" className="px-6 py-3 sm:py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 w-full sm:w-auto" disabled={isSubmitting || !canSubmit}>
            {currentDevice ? "บันทึกการแก้ไข" : "ลงทะเบียนอุปกรณ์"}
          </button>
        </div>
      </section>
    </form>
  );
};

export default RegisterDeviceForm;


