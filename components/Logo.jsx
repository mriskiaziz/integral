import Image from 'next/image';

export default function Logo({ className = 'h-16 w-auto' }) {
  return (
    <Image
      src="/logoPerusahaan.png"
      alt="Integral"
      width={500}
      height={300}
      priority
      className={className}
    />
  );
}
