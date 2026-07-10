# Projek Belajar API

Projek Belajar API adalah sebuah aplikasi backend (RESTful API) yang dirancang untuk manajemen pengguna, meliputi otentikasi (Register, Login, Get Current User, Logout) serta operasi dasar CRUD (Create, Read, Update, Delete) untuk pengguna. Aplikasi ini dibuat sebagai proyek pembelajaran modern backend web development.

---

## 🏗️ Arsitektur & Struktur Folder

Aplikasi ini menggunakan pola arsitektur berbasis fitur yang memisahkan antara _routes_ (pengendali endpoint), _services_ (logika bisnis), dan _db_ (konfigurasi & skema database).

```text
projek-belajar/
├── src/
│   ├── index.ts              # Entry point aplikasi (Inisialisasi Elysia & Swagger)
│   ├── db/                   # Konfigurasi Database & ORM
│   │   ├── index.ts          # Koneksi database (mysql2 pool)
│   │   ├── schema/           # Definisi skema tabel Drizzle ORM
│   │   └── reset-db.ts       # Script utilitas untuk reset/truncate database
│   ├── routes/               # Definisi API Endpoints
│   │   ├── user-routes.ts    # Endpoint untuk otentikasi (Auth API)
│   │   └── users.ts          # Endpoint untuk CRUD umum user
│   └── services/             # Logika Bisnis (Business Logic)
│       └── user-services.ts  # Fungsi spesifik auth seperti hash password & generate token
├── test/                     # Kumpulan file Unit Test
│   ├── user-routes.test.ts   # Unit test untuk API Otentikasi
│   └── users.test.ts         # Unit test untuk API CRUD
├── drizzle/                  # Hasil generate migrasi Drizzle ORM
├── .env.example              # Contoh environment variables
├── package.json              # Daftar dependencies & scripts
├── bun.lock                  # Lockfile versi dependencies Bun
└── tsconfig.json             # Konfigurasi TypeScript
```

---

## 🛠️ Technology Stack & Libraries

Projek ini dibangun menggunakan teknologi modern yang sangat cepat dan efisien:

- **Runtime**: [Bun](https://bun.sh/) (Runtime JavaScript/TypeScript yang sangat cepat, all-in-one bundler, transpiler, task runner, & npm client)
- **Web Framework**: [ElysiaJS](https://elysiajs.com/) (Web framework ergonomis dengan performa sangat tinggi untuk Bun)
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/) (ORM TypeScript modern dan aman)
- **Database**: MySQL (Database relasional)
- **Testing**: Bun Test (Test runner bawaan dari Bun)

### Library Utama:
- `drizzle-orm` & `mysql2`: Untuk interaksi dengan database MySQL.
- `bcrypt`: Untuk enkripsi dan *hashing* password pengguna.
- `@elysiajs/swagger`: Untuk otomatis menghasilkan dokumentasi API Swagger UI.

---

## 🗄️ Database Schema

Aplikasi ini memiliki 2 tabel utama di database:

1. **`users`**
   - `id` (INT, Primary Key, Auto Increment)
   - `name` (VARCHAR 255, Not Null)
   - `email` (VARCHAR 255, Not Null, Unique)
   - `password` (VARCHAR 255, Not Null) - *Tersimpan dalam format Hashed*
   - `createdAt` (TIMESTAMP, Default Current Time)

2. **`session`**
   - `id` (INT, Primary Key, Auto Increment)
   - `token` (VARCHAR 255, Not Null) - *UUID untuk session/token Bearer*
   - `userId` (BIGINT, Foreign Key -> `users.id`, Not Null)
   - `createdAt` (TIMESTAMP, Default Current Time)

---

## 🚀 Daftar API yang Tersedia

Dokumentasi Swagger API UI juga dapat diakses langsung setelah aplikasi berjalan di: `http://localhost:<PORT>/swagger`

### 1. API Otentikasi (Prefix: `/api/users`)
Endpoint ini digunakan untuk alur otentikasi (register, login, dan validasi sesi).

- `POST /api/users`
  - **Fungsi:** Mendaftarkan pengguna baru (Register).
  - **Body:** `name`, `email`, `password`
- `POST /api/users/login`
  - **Fungsi:** Masuk (Login) dan mendapatkan token UUID (Session).
  - **Body:** `email`, `password`
- `GET /api/users/current`
  - **Fungsi:** Mengambil data profil user yang sedang login.
  - **Header:** Wajib menyertakan `Authorization: Bearer <TOKEN>`
- `DELETE /api/users/logout`
  - **Fungsi:** Menghapus sesi / Logout.
  - **Header:** Wajib menyertakan `Authorization: Bearer <TOKEN>`

### 2. API CRUD Pengguna Umum (Prefix: `/users`)
Endpoint ini digunakan untuk operasi administrasi/dasar terhadap data pengguna.

- `GET /users`
  - **Fungsi:** Mendapatkan daftar semua pengguna.
- `POST /users`
  - **Fungsi:** Membuat pengguna baru (Admin level).
  - **Body:** `name`, `email`, `password`
- `GET /users/:id`
  - **Fungsi:** Mendapatkan detail spesifik pengguna berdasarkan ID.
- `PUT /users/:id`
  - **Fungsi:** Memperbarui data pengguna berdasarkan ID.
  - **Body:** `name` (opsional), `email` (opsional)
- `DELETE /users/:id`
  - **Fungsi:** Menghapus data pengguna secara permanen berdasarkan ID.

---

## 💻 Panduan Setup & Menjalankan Project

### 1. Persiapan Environment
Pastikan Anda sudah menginstall [Bun](https://bun.sh/) dan MySQL server di sistem Anda.
Duplikat file `.env.example` menjadi `.env` dan atur variabelnya sesuai environment lokal Anda.
```bash
cp .env.example .env
```
Isi file `.env`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/projek_belajar"
PORT=3000
```
*(Pastikan Anda membuat database bernama `projek_belajar` di MySQL server Anda terlebih dahulu).*

### 2. Install Dependencies
```bash
bun install
```

### 3. Migrasi Database (Drizzle ORM)
Jalankan perintah berikut untuk meng-generate file migrasi dan mendorong skema ke database:
```bash
bun run db:generate
bun run db:migrate
```

*(Opsional: Gunakan `bun run db:studio` untuk membuka GUI Database Studio Drizzle di browser)*.

### 4. Menjalankan Aplikasi
Untuk environment development (dengan hot-reload):
```bash
bun run dev
```
Aplikasi akan berjalan di port yang Anda set di `.env` (default: 3000).

Untuk environment production:
```bash
bun start
```

### 5. Menjalankan Unit Test
Project ini dilengkapi dengan *Automated Unit Testing* yang komprehensif untuk memastikan seluruh API berjalan dengan benar. 
Database akan secara otomatis di-*reset* pada setiap skenario *test* untuk menjaga konsistensi.

Jalankan perintah berikut untuk menjalankan *test*:
```bash
bun test
```
*Note: Pastikan Database Test sudah disiapkan (atau database development boleh digunakan karena test akan me-reset tabel `users` dan `session`).*
