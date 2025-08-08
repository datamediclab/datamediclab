// layouts/AdminLayout.tsx
import React from 'react';
import SidebarAdmin from '@/components/shared/SidebarAdmin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start bg-gray-100 min-h-0">
      {/* Sidebar is rendered here exactly once */}
      <SidebarAdmin />

      {/* Main column should size to content height, not force full screen */}
      <div className="flex flex-col w-full overflow-visible">
        <main className="w-full bg-gray-700">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}