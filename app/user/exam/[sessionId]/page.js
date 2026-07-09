import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ExamClient from '@/components/ExamClient';
import { AUTH_COOKIE, verifySessionToken } from '@/lib/auth';
import { apiGet } from '@/lib/internalApi';

export default async function ExamPage({ params }) {
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

  if (session.status === 'FINISHED') {
    redirect(`/user/result/${session.id}`);
  }

  const [accessCode, packageItem, questionItems, options] = await Promise.all([
    apiGet(`/api/accesscode?id=${session.accessCodeId}`),
    apiGet(`/api/exampackage?id=${session.packageId}`),
    apiGet(`/api/examquestion?packageId=${session.packageId}`),
    apiGet('/api/answeroption'),
  ]);
  const optionsByQuestion = options.reduce((items, option) => {
    const current = items.get(option.questionId) || [];
    current.push(option);
    items.set(option.questionId, current);
    return items;
  }, new Map());
  const questions = questionItems
    .sort((a, b) => a.order - b.order)
    .map((question) => ({
      ...question,
      options: (optionsByQuestion.get(question.id) || []).sort((a, b) => a.order - b.order),
    }));
  const sessionData = { ...session, accessCode, package: packageItem };

  return (
    <ExamClient
      session={sessionData}
      questions={questions}
      userId={auth.userId}
    />
  );
}
