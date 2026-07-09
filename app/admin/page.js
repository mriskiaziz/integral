import { apiGet } from '@/lib/internalApi';
import { formatDate } from '@/lib/utils';

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [packages, questions, users, sessions] = await Promise.all([
    apiGet('/api/exampackage'),
    apiGet('/api/examquestion'),
    apiGet('/api/user?role=PESERTA'),
    apiGet('/api/examsession'),
  ]);

  const packageMap = new Map(packages.map((item) => [item.id, item]));
  const userMap = new Map(users.map((item) => [item.id, item]));
  const sessionCounts = sessions.reduce((counts, session) => {
    counts.set(session.packageId, (counts.get(session.packageId) || 0) + 1);
    return counts;
  }, new Map());
  const latestSessions = sessions
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((session) => ({
      ...session,
      user: userMap.get(session.userId),
      package: packageMap.get(session.packageId),
    }));
  const finished = sessions.filter((session) => session.status === 'FINISHED');
  const passed = finished.filter((session) => {
    const packageItem = packageMap.get(session.packageId);
    return packageItem && Number(session.score || 0) >= packageItem.passingScore;
  }).length;
  const passRate = finished.length ? Math.round((passed / finished.length) * 100) : 0;
  const totalPackages = packages.length;
  const totalQuestions = questions.length;
  const totalUsers = users.length;
  const todaySessions = sessions.filter((session) => new Date(session.createdAt) >= today).length;
  const maxParticipants = Math.max(...packages.map((item) => sessionCounts.get(item.id) || 0), 1);

  return (
    <>
      <h1 className="mb-7 text-2xl font-black text-slate-950">Dashboard</h1>

      <div className="grid gap-5 md:grid-cols-4">
        {[
          ['Total Ujian', totalPackages],
          ['Total Soal', totalQuestions],
          ['Total Peserta', totalUsers],
          ['Ujian Hari Ini', todaySessions],
        ].map(([label, value]) => (
          <div key={label} className="card p-6">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <section className="card mt-7 overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-black">Ujian Terbaru</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-th">Nama Ujian</th>
              <th className="table-th">Peserta</th>
              <th className="table-th">Waktu</th>
              <th className="table-th">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {latestSessions.map((session) => (
              <tr key={session.id}>
                <td className="table-td font-semibold">{session.package?.title || '-'}</td>
                <td className="table-td">{session.user?.name || '-'}</td>
                <td className="table-td">{formatDate(session.createdAt)}</td>
                <td className="table-td">
                  <a className="font-semibold text-blue-600" href="/admin/results">
                    Lihat
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="card p-6">
          <h2 className="font-black">Peserta per Ujian</h2>
          <div className="mt-8 flex h-56 items-end gap-7 border-b border-slate-200 px-2">
            {packages
              .sort((a, b) => a.price - b.price)
              .map((item) => (
              <div key={item.id} className="flex flex-1 flex-col items-center gap-3">
                <div
                  className="w-full max-w-10 rounded-t-md bg-blue-600"
                  style={{
                    height: `${Math.max(((sessionCounts.get(item.id) || 0) / maxParticipants) * 180, 10)}px`,
                  }}
                />
                <span className="text-xs text-slate-500">{item.level}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-black">Persentase Kelulusan</h2>
          <div className="mt-8 flex justify-center">
            <div
              className="flex h-44 w-44 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#075bec ${passRate * 3.6}deg, #dbeafe 0deg)`,
              }}
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-2xl font-black">
                {passRate}%
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
