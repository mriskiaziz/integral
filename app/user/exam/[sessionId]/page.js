import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import ExamClient from '@/components/ExamClient';
import { AUTH_COOKIE, verifySessionToken } from '@/lib/auth';

export default async function ExamPage({ params }) {
  const auth = await verifySessionToken(cookies().get(AUTH_COOKIE)?.value);
  if (!auth) redirect('/login?error=unauthorized');

  const session = await prisma.examSession.findUnique({
    where: { id: params.sessionId },
    include: { accessCode: true, package: true },
  });

  if (!session) redirect('/login');
  if (auth.role !== 'ADMIN' && session.userId !== auth.userId) redirect('/user');

  if (session.status === 'FINISHED') {
    redirect(`/user/result/${session.id}`);
  }

  const questions = await prisma.examQuestion.findMany({
    where: { packageId: session.packageId },
    orderBy: { order: 'asc' },
    include: { options: { orderBy: { order: 'asc' } } },
  });

  return (
    <ExamClient
      session={JSON.parse(JSON.stringify(session))}
      questions={JSON.parse(JSON.stringify(questions))}
      userId={auth.userId}
    />
  );
}
