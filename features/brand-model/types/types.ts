// datamediclab/features/brand-model/types/types.ts
// รวม type ที่ใช้ซ้ำในโมดูล brand-model ทั้งฝั่ง UI และ API
// ✅ ไม่มี any และตั้งใจให้ใช้ร่วมกับ Brand/Store/API ได้ทันที

// อ้างอิงย่อของ Brand (หลีกเลี่ยงการ import วนกัน)
export interface BrandRef {
    id: number;
    name: string;
  }
  
  // โครงสร้างหลักของ BrandModel ตามที่ API ส่งกลับ
  export interface BrandModel {
    id: number;
    name: string;
    brandId: number;
    createdAt: string; // ISO string
    updatedAt?: string; // ISO string (อาจไม่มีในบาง response)
    brand?: BrandRef; // บาง API (GET list) อาจแนบข้อมูลแบรนด์มาด้วย
  }
  
  // กลุ่ม type ของ API response (มาตรฐานเดียวกับโปรเจกต์)
  export type ApiOk<T> = { ok: true; data: T };
  export type ApiErr = { ok: false; error: string };
  export type ApiResp<T> = ApiOk<T> | ApiErr;
  
  // พารามิเตอร์สำหรับเรียก API list
  export interface BrandModelQuery {
    q?: string;       // ค้นหาชื่อรุ่น
    brandId?: number; // กรองตามแบรนด์
    take?: number;    // จำกัดจำนวนผลลัพธ์
  }
  
  // Payload สำหรับสร้าง/แก้ไข
  export interface CreateBrandModelInput {
    name: string;
    brandId: number;
  }
  
  export interface UpdateBrandModelInput {
    name?: string;
    brandId?: number;
  }
  
  // Type สำหรับ React Hook Form ในหน้า Create/Edit
  export interface BrandModelFormValues {
    name: string;
    brandId: number | '';
  }
  
  // ชุด type สะดวกใช้
  export type BrandModelList = BrandModel[];
  export type BrandModelId = BrandModel['id'];
  