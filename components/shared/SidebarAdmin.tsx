// components/shared/SidebarAdmin.tsx

'use client';

import Link from 'next/link';

const SidebarAdmin = () => {
  return (
    <aside className="w-64 bg-zinc-900 text-white h-full p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4">เมนูผู้ดูแลระบบ</h2>
      <ul className="space-y-2">
        <li>
          <Link href="/admin" className="hover:text-blue-400">
            แดชบอร์ดผู้ดูแลระบบ
          </Link>
        </li>
        <li>
          <Link href="/admin/brand" className="hover:text-blue-400">
            จัดการแบรนด์
          </Link>
        </li>
        <li>
          <Link href="/admin/brand-model" className="hover:text-blue-400">
            จัดการรุ่นสินค้า
          </Link>
        </li>
        {/* เพิ่มเมนูอื่น ๆ ที่เกี่ยวข้องกับ Admin ได้ที่นี่ */}
        <li>
          <button
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' });
              window.location.href = '/';
            }}
            className="w-full text-left hover:text-red-400"
          >
            ออกจากระบบ
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default SidebarAdmin;
