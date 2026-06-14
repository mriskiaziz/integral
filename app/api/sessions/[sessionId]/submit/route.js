import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  const { answers, userId } = await req.json();
  const session = await prisma.examSession.findUnique({
    where: { id: params.sessionId },
    include: { package: true },
  });

  if (!session) {
    return NextResponse.json({ error: 'Session tidak ditemukan' }, { status: 404 });
  }

  const questions = await prisma.examQuestion.findMany({
    where: { packageId: session.packageId },
    include: { options: true },
  });

  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  let rawScore = 0;
  const maxScore = questions.reduce((sum, question) => sum + question.score, 0) || 1;

  for (const question of questions) {
    const selectedOptionId = answers?.[question.id] || null;
    const selected = question.options.find((option) => option.id === selectedOptionId);
    const isCorrect = selected ? selected.isCorrect : null;
    const score = isCorrect ? question.score : 0;

    if (!selectedOptionId) unanswered += 1;
    else if (isCorrect) correct += 1;
    else wrong += 1;

    rawScore += score;

    await prisma.participantAnswer.upsert({
      where: {
        sessionId_questionId: {
          sessionId: session.id,
          questionId: question.id,
        },
      },
      update: {
        selectedOptionId,
        isCorrect,
        score,
        answeredAt: selectedOptionId ? new Date() : null,
      },
      create: {
        sessionId: session.id,
        userId,
        questionId: question.id,
        selectedOptionId,
        isCorrect,
        score,
        answeredAt: selectedOptionId ? new Date() : null,
      },
    });
  }

  const finalScore = Math.round((rawScore / maxScore) * 100);

  await prisma.examSession.update({
    where: { id: session.id },
    data: {
      status: 'FINISHED',
      endedAt: new Date(),
      score: finalScore,
      correctCount: correct,
      wrongCount: wrong,
      unansweredCount: unanswered,
    },
  });

  return NextResponse.json({ ok: true });
}
