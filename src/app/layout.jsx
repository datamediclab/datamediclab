// app/layout.jsx

"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { name: "บริการ", href: "/services" },
    { name: "ติดต่อเรา", href: "/contact" },
    { name: "ติดตามสถานะ", href: "/track" },
  ];

  return (
    <html lang="th">
      <body className="min-h-screen flex flex-col bg-gray-100 text-gray-900 overflow-x-hidden relative">
        {/* Header */}
        <header className="bg-white text-blue-800 shadow-md z-50 relative border-b border-gray-200">
          <div className="max-w-6xl w-full mx-auto flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="logo" width={32} height={32} className="object-contain" />
              <span
                className="text-xl sm:text-2xl font-extrabold tracking-tight hover:text-blue-600 transition font-sans hidden sm:inline"
                style={{ fontFamily: 'Sarabun, sans-serif' }}
              >
                Data Medic Lab
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex space-x-2 sm:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold border rounded-full transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500 hover:shadow-sm hover:-translate-y-0.5 font-sans` +
                    (pathname === item.href
                      ? " bg-blue-800 text-white border-blue-800"
                      : " bg-white text-blue-800 border-blue-600")}
                  style={{ fontFamily: 'Sarabun, sans-serif' }}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </header>

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
