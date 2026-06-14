import { redirect } from 'next/navigation';
import PublicHeader from '@/components/PublicHeader';
import { prisma } from '@/lib/prisma';

async function startExam(formData) {
  'use server';

  const sessionId = String(formData.get('sessionId'));
  const userId = String(formData.get('userId'));

  await prisma.examSession.update({
    where: { id: sessionId },
    data: { status: 'IN_PROGRESS', startedAt: new Date() },
  });

  redirect(`/user/exam/${sessionId}?userId=${userId}`);
}

export default async function ConfirmPage({ params, searchParams }) {
  const session = await prisma.examSession.findUnique({
    where: { id: params.sessionId },
    include: {
      user: true,
      accessCode: true,
      package: { include: { _count: { select: { questions: true } } } },
    },
  });

  if (!session) redirect('/login');

  return (
    <main className="shell min-h-screen">
      <PublicHeader active="Paket Ujian" userId={searchParams.userId} />
      <section className="public-frame py-10">
        <div className="card mx-auto max-w-3xl p-8">
          <h1 className="text-2xl font-black">Konfirmasi Ujian</h1>
          <p className="mt-2 text-sm text-slate-600">
            Periksa informasi ujian sebelum mulai.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="space-y-3 text-sm">
              <p><b>Nama Peserta:</b> {session.user.name}</p>
              <p><b>Nama Ujian:</b> {session.accessCode.name}</p>
              <p><b>Paket:</b> {session.package.title}</p>
              <p><b>Level:</b> {session.package.level}</p>
              <p><b>Durasi:</b> {session.accessCode.durationMinutes} menit</p>
              <p><b>Jumlah Soal:</b> {session.package._count.questions}</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
              <b>Peraturan:</b>
              <ul className="mt-2 list-disc pl-5">
                <li>Kerjakan sebelum waktu habis.</li>
                <li>Jawaban otomatis dinilai setelah submit.</li>
                <li>Setelah selesai, jawaban tidak bisa diubah.</li>
              </ul>
            </div>
          </div>

          <form action={startExam} className="mt-8">
            <input type="hidden" name="sessionId" value={session.id} />
            <input type="hidden" name="userId" value={searchParams.userId} />
            <button className="btn-primary">Mulai Ujian</button>
          </form>
        </div>
      </section>
    </main>
  );
}
