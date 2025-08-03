// CreateBrandPage.tsx

"use client";
import BrandForm from "../components/BrandForm";

const CreateBrandPage = () => {
  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">เพิ่มแบรนด์ใหม่</h1>
      <BrandForm />
    </div>
  );
};

export default CreateBrandPage;
