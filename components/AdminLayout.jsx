"use client";

import Link from 'next/link';
import {
  ClipboardList,
  FileQuestion,
  Home,
  LogOut,
  Menu,
  Settings,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Logo from '@/components/Logo';

const menus = [
  {
    name: 'Dashboard',
    href: '/admin',
    Icon: Home,
    isActive: (pathname) => pathname === '/admin',
  },
  {
    name: 'Paket Ujian',
    href: '/admin/exams',
    Icon: ClipboardList,
    isActive: (pathname) => pathname === '/admin/exams',
  },
  {
    name: 'Soal',
    href: '/admin/exams',
    Icon: FileQuestion,
    isActive: (pathname) => pathname.startsWith('/admin/exams/'),
  },
  {
    name: 'Peserta',
    href: '/admin/users',
    Icon: Users,
    isActive: (pathname) => pathname.startsWith('/admin/users'),
  },
  {
    name: 'Hasil Ujian',
    href: '/admin/results',
    Icon: Trophy,
    isActive: (pathname) => pathname.startsWith('/admin/results'),
  },
  {
    name: 'Kode Ujian',
    href: '/admin/tokens',
    Icon: Settings,
    isActive: (pathname) => pathname.startsWith('/admin/tokens'),
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const sidebar = (
    <>
      <div className="flex items-center justify-between border-b border-white/10 bg-white px-5 py-4">
        <Logo className="h-12 w-auto" />
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={closeMenu}
          className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
          AI
        </div>
        <div>
          <div className="text-sm font-bold">Admin Integral</div>
          <div className="text-xs text-blue-100">Administrator</div>
        </div>
      </div>
      <nav className="space-y-1 px-3 pb-5">
        {menus.map(({ name, href, Icon, isActive }) => {
          const active = isActive(pathname);

          return (
            <Link
              key={`${name}-${href}`}
              href={href}
              onClick={closeMenu}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition ${
                active ? 'bg-white/15 text-white' : 'text-blue-50 hover:bg-white/10'
              }`}
            >
              <Icon size={17} /> {name}
            </Link>
          );
        })}
        <Link
          href="/login"
          onClick={closeMenu}
          className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-blue-50 hover:bg-white/10"
        >
          <LogOut size={17} /> Logout
        </Link>
      </nav>
    </>
  );

  return (
    <div className="h-screen overflow-hidden bg-[#f7faff]">
      {menuOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={closeMenu}
          className="fixed inset-0 z-30 bg-slate-950/45 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto bg-[#08214a] text-white shadow-2xl transition-transform duration-200 md:translate-x-0 md:shadow-none ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </aside>

      <div className="flex h-screen flex-col md:pl-64">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
          <button
            type="button"
            aria-label="Buka menu"
            onClick={() => setMenuOpen(true)}
            className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
          >
            <Menu size={22} />
          </button>
          <Logo className="h-10 w-auto" />
          <span className="h-10 w-10" aria-hidden="true" />
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
