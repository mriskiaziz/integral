import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ExamClient from '@/components/ExamClient';

export default async function ExamPage({ params, searchParams }) {
  const session = await prisma.examSession.findUnique({
    where: { id: params.sessionId },
    include: { accessCode: true, package: true },
  });

  if (!session) redirect('/login');
  if (session.status === 'FINISHED') {
    redirect(`/user/result/${session.id}?userId=${searchParams.userId}`);
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
      userId={searchParams.userId}
    />
  );
}
