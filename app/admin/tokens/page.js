import AdminLayout from '@/components/AdminLayout';
import PageHeader from '@/components/PageHeader';
import SubmitButton from '@/components/SubmitButton';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function createAccessCode(formData) {
  'use server';

  await prisma.accessCode.create({
    data: {
      code: String(formData.get('code')).trim().toUpperCase(),
      name: String(formData.get('name')),
      packageId: String(formData.get('packageId')),
      durationMinutes: Number(formData.get('durationMinutes') || 60),
      maxAttempts: Number(formData.get('maxAttempts') || 1),
      maxUsers: formData.get('maxUsers') ? Number(formData.get('maxUsers')) : null,
      isActive: formData.get('isActive') === 'on',
    },
  });

  revalidatePath('/admin/tokens');
}

export default async function TokensPage() {
  const [codes, packages] = await Promise.all([
    prisma.accessCode.findMany({
      include: { package: true, _count: { select: { sessions: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.examPackage.findMany({ orderBy: { title: 'asc' } }),
  ]);

  return (
    <AdminLayout>
      <PageHeader title="Kode Ujian" description="Buat kode untuk peserta masuk ke ujian." />
      <div className="grid gap-5 lg:grid-cols-3">
        <form action={createAccessCode} className="card space-y-4 p-5">
          <h2 className="font-black">Buat Kode</h2>
          <div>
            <label className="label">Nama Ujian</label>
            <input name="name" className="input" placeholder="Tryout SMP Gelombang 1" required />
          </div>
          <div>
            <label className="label">Kode</label>
            <input name="code" className="input uppercase" placeholder="INTEG-SMP" required />
          </div>
          <div>
            <label className="label">Paket</label>
            <select name="packageId" className="input">
              {packages.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Durasi menit</label>
              <input type="number" name="durationMinutes" className="input" defaultValue="90" />
            </div>
            <div>
              <label className="label">Percobaan</label>
              <input type="number" name="maxAttempts" className="input" defaultValue="1" />
            </div>
          </div>
          <div>
            <label className="label">Max Peserta</label>
            <input type="number" name="maxUsers" className="input" placeholder="Opsional" />
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked /> Aktif
          </label>
          <SubmitButton className="btn-primary w-full gap-2" pendingText="Menyimpan kode...">
            Simpan Kode
          </SubmitButton>
        </form>

        <div className="card overflow-hidden lg:col-span-2">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Kode</th>
                <th className="table-th">Nama</th>
                <th className="table-th">Paket</th>
                <th className="table-th">Durasi</th>
                <th className="table-th">Dipakai</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => (
                <tr key={code.id}>
                  <td className="table-td font-bold">{code.code}</td>
                  <td className="table-td">{code.name}</td>
                  <td className="table-td">{code.package.title}</td>
                  <td className="table-td">{code.durationMinutes} m</td>
                  <td className="table-td">{code._count.sessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
