import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import PublicHeader from '@/components/PublicHeader';
import SubmitButton from '@/components/SubmitButton';
import { AUTH_COOKIE, verifySessionToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function startExam(formData) {
  'use server';

  const auth = await verifySessionToken(cookies().get(AUTH_COOKIE)?.value);
  if (!auth) redirect('/login?error=unauthorized');

  const sessionId = String(formData.get('sessionId'));
  const session = await prisma.examSession.findUnique({ where: { id: sessionId } });

  if (!session) redirect('/user');
  if (auth.role !== 'ADMIN' && session.userId !== auth.userId) redirect('/user');

  await prisma.examSession.update({
    where: { id: sessionId },
    data: { status: 'IN_PROGRESS', startedAt: new Date() },
  });

  redirect(`/user/exam/${sessionId}`);
}

export default async function ConfirmPage({ params }) {
  const auth = await verifySessionToken(cookies().get(AUTH_COOKIE)?.value);
  if (!auth) redirect('/login?error=unauthorized');

  const session = await prisma.examSession.findUnique({
    where: { id: params.sessionId },
    include: {
      user: true,
      accessCode: true,
      package: { include: { _count: { select: { questions: true } } } },
    },
  });

  if (!session) redirect('/login');
  if (auth.role !== 'ADMIN' && session.userId !== auth.userId) redirect('/user');

  return (
    <main className="shell min-h-screen">
      <PublicHeader active="Paket Ujian" userId={auth.userId} />
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
            <SubmitButton className="btn-primary gap-2" pendingText="Memulai...">
              Mulai Ujian
            </SubmitButton>
          </form>
        </div>
      </section>
    </main>
  );
}
