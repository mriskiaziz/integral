import PageHeader from '@/components/PageHeader';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export default async function ResultsPage() {
  const sessions = await prisma.examSession.findMany({
    where: { status: 'FINISHED' },
    include: { user: true, package: true, accessCode: true },
    orderBy: { endedAt: 'desc' },
  });

  return (
    <>
      <PageHeader title="Hasil Ujian" description="Rekap nilai peserta yang sudah selesai ujian." />
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-th">Peserta</th>
              <th className="table-th">Ujian</th>
              <th className="table-th">Paket</th>
              <th className="table-th">Skor</th>
              <th className="table-th">Benar</th>
              <th className="table-th">Salah</th>
              <th className="table-th">Selesai</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td className="table-td font-semibold">{session.user.name}</td>
                <td className="table-td">{session.accessCode.name}</td>
                <td className="table-td">{session.package.title}</td>
                <td className="table-td font-bold">{session.score ?? '-'}</td>
                <td className="table-td">{session.correctCount}</td>
                <td className="table-td">{session.wrongCount}</td>
                <td className="table-td">{formatDate(session.endedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
