# Panduan Lengkap Deploy: TOEFL QUIZ BATTLE (Vercel + Supabase)

Dokumen ini memandu langkah demi langkah untuk melakukan deploy aplikasi **TOEFL QUIZ BATTLE** ke **Vercel** dengan database & storage di **Supabase**.

---

## 1. Persiapan Supabase

1. **Buat Proyek Baru di Supabase**:
   - Buka [https://supabase.com](https://supabase.com) dan buat akun/login.
   - Klik **New Project**, tentukan nama (contoh: `toefl-quiz-battle`), password database, dan pilih Region terdekat (contoh: `Singapore - ap-southeast-1`).

2. **Eksekusi Schema SQL**:
   - Masuk ke dashboard Supabase -> menu **SQL Editor**.
   - Buka file `supabase/schema.sql` dari repositori ini, salin seluruh kodenya, lalu klik **Run**.
   - Skrip ini akan membuat tabel: `profiles`, `quizzes`, `questions`, `rooms`, `participants`, `answers`, serta Row Level Security (RLS) dan Realtime publication.

3. **Inisialisasi Data Soal (Seed)**:
   - Di SQL Editor, buat query baru dan salin isi file `supabase/seed.sql`.
   - Klik **Run** untuk memasukkan 15 bank soal resmi TOEFL (5 Listening, 5 Structure, 5 Reading) dan kuis diagnostik perdana.

4. **Konfigurasi Storage untuk Audio**:
   - Masuk ke **Storage** -> klik **New Bucket** dengan nama `toefl-audio` (aktifkan toggle **Public**).
   - Jalankan query dari `supabase/storage_setup.sql` untuk mengaktifkan izin upload admin.

5. **Ambil Kredensial API**:
   - Masuk ke **Project Settings** -> **API**.
   - Catat:
     - `Project URL`
     - `anon / public key`
     - `service_role key` (rahasia, hanya untuk server)

6. **Buat Akun Admin Pertama**:
   - Masuk ke **Authentication** -> **Users** -> **Add user**.
   - Masukkan email admin (contoh: `admin@toeflquiz.edu`) dan password yang aman.
   - Di SQL Editor, beri hak akses admin:
     ```sql
     UPDATE public.profiles 
     SET role = 'admin' 
     WHERE email = 'admin@toeflquiz.edu';
     ```

---

## 2. Deploy ke Vercel

1. **Push Proyek ke GitHub**:
   - Inisialisasi git dan push source code ke repository privat/publik di GitHub.

2. **Import ke Vercel**:
   - Buka [https://vercel.com](https://vercel.com) -> klik **Add New Project**.
   - Pilih repository GitHub Anda.

3. **Konfigurasi Environment Variables di Vercel**:
   Di tab **Environment Variables**, tambahkan variabel berikut:
   ```env
   ADMIN_SECRET_KEY=toefl2026admin
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   APP_URL=https://your-subdomain.vercel.app
   ```

4. **Build & Output Settings**:
   - Framework Preset: **Vite** (atau **Next.js** bila dipindahkan ke struktur app router).
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Deploy**:
   - Klik tombol **Deploy**. Tunggu proses build selesai (~1-2 menit).
   - Akses URL deployment yang dihasilkan oleh Vercel.

---

## 3. Verifikasi Fitur Produksi

1. **Login Admin**: Buka `/` lalu klik tombol **Admin Login** di navigasi kanan atas.
   Gunakan passcode default `toefl2026admin` atau email admin yang telah disiapkan.
2. **Unggah Audio Listening**: Di editor soal, perhatikan bahwa 5 soal Listening memiliki status "Audio belum diunggah". Unggah rekaman dialog MP3/WAV atau gunakan tombol **Hasilkan Audio Dialog (TTS)**.
3. **Publikasi Quiz**: Setelah seluruh soal listening memiliki audio, klik **Publish Quiz**.
4. **Mulai Room Battle**: Buat Room Live PIN 6-digit. Bagikan PIN atau link ke peserta siswa.
5. **Mode Siswa**: Siswa bergabung dari HP/laptop, menjawab dengan timer 30 detik server-side.
6. **Leaderboard & Pembahasan**: Lihat podium juara real-time dan buka pembahasan dwibahasa (Indonesia & Inggris).
