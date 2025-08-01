// app/layout.tsx

import "../globals.css";
import type { ReactNode } from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body className="flex flex-col min-h-screen bg-gray-100 text-gray-900 overflow-x-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
