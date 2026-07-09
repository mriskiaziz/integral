import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import PublicHeader from '@/components/PublicHeader';
import SubmitButton from '@/components/SubmitButton';
import { AUTH_COOKIE, verifySessionToken } from '@/lib/auth';
import { apiGet, apiPut } from '@/lib/internalApi';

async function startExam(formData) {
  'use server';

  const auth = await verifySessionToken(cookies().get(AUTH_COOKIE)?.value);
  if (!auth) redirect('/login?error=unauthorized');

  const sessionId = String(formData.get('sessionId'));
  let session;

  try {
    session = await apiGet(`/api/examsession?id=${sessionId}`);
  } catch {
    redirect('/user');
  }

  if (!session) redirect('/user');
  if (auth.role !== 'ADMIN' && session.userId !== auth.userId) redirect('/user');

  await apiPut(`/api/examsession?id=${sessionId}`, {
    status: 'IN_PROGRESS',
    startedAt: new Date().toISOString(),
  });

  redirect(`/user/exam/${sessionId}`);
}

export default async function ConfirmPage({ params }) {
  const auth = await verifySessionToken(cookies().get(AUTH_COOKIE)?.value);
  if (!auth) redirect('/login?error=unauthorized');

  let session;

  try {
    session = await apiGet(`/api/examsession?id=${params.sessionId}`);
  } catch {
    redirect('/login');
  }

  if (!session) redirect('/login');
  if (auth.role !== 'ADMIN' && session.userId !== auth.userId) redirect('/user');

  const [user, accessCode, packageItem, questions] = await Promise.all([
    apiGet(`/api/user?id=${session.userId}`),
    apiGet(`/api/accesscode?id=${session.accessCodeId}`),
    apiGet(`/api/exampackage?id=${session.packageId}`),
    apiGet(`/api/examquestion?packageId=${session.packageId}`),
  ]);

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
              <p><b>Nama Peserta:</b> {user.name}</p>
              <p><b>Nama Ujian:</b> {accessCode.name}</p>
              <p><b>Paket:</b> {packageItem.title}</p>
              <p><b>Level:</b> {packageItem.level}</p>
              <p><b>Durasi:</b> {accessCode.durationMinutes} menit</p>
              <p><b>Jumlah Soal:</b> {questions.length}</p>
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
