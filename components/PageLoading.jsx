import LoadingSpinner from '@/components/LoadingSpinner';

export default function PageLoading({ title = 'Memuat halaman', description }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-4 py-12">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <LoadingSpinner className="h-7 w-7" label={title} />
        </div>
        <h1 className="mt-5 text-lg font-black text-slate-950">{title}</h1>
        {description && (
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        )}
      </div>
    </div>
  );
}
