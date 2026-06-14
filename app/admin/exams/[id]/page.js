import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import SubmitButton from '@/components/SubmitButton';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function deleteQuestion(formData) {
  'use server';

  const id = String(formData.get('id'));
  const packageId = String(formData.get('packageId'));
  await prisma.examQuestion.delete({ where: { id } });
  revalidatePath(`/admin/exams/${packageId}`);
}

export default async function ExamDetailPage({ params }) {
  const item = await prisma.examPackage.findUnique({
    where: { id: params.id },
    include: {
      questions: { orderBy: { order: 'asc' }, include: { options: true } },
      accessCodes: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!item) {
    return <p>Data tidak ditemukan</p>;
  }

  return (
    <>
      <PageHeader
        title={`Detail Paket: ${item.title}`}
        description={`${item.level} - ${item.questions.length} soal - ${item.durationMinutes} menit`}
        action={<Link href="/admin/exams" className="btn-secondary">Kembali</Link>}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="font-black">Daftar Soal</h2>
            <Link href={`/admin/exams/${item.id}/sections/main/questions/new`} className="btn-primary">
              Tambah Soal
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">No</th>
                <th className="table-th">Soal</th>
                <th className="table-th">Opsi</th>
                <th className="table-th">Skor</th>
                <th className="table-th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {item.questions.map((question, index) => (
                <tr key={question.id}>
                  <td className="table-td">{index + 1}</td>
                  <td className="table-td">{question.content.slice(0, 90)}</td>
                  <td className="table-td">{question.options.length}</td>
                  <td className="table-td">{question.score}</td>
                  <td className="table-td">
                    <form action={deleteQuestion}>
                      <input type="hidden" name="id" value={question.id} />
                      <input type="hidden" name="packageId" value={item.id} />
                      <SubmitButton
                        className="inline-flex items-center gap-2 font-semibold text-red-600 disabled:opacity-60"
                        pendingText="Menghapus..."
                      >
                        Hapus
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-black">Kode Akses</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Kode</th>
                <th className="table-th">Durasi</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {item.accessCodes.map((code) => (
                <tr key={code.id}>
                  <td className="table-td font-bold">{code.code}</td>
                  <td className="table-td">{code.durationMinutes} m</td>
                  <td className="table-td">{code.isActive ? 'Aktif' : 'Nonaktif'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
