import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import SubmitButton from '@/components/SubmitButton';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function createPackage(formData) {
  'use server';

  const title = String(formData.get('title'));
  await prisma.examPackage.create({
    data: {
      title,
      slug: `${slugify(title)}-${Date.now()}`,
      level: String(formData.get('level')),
      description: String(formData.get('description') || ''),
      price: Number(formData.get('price') || 0),
      durationMinutes: Number(formData.get('durationMinutes') || 60),
      passingScore: Number(formData.get('passingScore') || 70),
      isActive: formData.get('isActive') === 'on',
    },
  });

  revalidatePath('/admin/exams');
  revalidatePath('/');
}

export default async function ExamsPage() {
  const packages = await prisma.examPackage.findMany({
    include: { _count: { select: { questions: true, accessCodes: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <PageHeader
        title="Paket Ujian"
        description="Kelola paket tryout Integral untuk SD, SMP, dan SMA."
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <form action={createPackage} className="card space-y-4 p-5">
          <h2 className="font-black">Tambah Paket</h2>
          <div>
            <label className="label">Nama Paket</label>
            <input name="title" className="input" placeholder="Paket Tryout SMP" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Level</label>
              <select name="level" className="input" defaultValue="SMP">
                <option>SD</option>
                <option>SMP</option>
                <option>SMA</option>
              </select>
            </div>
            <div>
              <label className="label">Harga</label>
              <input type="number" name="price" className="input" defaultValue="35000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Durasi</label>
              <input type="number" name="durationMinutes" className="input" defaultValue="90" />
            </div>
            <div>
              <label className="label">Passing Score</label>
              <input type="number" name="passingScore" className="input" defaultValue="70" />
            </div>
          </div>
          <div>
            <label className="label">Deskripsi</label>
            <textarea name="description" className="input" rows="4" />
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked /> Aktif
          </label>
          <SubmitButton className="btn-primary w-full gap-2" pendingText="Menyimpan paket...">
            Simpan Paket
          </SubmitButton>
        </form>

        <div className="card overflow-hidden lg:col-span-2">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Paket</th>
                <th className="table-th">Level</th>
                <th className="table-th">Harga</th>
                <th className="table-th">Soal</th>
                <th className="table-th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((item) => (
                <tr key={item.id}>
                  <td className="table-td font-semibold">{item.title}</td>
                  <td className="table-td">{item.level}</td>
                  <td className="table-td">{formatCurrency(item.price)}</td>
                  <td className="table-td">{item._count.questions}</td>
                  <td className="table-td">
                    <Link className="font-semibold text-blue-600" href={`/admin/exams/${item.id}`}>
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
