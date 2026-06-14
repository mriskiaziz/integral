import Link from 'next/link';
import { redirect } from 'next/navigation';
import PublicHeader from '@/components/PublicHeader';
import { prisma } from '@/lib/prisma';

export default async function ResultPage({ params, searchParams }) {
  const session = await prisma.examSession.findUnique({
    where: { id: params.sessionId },
    include: {
      user: true,
      package: true,
      accessCode: true,
      answers: { include: { question: true } },
    },
  });

  if (!session) redirect('/login');

  const passed = Number(session.score || 0) >= session.package.passingScore;

  return (
    <main className="shell min-h-screen">
      <PublicHeader active="Paket Ujian" userId={searchParams.userId} />
      <section className="public-frame py-10">
        <div className="card mx-auto max-w-4xl p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-black">Hasil Ujian</h1>
              <p className="mt-2 text-sm text-slate-600">
                Ujian berhasil diselesaikan.
              </p>
              <div className="mt-6 space-y-2 text-sm">
                <p><b>Nama:</b> {session.user.name}</p>
                <p><b>Ujian:</b> {session.accessCode.name}</p>
                <p><b>Paket:</b> {session.package.title}</p>
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 px-10 py-8 text-center">
              <p className="text-sm font-semibold text-slate-500">Skor</p>
              <p className="mt-2 text-6xl font-black text-blue-600">{session.score}</p>
              <p className={`mt-3 text-sm font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {passed ? 'Lulus' : 'Belum Lulus'}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ['Benar', session.correctCount || 0, 'text-green-600'],
              ['Salah', session.wrongCount || 0, 'text-red-600'],
              ['Kosong', session.unansweredCount || 0, 'text-slate-600'],
            ].map(([label, value, color]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 text-center">
                <p className={`text-3xl font-black ${color}`}>{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <Link href={`/user?userId=${searchParams.userId}`} className="btn-secondary mt-8">
            Kembali
          </Link>
        </div>
      </section>
    </main>
  );
}
