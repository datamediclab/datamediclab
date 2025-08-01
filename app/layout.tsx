// app/layout.tsx

import "./globals.css";
import type { ReactNode } from "react";
import Header from "@/components/shared/Header";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen flex flex-col bg-gray-100 text-gray-900 overflow-x-hidden relative">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex flex-col flex-1 w-full max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-200 text-center text-sm text-blue-800 py-4 mt-auto font-sans" style={{ fontFamily: 'Sarabun, sans-serif' }}>
          &copy; {new Date().getFullYear()} Data Medic Lab. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
