"use client";

import Link from 'next/link';
import {
  BarChart3,
  ClipboardList,
  FileQuestion,
  Home,
  LogOut,
  Settings,
  Trophy,
  Users,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';

const menus = [
  ['Dashboard', '/admin', Home],
  ['Ujian', '/admin/exams', ClipboardList],
  ['Soal', '/admin/exams', FileQuestion],
  ['Peserta', '/admin/users', Users],
  ['Hasil Ujian', '/admin/results', Trophy],
  ['Laporan', '/admin/results', BarChart3],
  ['Pengaturan', '/admin/tokens', Settings],
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f7faff] md:flex">
      <aside className="hidden w-64 shrink-0 bg-[#08214a] text-white md:block">
        <div className="border-b border-white/10 bg-white px-5 py-4">
          <Logo className="h-12 w-auto" />
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
        <nav className="space-y-1 px-3">
          {menus.map(([name, href, Icon]) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={`${name}-${href}`}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition ${
                  active ? 'bg-white/14 text-white' : 'text-blue-50 hover:bg-white/10'
                }`}
              >
                <Icon size={17} /> {name}
              </Link>
            );
          })}
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-blue-50 hover:bg-white/10"
          >
            <LogOut size={17} /> Logout
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-x-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
