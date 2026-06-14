import AdminLayout from '@/components/AdminLayout';
import PageLoading from '@/components/PageLoading';

export default function Loading() {
  return (
    <AdminLayout>
      <PageLoading title="Memuat admin" description="Mengambil data terbaru." />
    </AdminLayout>
  );
}
