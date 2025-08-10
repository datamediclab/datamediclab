// BrandEditForm.tsx

"use client";

import { useEffect, useState } from "react";
import { useBrandStore } from "@/features/brand/store/useBrandStore";
import { useRouter } from "next/navigation";

interface BrandEditFormProps {
  brandId: string;
}

const BrandEditForm = ({ brandId }: BrandEditFormProps) => {
  const { updateBrandAction, getBrandByIdAction } = useBrandStore();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idNum = Number(brandId);
        if (isNaN(idNum)) throw new Error("ID ต้องเป็นตัวเลข");
        const brand = await getBrandByIdAction(idNum);
        if (brand) {
          setName(brand.name);
        } else {
          setError("ไม่พบข้อมูลแบรนด์");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "ไม่พบข้อมูลแบรนด์";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [brandId, getBrandByIdAction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const idNum = Number(brandId);
      if (isNaN(idNum)) throw new Error("ID ต้องเป็นตัวเลข");
      await updateBrandAction(idNum, { name });
      router.push("/admin/brand");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="text-white">กำลังโหลดข้อมูล...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white">ชื่อแบรนด์</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md bg-gray-800 text-white border border-gray-600 px-3 py-2"
          required
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        {isSubmitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
      </button>
    </form>
  );
};

export default BrandEditForm;
