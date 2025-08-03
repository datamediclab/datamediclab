'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { FaUserShield } from "react-icons/fa";

const Header = () => {
  const pathname = usePathname();

  const navItems = [    
    { name: "ส่งกู้ข้อมูล", href: "/services" },
    { name: "ติดตามสถานะ", href: "/track" },
    { name: "ติดต่อเรา", href: "/contact" },
  ];

  return (
    <header className="bg-white text-blue-800 shadow-md z-50 relative border-b border-gray-600">
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Data Medic Lab Logo"
              width={32}
              height={32}
              className="object-contain cursor-pointer"
              priority
            />
          </Link>
          <Link href="/">
            <span
              className="text-xl sm:text-2xl font-extrabold tracking-tight hover:text-blue-600 transition font-sans hidden sm:inline"
              style={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              Data Medic Lab
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex space-x-2 sm:space-x-4 items-center">
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

          {/* Admin Login */}
          <Link
            href="/admin/login"
            className="ml-2 px-3 py-1.5 text-sm text-blue-600 rounded-full hover:bg-blue-50 hover:text-blue-700 transition"
            aria-label="Admin Login"
          >
            <FaUserShield size={20} />
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
