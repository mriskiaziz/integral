import './globals.css';

export const metadata = {
  title: 'Integral - Simulasi Ujian Matematika',
  description: 'Platform ujian online Integral untuk tryout matematika SD, SMP, dan SMA.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
