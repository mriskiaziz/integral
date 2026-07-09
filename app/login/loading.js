import PageLoading from '@/components/PageLoading';



export default function Loading() {
  return (
    <main className="shell min-h-screen">
      <PageLoading title="Memuat login" description="Menyiapkan formulir masuk." />
    </main>
  );
}
