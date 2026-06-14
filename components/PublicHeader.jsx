import Link from 'next/link';
import Logo from '@/components/Logo';

const links = [
  ['Beranda', '/'],
  ['Paket Ujian', '/#paket'],
  ['Tentang Kami', '/#tentang'],
  ['Bantuan', '/#bantuan'],
];

export default function PublicHeader({ active = 'Beranda', userId }) {
  const loginHref = userId ? '/user' : '/login';

  return (
    <header className="public-header">
      <Link href="/" className="shrink-0" aria-label="Integral">
        <Logo />
      </Link>
      <nav className="hidden items-center gap-8 md:flex">
        {links.map(([label, href]) => (
          <Link
            key={label}
            href={href}
            className={`nav-link ${active === label ? 'nav-link-active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <Link href={loginHref} className="btn-primary min-w-24 text-center">
        Login
      </Link>
    </header>
  );
}
