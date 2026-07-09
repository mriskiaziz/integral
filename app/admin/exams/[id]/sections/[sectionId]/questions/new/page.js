import { redirect } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import SubmitButton from '@/components/SubmitButton';
import { apiGet, apiPost } from '@/lib/internalApi';

async function createQuestion(formData) {
  'use server';

  const packageId = String(formData.get('packageId'));
  const correctLabel = String(formData.get('correctLabel') || 'A');

  const question = await apiPost('/api/examquestion', {
    packageId,
    content: String(formData.get('content') || ''),
    explanation: String(formData.get('explanation') || ''),
    score: Number(formData.get('score') || 1),
    order: Number(formData.get('order') || 0),
  });

  await Promise.all(
    ['A', 'B', 'C', 'D', 'E']
      .map((label, index) => ({
        questionId: question.id,
        label,
        content: String(formData.get(`option${label}`) || ''),
        isCorrect: correctLabel === label,
        order: index + 1,
      }))
      .filter((option) => option.content)
      .map((option) => apiPost('/api/answeroption', option)),
  );

  redirect(`/admin/exams/${packageId}`);
}

export default async function NewQuestionPage({ params }) {
  let item;

  try {
    item = await apiGet(`/api/exampackage?id=${params.id}`);
  } catch {
    item = null;
  }

  return (
    <>
      <PageHeader title="Tambah Soal" description={`Paket: ${item?.title || '-'}`} />
      <form action={createQuestion} className="card grid gap-6 p-6 lg:grid-cols-2">
        <input type="hidden" name="packageId" value={params.id} />
        <div className="space-y-4">
          <div>
            <label className="label">Isi Soal</label>
            <textarea
              name="content"
              rows="8"
              className="input"
              placeholder="Tulis pertanyaan matematika di sini"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Skor</label>
              <input type="number" name="score" className="input" defaultValue="1" />
            </div>
            <div>
              <label className="label">Urutan</label>
              <input type="number" name="order" className="input" defaultValue="1" />
            </div>
          </div>
          <div>
            <label className="label">Pembahasan</label>
            <textarea name="explanation" rows="5" className="input" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-black">Pilihan Jawaban</h2>
          {['A', 'B', 'C', 'D', 'E'].map((label) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <b>Pilihan {label}</b>
                <label className="text-sm">
                  <input
                    type="radio"
                    name="correctLabel"
                    value={label}
                    defaultChecked={label === 'A'}
                  />{' '}
                  Jawaban benar
                </label>
              </div>
              <input name={`option${label}`} className="input" placeholder={`Teks jawaban ${label}`} />
            </div>
          ))}
          <SubmitButton className="btn-primary w-full gap-2" pendingText="Menyimpan soal...">
            Simpan Soal
          </SubmitButton>
        </div>
      </form>
    </>
  );
}
