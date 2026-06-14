'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function ExamClient({ session, questions, userId }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [remaining, setRemaining] = useState(session.accessCode.durationMinutes * 60);
  const current = questions[index];

  useEffect(() => {
    const started = new Date(session.startedAt || Date.now()).getTime();
    const end = started + session.accessCode.durationMinutes * 60 * 1000;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setRemaining(left);
    }, 1000);
    return () => clearInterval(timer);
  }, [session.accessCode.durationMinutes, session.startedAt]);

  useEffect(() => {
    if (remaining === 0 && !submitting) submitExam(true);
  }, [remaining, submitting]);

  const timeText = useMemo(() => formatTime(remaining), [remaining]);

  async function submitExam(force = false) {
    if (submitting) return;
    const ok = force || confirm('Selesaikan ujian sekarang?');
    if (!ok) return;

    setSubmitting(true);
    const res = await fetch(`/api/sessions/${session.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, userId }),
    });

    if (res.ok) {
      router.push(`/user/result/${session.id}?userId=${userId}`);
      return;
    }

    setSubmitting(false);
    alert('Gagal mengirim jawaban. Coba lagi.');
  }

  function questionClass(question, questionIndex) {
    if (questionIndex === index) return 'bg-blue-600 text-white border-blue-600';
    if (flagged[question.id]) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (answers[question.id]) return 'bg-green-100 text-green-700 border-green-300';
    return 'bg-white text-slate-600 border-slate-200';
  }

  if (!current) {
    return (
      <main className="shell flex min-h-screen items-center justify-center p-6">
        <div className="card max-w-md p-8 text-center">
          <h1 className="text-xl font-black">Soal belum tersedia</h1>
          <p className="mt-2 text-sm text-slate-600">
            Hubungi admin untuk menambahkan soal pada paket ini.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7faff]">
      <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6">
        <Logo className="h-12 w-auto" />
        <div className="hidden text-sm font-bold md:block">{session.accessCode.name}</div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="font-mono text-2xl font-black">{timeText}</div>
            <div className="text-xs text-slate-500">Sisa Waktu</div>
          </div>
          <button onClick={() => submitExam()} className="btn-danger">
            Akhiri Ujian
          </button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-5 p-5 lg:grid-cols-[330px_1fr]">
        <aside className="card p-5">
          <h2 className="font-bold">Daftar Soal</h2>
          <div className="mt-5 grid grid-cols-5 gap-3">
            {questions.map((question, questionIndex) => (
              <button
                key={question.id}
                onClick={() => setIndex(questionIndex)}
                className={`h-10 rounded-full border text-sm font-semibold ${questionClass(question, questionIndex)}`}
              >
                {questionIndex + 1}
              </button>
            ))}
          </div>
          <div className="mt-8 space-y-4 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-slate-200" /> Belum Dijawab
            </div>
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-yellow-400" /> Sedang Dikerjakan
            </div>
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-green-500" /> Sudah Dijawab
            </div>
          </div>
        </aside>

        <section className="card flex min-h-[620px] flex-col p-7">
          <p className="text-sm text-slate-500">
            Soal {index + 1} dari {questions.length}
          </p>
          <div className="mt-8 flex-1">
            <p className="text-base leading-8 text-slate-950">{current.content}</p>
            <div className="mt-8 space-y-4">
              {current.options.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-4 rounded-md border border-transparent p-3 transition hover:border-blue-100 hover:bg-blue-50"
                >
                  <input
                    type="radio"
                    name={current.id}
                    checked={answers[current.id] === option.id}
                    onChange={() => setAnswers({ ...answers, [current.id]: option.id })}
                    className="h-4 w-4"
                  />
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs font-bold">
                    {option.label}
                  </span>
                  <span className="text-sm text-slate-700">{option.content}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              className="btn-secondary"
              onClick={() => setFlagged({ ...flagged, [current.id]: !flagged[current.id] })}
            >
              Ragu-ragu
            </button>
            <div className="flex gap-3">
              <button
                className="btn-secondary min-w-36"
                disabled={index === 0}
                onClick={() => setIndex(Math.max(0, index - 1))}
              >
                Sebelumnya
              </button>
              <button
                className="btn-primary min-w-36"
                disabled={submitting}
                onClick={() => (index < questions.length - 1 ? setIndex(index + 1) : submitExam())}
              >
                {index < questions.length - 1 ? 'Selanjutnya' : 'Selesai'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
