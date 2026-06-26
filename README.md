# Marko – Hidup Sehat untuk Mahasiswa

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)

**Marko** adalah aplikasi manajemen gaya hidup sehat yang dirancang khusus untuk mahasiswa. Aplikasi ini membantu mahasiswa melacak kalori harian, merencanakan menu makanan mingguan, mengeksplorasi resep sehat (lokal dan internasional), mencatat aktivitas fisik, serta mengelola resep buatan sendiri. Seluruh data disimpan secara lokal menggunakan `localStorage`, sehingga dapat diakses secara cepat dan aman di browser tanpa memerlukan server backend tambahan.

---

## 🚀 Fitur Utama

1. **Dashboard & Ringkasan Harian (Home)**
   - Visualisasi target dan pencapaian nutrisi harian (kalori, karbohidrat, protein, lemak, dan air).
   - Ringkasan aktivitas pembakaran kalori harian.
   - Shortcut akses cepat untuk menambah resep, mencatat asupan, dan melihat jadwal makanan.

2. **Katalog Resep Sehat (Recipes)**
   - Integrasi resep lokal khas Indonesia (Nasi Uduk, Gado-Gado, Bubur Ayam, dll) yang hemat dan bergizi.
   - Integrasi API publik dari **TheMealDB** untuk mengeksplorasi ribuan variasi hidangan global.
   - Filter resep berdasarkan kategori dan asal daerah, serta pencarian instan.

3. **Resep Saya / Custom Recipe Builder (My Recipes)**
   - Modul CRUD lengkap yang memungkinkan pengguna membuat resep kustom sendiri.
   - Fitur penghitungan estimasi kalori dan makronutrisi per porsi resep.
   - Unggah resep dengan label tingkat kesulitan, waktu memasak, tag diet, bahan-bahan, dan langkah pembuatan.

4. **Pencatat Kalori & Nutrisi (Nutrition Tracker)**
   - Catat asupan makanan berdasarkan waktu makan (Sarapan, Makan Siang, Makan Malam, Camilan).
   - Catat konsumsi air harian (gelas/ml) dengan target harian yang terintegrasi.
   - Pengurangan otomatis sisa kebutuhan kalori berdasarkan porsi makanan yang dikonsumsi.

5. **Perencana Makanan Mingguan (Meal Planner)**
   - Jadwalkan menu makanan harian selama satu minggu penuh (Senin sampai Minggu).
   - Tambahkan hidangan langsung dari katalog resep atau resep kustom ke jadwal makan.
   - Sinkronisasi otomatis rencana makan ke total asupan harian dengan satu klik.

6. **Rekomendasi & Jurnal Olahraga (Exercise Tracker)**
   - Rekomendasi aktivitas fisik sederhana yang cocok untuk mahasiswa (jalan kaki, lari, bersepeda, senam, dll).
   - Catat durasi olahraga untuk menghitung estimasi kalori yang terbakar secara dinamis.
   - Mengurangi beban kalori masuk di dashboard harian.

7. **Profil Kesehatan & Autentikasi Kustom (Profile & Auth)**
   - Sistem registrasi dan login multi-akun lokal yang aman.
   - Personalisasi profil kesehatan: berat badan, tinggi badan, usia, jenis kelamin, tingkat aktivitas fisik, dan target berat badan.
   - Kalkulasi otomatis target kalori harian ideal berdasarkan parameter profil pengguna.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend Core:** React 19 & JavaScript (ES6+)
- **Build Tool:** Vite
- **Routing:** React Router DOM (v7)
- **Styling:** Tailwind CSS (v3) & PostCSS
- **State & Data Persistence:** React Context API & `localStorage`
- **External API:** [TheMealDB API](https://www.themealdb.com/ ) (Tanpa API Key, gratis)

---

## 📁 Struktur Folder Proyek

Struktur direktori dirancang dengan pendekatan modular berbasis komponen dan pemisahan tanggung jawab (*separation of concerns*) yang jelas:

```
marko/
├── public/                 # Aset statis publik
├── src/
│   ├── assets/             # Aset aplikasi (logo, ikon, gambar statis)
│   ├── components/         # Komponen UI modular
│   │   ├── common/         # Komponen umum yang reusable (Button, Input, Card, dll)
│   │   ├── exercise/       # Komponen visual pembantu fitur olahraga
│   │   ├── layout/         # Layout aplikasi (RootLayout, Navbar, Sidebar, Footer)
│   │   ├── meal-planner/   # Komponen khusus pengelolaan jadwal makan
│   │   ├── recipe/         # Komponen kartu resep, filter, dan ulasan
│   │   └── tracker/        # Komponen pelacak asupan gizi dan kalori harian
│   ├── constants/          # Variabel konstanta global (gizi, rute, konfigurasi)
│   │   ├── config.js       # Konfigurasi teks dan pilihan dropdown global
│   │   ├── nutrition.js    # Konstanta default kebutuhan gizi harian
│   │   └── routes.js       # Daftar pemetaan rute aplikasi
│   ├── context/            # Global State Context (Autentikasi & Sesi Pengguna)
│   │   └── AuthContext.jsx # Mengatur login, register, dan enkapsulasi localStorage
│   ├── data/               # File database lokal untuk mock data
│   │   └── indonesianRecipes.js # Data statis resep lokal nusantara
│   ├── hooks/              # Custom React Hooks untuk isolasi logika bisnis
│   │   ├── useAuth.js      # Hook akses cepat ke session & auth
│   │   ├── useExercise.js  # Hook untuk menambah/menghapus jurnal olahraga
│   │   ├── useFavorites.js # Hook untuk memanipulasi daftar bookmark resep
│   │   ├── useMealPlanner.js # Hook untuk mengatur dan memicu meal planner mingguan
│   │   ├── useTracker.js   # Hook untuk manipulasi log nutrisi harian
│   │   └── useUserRecipes.js # Hook CRUD resep kustom buatan pengguna
│   ├── pages/              # Halaman-halaman utama (Views)
│   │   ├── Auth/           # Halaman Login dan Register
│   │   ├── Exercise/       # Halaman Rekomendasi & Catatan Olahraga
│   │   ├── Favorites/      # Halaman Daftar Resep Favorit Pengguna
│   │   ├── Home/           # Halaman Dashboard Ringkasan Harian
│   │   ├── MealPlanner/    # Halaman Perencana Makanan Mingguan
│   │   ├── MyRecipes/      # Halaman Resep Saya (CRUD Form & List)
│   │   ├── NotFound/       # Halaman Error 404
│   │   ├── Profile/        # Halaman Pengaturan Akun & Profil Kesehatan
│   │   ├── Recipes/        # Halaman Katalog Resep (MealDB & Lokal)
│   │   └── Tracker/        # Halaman Pelacak Kalori dan Nutrisi
│   ├── router/             # Konfigurasi rute navigasi
│   │   ├── ProtectedRoute.jsx # Guard pelindung halaman agar wajib login
│   │   └── index.jsx       # Peta rute lengkap menggunakan createBrowserRouter
│   ├── services/           # Lapisan pemanggilan API / Akses data luar
│   │   ├── localRecipes/   # Layanan pemrosesan resep lokal
│   │   └── mealdb/         # Integrasi API TheMealDB
│   ├── utils/              # Fungsi-fungsi pembantu global (formatting, date-helper)
│   ├── App.jsx             # Komponen root aplikasi
│   ├── index.css           # Konfigurasi Tailwind CSS global
│   └── main.jsx            # Titik awal eksekusi aplikasi React
├── .gitignore              # Daftar file yang diabaikan oleh Git
├── .env.example            # Berkas contoh konfigurasi environment variables
├── index.html              # Template HTML dasar
├── package.json            # Daftar dependensi dan modul npm
├── postcss.config.js       # Konfigurasi PostCSS untuk pemrosesan Tailwind
├── tailwind.config.js      # Konfigurasi kustomisasi Tailwind CSS
└── vite.config.js          # Konfigurasi bundler Vite
```

---

## 💻 Panduan Menjalankan Proyek Secara Lokal

Ikuti langkah-langkah di bawah ini untuk memasang dan menjalankan proyek Marko di komputer Anda:

### 1. Prasyarat (Prerequisites)
Pastikan komputer Anda sudah terpasang:
- **Node.js** (Rekomendasi versi LTS 18.x atau yang lebih baru)
- **NPM** (Bawaan dari instalasi Node.js) atau **Yarn**

### 2. Kloning Repositori
Kloning repositori ini ke penyimpanan lokal Anda menggunakan Git:
```bash
git clone https://github.com/meikacandra/Marko-.git
cd Marko-
```

### 3. Pasang Dependensi
Pasang semua pustaka/library yang dibutuhkan proyek dengan menjalankan perintah berikut di terminal:
```bash
npm install
```

### 4. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env` di direktori utama:
```bash
cp .env.example .env
```
*(Catatan: Aplikasi ini secara default sudah dapat berjalan sepenuhnya tanpa konfigurasi variabel lingkungan tambahan karena menggunakan LocalStorage dan API publik bebas kunci. Namun, Anda dapat menyesuaikan konfigurasi di file `.env` jika diperlukan).*

### 5. Jalankan Aplikasi dalam Mode Pengembangan
Mulai server lokal pengembangan dengan menjalankan:
```bash
npm run dev
```
Setelah berhasil dijalankan, buka peramban (browser) Anda dan akses alamat yang ditampilkan di terminal (biasanya `http://localhost:5173`).

### 6. Build untuk Produksi
Untuk membangun versi produksi yang siap disebarkan ke hosting (Vercel, Netlify, Github Pages, dll):
```bash
npm run build
```
Hasil build yang terkompresi dan teroptimasi akan berada di folder `dist`. Anda dapat mempratinjau hasil build secara lokal dengan perintah:
```bash
npm run preview
```

---

## 🌐 Link Deployment Aplikasi

Aplikasi Marko telah dideploy secara online dan dapat diakses melalui tautan berikut:
👉 **[Link Deploy Aplikasi Marko](https://marko-health.vercel.app/)** *(Silakan sesuaikan dengan link deploy resmi Anda)*

---

## 🔒 Variabel Lingkungan (Environment Variables)

Aplikasi ini mendukung beberapa variabel lingkungan yang dapat dikonfigurasi melalui file `.env`. Berikut adalah daftarnya:

| Nama Variabel | Status | Deskripsi | Nilai Default |
|---|---|---|---|
| `VITE_APP_NAME` | Opsional | Nama brand aplikasi yang ditampilkan di header | `Marko` |
| `VITE_THEMEALDB_API_URL` | Opsional | Endpoint URL untuk TheMealDB API | `https://www.themealdb.com/api/json/v1/1` |
