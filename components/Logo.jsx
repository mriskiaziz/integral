import Image from 'next/image';

export default function Logo({ className = 'h-12 w-auto' }) {
  return (
    <Image
      src="/logoPerusahaan.png"
      alt="Integral"
      width={260}
      height={90}
      priority
      className={className}
    />
  );
}
