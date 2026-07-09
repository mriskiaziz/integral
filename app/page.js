import Link from 'next/link';
import {
  BookOpen,
  Check,
  CircleHelp,
  Clock3,
  ClipboardCheck,
  GraduationCap,
  ShieldCheck,
  Users,
} from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { apiGet } from '@/lib/internalApi';
import { formatCurrency } from '@/lib/utils';

export default async function Home() {
  const [packageItems, questions] = await Promise.all([
    apiGet('/api/exampackage?isActive=true'),
    apiGet('/api/examquestion'),
  ]);
  const questionCounts = questions.reduce((counts, question) => {
    counts.set(question.packageId, (counts.get(question.packageId) || 0) + 1);
    return counts;
  }, new Map());
  const packages = packageItems.sort((a, b) => a.price - b.price);

  return (
    <main className="shell">
      <PublicHeader />

      <section className="public-frame grid min-h-[430px] items-center gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <h1 className="max-w-xl text-4xl font-black leading-tight text-slate-950 md:text-5xl">
            Bimbel <span className="text-red-600">Integral</span>
            <br />
            Matematika Pasti Bisa!
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-slate-600">
            Platform ujian online Integral untuk membantu siswa belajar,
            berlatih, dan mengukur kemampuan matematika dengan hasil instan.
          </p>
          <Link href="#paket" className="btn-primary mt-7">
            Lihat Paket Ujian
          </Link>
        </div>

        <div className="hero-visual hidden md:block" aria-hidden="true">
          <div className="cap" />
          <div className="monitor">
            <div className="check-list">
              <span />
            </div>
          </div>
          <div className="stand" />
          <div className="books" />
          <div className="pencil" />
          <div className="clock" />
        </div>
      </section>

      <section id="tentang" className="public-frame py-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="text-sm font-bold uppercase tracking-wide text-blue-600">
              Tentang Kami
            </span>
            <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950">
              Membantu siswa berlatih matematika dengan simulasi ujian yang rapi
              dan mudah diakses.
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              Bimbel Integral menyediakan platform ujian online untuk mendukung
              proses belajar siswa. Setiap paket dirancang agar siswa bisa
              memahami pola soal, melatih manajemen waktu, dan melihat hasil
              pengerjaan secara langsung.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              ['Ujian Online', 'Kerjakan ujian dari perangkat apa pun dengan alur yang sederhana.', Clock3],
              ['Paket Terarah', 'Pilih paket latihan sesuai jenjang dan kebutuhan belajar.', BookOpen],
              ['Hasil Instan', 'Lihat skor setelah ujian selesai untuk evaluasi lebih cepat.', ClipboardCheck],
              ['Pendampingan', 'Gunakan hasil ujian sebagai bahan diskusi dengan admin atau guru.', Users],
            ].map(([title, text, Icon]) => (
              <article key={title} className="card flex gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="paket" className="public-frame py-14">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-950">Paket Ujian</h2>
          <p className="mt-3 text-sm text-slate-600">
            Pilih paket ujian yang sesuai dengan kebutuhanmu.
          </p>
        </div>

        <div className="mt-9 grid gap-6 md:grid-cols-3">
          {packages.map((item) => (
            <article key={item.id} className="card flex flex-col p-7 text-center">
              <h3 className="text-xl font-black">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              <div className="mt-5 text-2xl font-black text-blue-600">
                {formatCurrency(item.price)}
              </div>
              <div className="mt-7 space-y-4 text-left text-sm text-slate-700">
                {[
                  `${questionCounts.get(item.id) || 0} Soal Pilihan Ganda`,
                  `${item.durationMinutes} Menit`,
                  'Hasil Instan',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <Check size={17} className="text-blue-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/login" className="btn-primary mt-8 w-full">
                Pilih Paket
              </Link>
            </article>
          ))}
        </div>

      </section>

      <section id="bantuan" className="public-frame pb-14">
        <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <span className="text-sm font-bold uppercase tracking-wide text-blue-600">
              Bantuan
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-950">
              Siap mengikuti ujian?
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Login terlebih dahulu, lalu masukkan kode ujian yang diberikan oleh
              admin atau guru. Pastikan kode, koneksi internet, dan waktu ujian
              sudah sesuai sebelum mulai mengerjakan.
            </p>
            <Link href="/login" className="btn-primary mt-6">
              Mulai Ujian
            </Link>
          </div>

          <div className="grid gap-4">
            {[
              [
                'Bagaimana cara mulai ujian?',
                'Masuk ke akun siswa, pilih mulai ujian, lalu masukkan kode yang diberikan oleh admin atau guru.',
                GraduationCap,
              ],
              [
                'Apa yang harus dilakukan jika kode tidak valid?',
                'Periksa kembali penulisan kode. Jika masih gagal, hubungi pengelola kelas untuk memastikan kode aktif dan kuota masih tersedia.',
                CircleHelp,
              ],
              [
                'Kapan hasil ujian bisa dilihat?',
                'Hasil ditampilkan setelah ujian dikirim sehingga siswa bisa langsung mengevaluasi skor dan pengerjaan.',
                ShieldCheck,
              ],
            ].map(([title, text, Icon]) => (
              <article key={title} className="card flex gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
