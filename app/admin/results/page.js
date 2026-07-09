import PageHeader from '@/components/PageHeader';
import { apiGet } from '@/lib/internalApi';
import { formatDate } from '@/lib/utils';

export default async function ResultsPage() {
  const [sessionItems, users, packages, accessCodes] = await Promise.all([
    apiGet('/api/examsession?status=FINISHED'),
    apiGet('/api/user'),
    apiGet('/api/exampackage'),
    apiGet('/api/accesscode'),
  ]);
  const userMap = new Map(users.map((item) => [item.id, item]));
  const packageMap = new Map(packages.map((item) => [item.id, item]));
  const accessCodeMap = new Map(accessCodes.map((item) => [item.id, item]));
  const sessions = sessionItems
    .sort((a, b) => new Date(b.endedAt || 0) - new Date(a.endedAt || 0))
    .map((session) => ({
      ...session,
      user: userMap.get(session.userId),
      package: packageMap.get(session.packageId),
      accessCode: accessCodeMap.get(session.accessCodeId),
    }));

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
                <td className="table-td font-semibold">{session.user?.name || '-'}</td>
                <td className="table-td">{session.accessCode?.name || '-'}</td>
                <td className="table-td">{session.package?.title || '-'}</td>
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
