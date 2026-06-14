# Simulasi Ujian - Next.js Prisma Tailwind Flowbite

Aplikasi simulasi ujian untuk TOEFL, CPNS, UTBK, dan ujian lain.

## Fitur

- Admin dashboard
- CRUD jenis ujian
- CRUD paket ujian
- Section/kategori soal
- Tambah soal pilihan ganda dengan teks, rumus, URL gambar/audio
- Token ujian dengan durasi
- Peserta login sederhana dan memasukkan token
- Pengerjaan ujian dengan timer
- Submit jawaban dan hitung nilai otomatis
- Hasil ujian admin dan peserta

## Cara menjalankan

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Buka:

```txt
http://localhost:3000
```

## Akun demo

Admin:

```txt
username: admin
password: admin123
```

Peserta:

```txt
username: peserta
password: peserta123
```

Token demo:

```txt
TOEFL-A1
```

## Catatan

File upload belum disambungkan ke storage. Untuk demo, media soal dan pilihan jawaban memakai URL. Nanti bisa disambungkan ke Cloudinary, Firebase Storage, Supabase Storage, atau local upload.
