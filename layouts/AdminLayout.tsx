// layouts/AdminLayout.tsx

'use client';

import React from 'react';
import SidebarAdmin from '@/components/shared/SidebarAdmin';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-800">
      <SidebarAdmin />
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
