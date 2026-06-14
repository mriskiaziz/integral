import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import Logo from '@/components/Logo';

const quickLinks = [
  ['Beranda', '/'],
  ['Paket Ujian', '/#paket'],
  ['Tentang Kami', '/#tentang'],
  ['Bantuan', '/#bantuan'],
];

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="public-frame grid gap-8 py-10 md:grid-cols-[1.3fr_0.8fr_1fr]">
        <div>
          <Link href="/" aria-label="Integral" className="inline-flex">
            <Logo className="h-12 w-auto" />
          </Link>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
            Platform simulasi ujian matematika dari Bimbel Integral untuk
            latihan terarah, pengerjaan online, dan hasil ujian yang langsung
            bisa dievaluasi.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-950">Navigasi</h2>
          <div className="mt-4 grid gap-3 text-sm">
            {quickLinks.map(([label, href]) => (
              <Link key={label} href={href} className="text-slate-600 hover:text-blue-600">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-950">Kontak Bantuan</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <Phone size={16} className="mt-0.5 shrink-0 text-blue-600" />
              <span>Admin/Guru Bimbel Integral</span>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={16} className="mt-0.5 shrink-0 text-blue-600" />
              <span>Kontak melalui pengelola kelas</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0 text-blue-600" />
              <span>Layanan simulasi ujian online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="public-frame flex flex-col justify-between gap-3 py-5 text-sm text-slate-500 md:flex-row">
          <span>© {year} Integral. Semua hak dilindungi.</span>
          <span>Simulasi ujian matematika online.</span>
        </div>
      </div>
    </footer>
  );
}
