import PageHeader from '@/components/PageHeader';
import SubmitButton from '@/components/SubmitButton';
import { apiGet, apiPost } from '@/lib/internalApi';
import { revalidatePath } from 'next/cache';

async function createUser(formData) {
  'use server';
  await apiPost('/api/user', {
    name: String(formData.get('name')),
    username: String(formData.get('username')),
    password: String(formData.get('password') || '123456'),
    role: 'PESERTA',
  });
  revalidatePath('/admin/users');
}

export default async function UsersPage() {
  const [userItems, sessions] = await Promise.all([
    apiGet('/api/user?role=PESERTA'),
    apiGet('/api/examsession'),
  ]);
  const sessionCounts = sessions.reduce((counts, session) => {
    counts.set(session.userId, (counts.get(session.userId) || 0) + 1);
    return counts;
  }, new Map());
  const users = userItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <>
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
                  <td className="table-td">{sessionCounts.get(u.id) || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
