import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Info, ClipboardList } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import SubmitButton from '@/components/SubmitButton';
import { AUTH_COOKIE, verifySessionToken } from '@/lib/auth';
import { apiGet, apiPost } from '@/lib/internalApi';
import { formatDate } from '@/lib/utils';

async function enterCode(formData) {
  'use server';

  const auth = await verifySessionToken(cookies().get(AUTH_COOKIE)?.value);
  if (!auth) redirect('/login?error=unauthorized');

  const userId = auth.userId;
  const codeText = String(formData.get('code')).trim().toUpperCase();
  const accessCodes = await apiGet(`/api/accesscode?code=${encodeURIComponent(codeText)}`);
  const accessCode = accessCodes[0];

  if (!accessCode || !accessCode.isActive) {
    redirect('/user?error=code');
  }

  const codeSessions = await apiGet(`/api/examsession?accessCodeId=${accessCode.id}`);

  if (accessCode.maxUsers && codeSessions.length >= accessCode.maxUsers) {
    redirect('/user?error=full');
  }

  const previousAttempts = await apiGet(
    `/api/examsession?userId=${userId}&accessCodeId=${accessCode.id}`,
  );

  if (previousAttempts.length >= accessCode.maxAttempts) {
    redirect('/user?error=attempt');
  }

  const session = await apiPost('/api/examsession', {
    userId,
    packageId: accessCode.packageId,
    accessCodeId: accessCode.id,
    status: 'NOT_STARTED',
  });

  redirect(`/user/confirm/${session.id}`);
}

function errorText(code) {
  if (code === 'full') return 'Kuota kode ujian sudah penuh.';
  if (code === 'attempt') return 'Kamu sudah mencapai batas percobaan kode ini.';
  if (code) return 'Kode ujian tidak valid atau tidak aktif.';
  return null;
}

export default async function UserDashboard({ searchParams }) {
  const auth = await verifySessionToken(cookies().get(AUTH_COOKIE)?.value);
  if (!auth) redirect('/login?error=unauthorized');

  const [user, sessions, packages, accessCodes] = await Promise.all([
    apiGet(`/api/user?id=${auth.userId}`),
    apiGet(`/api/examsession?userId=${auth.userId}`),
    apiGet('/api/exampackage'),
    apiGet('/api/accesscode'),
  ]);

  if (!user) redirect('/logout');
  const message = errorText(searchParams?.error);
  const packageMap = new Map(packages.map((item) => [item.id, item]));
  const accessCodeMap = new Map(accessCodes.map((item) => [item.id, item]));
  const recentSessions = sessions
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((session) => ({
      ...session,
      package: packageMap.get(session.packageId),
      accessCode: accessCodeMap.get(session.accessCodeId),
    }));

  return (
    <main className="shell min-h-screen">
      <PublicHeader active="Paket Ujian" userId={user.id} />
      <section className="flex min-h-[calc(100vh-82px)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <form action={enterCode} className="card px-8 py-9 text-center shadow-xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white">
              <ClipboardList size={38} />
            </div>
            <h1 className="mt-7 text-2xl font-black">Masukkan Kode Ujian</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
              Masukkan kode ujian yang diberikan oleh admin/guru untuk memulai
              ujian.
            </p>
            {message && (
              <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {message}
              </div>
            )}
            <input
              name="code"
              className="input mt-7 text-center uppercase"
              placeholder="Contoh: INTEG2024"
              required
            />
            <SubmitButton className="btn-primary mt-4 w-full gap-2 py-3" pendingText="Memulai...">
              Mulai Ujian
            </SubmitButton>
            <div className="mt-6 flex items-start gap-3 rounded-md bg-blue-50 px-4 py-4 text-left text-xs leading-5 text-slate-600">
              <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
              <span>
                Pastikan kode ujian yang kamu masukkan sudah benar. Kode bersifat
                case sensitive.
              </span>
            </div>
          </form>

          {recentSessions.length > 0 && (
            <div className="card mt-6 overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-bold">Riwayat Terbaru</h2>
              </div>
              <table className="w-full">
                <tbody>
                  {recentSessions.map((session) => (
                    <tr key={session.id}>
                      <td className="table-td font-semibold">{session.package?.title || '-'}</td>
                      <td className="table-td">{session.status}</td>
                      <td className="table-td">{session.score ?? '-'}</td>
                      <td className="table-td">{formatDate(session.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
