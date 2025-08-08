// /admin/brand/edit/[id]/page.tsx

"use client";

import { useParams } from "next/navigation";
import AdminLayout from "@/layouts/AdminLayout";
import BrandEditForm from "@/features/brand/components/BrandEditForm";

const EditBrandPage = () => {
  const params = useParams() as { id?: string | string[] };
  const idParam = params && "id" in params ? params.id : null;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto mt-10 text-white">
        <h1 className="text-2xl font-bold mb-6">แก้ไขแบรนด์</h1>
        {id && <BrandEditForm brandId={id} />}
      </div>
    </AdminLayout>
  );
};

export default EditBrandPage;
