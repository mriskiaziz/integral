import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/PageHeader';
import SubmitButton from '@/components/SubmitButton';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

async function createUser(formData) {
  'use server';
  const password = await bcrypt.hash(String(formData.get('password') || '123456'), 10);
  await prisma.user.create({ data: { name: String(formData.get('name')), username: String(formData.get('username')), password, role: 'PESERTA' } });
  revalidatePath('/admin/users');
}

export default async function UsersPage() {
  const users = await prisma.user.findMany({ where: { role: 'PESERTA' }, include: { _count: { select: { sessions: true } } }, orderBy: { createdAt: 'desc' } });
  return (
    <AdminLayout>
      <PageHeader title="Peserta" description="Kelola akun peserta ujian Integral." />
      <div className="grid gap-5 lg:grid-cols-3">
        <form action={createUser} className="card space-y-4 p-5">
          <h2 className="font-black">Tambah Peserta</h2>
          <div>
            <label className="label">Nama</label>
            <input name="name" className="input" required />
          </div>
          <div>
            <label className="label">Username</label>
            <input name="username" className="input" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input name="password" type="password" className="input" required />
          </div>
          <SubmitButton className="btn-primary gap-2" pendingText="Menyimpan peserta...">
            Simpan
          </SubmitButton>
        </form>
        <div className="card overflow-hidden lg:col-span-2">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Nama</th>
                <th className="table-th">Username</th>
                <th className="table-th">Jumlah Ujian</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="table-td font-medium">{u.name}</td>
                  <td className="table-td">{u.username}</td>
                  <td className="table-td">{u._count.sessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
