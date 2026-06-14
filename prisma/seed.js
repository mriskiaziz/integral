const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const packages = [
  {
    title: 'Paket Tryout SD',
    slug: 'tryout-sd',
    level: 'SD',
    description: 'Latihan matematika dasar untuk siswa SD',
    price: 25000,
    durationMinutes: 60,
    code: 'INTEG-SD',
    questions: [
      ['Hasil dari 125 + 275 adalah ...', ['300', '350', '400', '450'], 'C'],
      ['Jika 8 x 7 = ..., maka jawabannya adalah ...', ['54', '56', '58', '64'], 'B'],
      ['Pecahan 1/2 sama nilainya dengan ...', ['0,25', '0,5', '1,5', '2'], 'B'],
      ['Sebuah persegi memiliki sisi 6 cm. Luasnya adalah ...', ['12 cm2', '24 cm2', '36 cm2', '42 cm2'], 'C'],
      ['Bilangan ganjil berikut adalah ...', ['24', '31', '48', '60'], 'B'],
    ],
  },
  {
    title: 'Paket Tryout SMP',
    slug: 'tryout-smp',
    level: 'SMP',
    description: 'Tryout aljabar, geometri, dan peluang tingkat SMP',
    price: 35000,
    durationMinutes: 90,
    code: 'INTEG-SMP',
    questions: [
      ['Jika 2x + 3 = 11, maka nilai x adalah ...', ['2', '3', '4', '5'], 'C'],
      ['Gradien garis y = 3x - 7 adalah ...', ['-7', '3', '7', '10'], 'B'],
      ['Luas segitiga dengan alas 10 cm dan tinggi 8 cm adalah ...', ['18 cm2', '40 cm2', '80 cm2', '160 cm2'], 'B'],
      ['Hasil dari (x + 2)(x - 2) adalah ...', ['x2 - 4', 'x2 + 4', '2x - 4', 'x2 - 2'], 'A'],
      ['Peluang muncul angka genap pada dadu adalah ...', ['1/6', '1/3', '1/2', '2/3'], 'C'],
    ],
  },
  {
    title: 'Paket Tryout SMA',
    slug: 'tryout-sma',
    level: 'SMA',
    description: 'Simulasi matematika lanjutan untuk persiapan ujian SMA',
    price: 45000,
    durationMinutes: 120,
    code: 'INTEG-SMA',
    questions: [
      ['Turunan dari f(x) = x^2 + 3x adalah ...', ['2x + 3', 'x + 3', '2x - 3', 'x^3 + 3'], 'A'],
      ['Nilai dari log 100 (basis 10) adalah ...', ['1', '2', '10', '100'], 'B'],
      ['Jika sin A = 1/2 dan A lancip, maka A = ...', ['30 derajat', '45 derajat', '60 derajat', '90 derajat'], 'A'],
      ['Akar-akar persamaan x^2 - 5x + 6 = 0 adalah ...', ['1 dan 6', '2 dan 3', '-2 dan -3', '3 dan 6'], 'B'],
      ['Integral dari 2x dx adalah ...', ['x + C', 'x^2 + C', '2x^2 + C', '1/2x^2 + C'], 'B'],
    ],
  },
];

async function createPackage(adminId, data) {
  const pkg = await prisma.examPackage.create({
    data: {
      title: data.title,
      slug: data.slug,
      level: data.level,
      description: data.description,
      price: data.price,
      durationMinutes: data.durationMinutes,
      creatorId: adminId,
      accessCodes: {
        create: {
          code: data.code,
          name: `${data.title} Gelombang 1`,
          durationMinutes: data.durationMinutes,
          maxAttempts: 1,
          maxUsers: 100,
          isActive: true,
        },
      },
      questions: {
        create: data.questions.map(([content, options, correct], index) => ({
          content,
          order: index + 1,
          score: 1,
          options: {
            create: options.map((content, optionIndex) => {
              const label = String.fromCharCode(65 + optionIndex);
              return {
                label,
                content,
                order: optionIndex + 1,
                isCorrect: label === correct,
              };
            }),
          },
        })),
      },
    },
  });

  return pkg;
}

async function main() {
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Integral',
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Peserta Demo',
      username: 'peserta',
      password: await bcrypt.hash('peserta123', 10),
      role: 'PESERTA',
    },
  });

  for (const item of packages) {
    await createPackage(admin.id, item);
  }
}

main()
  .then(async () => {
    console.log('Seed Integral selesai. Login admin/admin123 atau peserta/peserta123.');
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
