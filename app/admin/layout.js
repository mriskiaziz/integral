import AdminLayout from '@/components/AdminLayout';

export const dynamic = 'force-dynamic';

export default function Layout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
