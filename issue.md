# Project Setup: Bun + ElysiaJS + Drizzle + MySQL

## Overview

Buat REST API backend menggunakan stack berikut:

- **Runtime**: Bun
- **Framework**: ElysiaJS
- **ORM**: Drizzle ORM
- **Database**: MySQL

---

## 1. Inisialisasi Project

- Jalankan `bun init` di folder ini untuk membuat project baru.
- Pastikan entry point di-set ke `src/index.ts`.
- Install semua dependency yang dibutuhkan menggunakan `bun add`.

**Dependencies:**
- `elysia`
- `drizzle-orm`
- `mysql2`

**Dev Dependencies:**
- `drizzle-kit`
- `@types/bun`

---

## 2. Struktur Folder

Gunakan struktur berikut sebagai panduan:

```
/
├── src/
│   ├── index.ts          # Entry point, setup Elysia app
│   ├── db/
│   │   ├── index.ts      # Koneksi database (drizzle + mysql2)
│   │   └── schema/       # Definisi tabel Drizzle (schema per entitas)
│   ├── routes/           # Definisi route per fitur/modul
│   └── services/         # Business logic (opsional, pisahkan dari route)
├── drizzle/              # Output migrasi dari drizzle-kit
├── drizzle.config.ts     # Konfigurasi drizzle-kit
└── .env                  # Variabel environment (DB credentials, port, dll)
```

---

## 3. Setup Database

- Buat file koneksi di `src/db/index.ts` yang menggunakan `drizzle()` dengan driver `mysql2`.
- Baca kredensial dari `.env` (host, port, user, password, database name).
- Buat schema awal untuk setidaknya satu tabel contoh (misal: `users`).

---

## 4. Konfigurasi Drizzle Kit

- Buat file `drizzle.config.ts` yang mengarah ke folder schema dan output migrasi.
- Tambahkan script di `package.json`:
  - `db:generate` - untuk generate migrasi
  - `db:migrate` - untuk menjalankan migrasi ke database
  - `db:studio` - untuk membuka Drizzle Studio (opsional)

---

## 5. Setup ElysiaJS

- Di `src/index.ts`, buat instance Elysia dan jalankan server.
- Gunakan `.group()` atau plugin untuk memisahkan route per modul.
- Tambahkan plugin bawaan yang relevan jika dibutuhkan, seperti:
  - `@elysiajs/swagger` untuk dokumentasi API otomatis (opsional tapi dianjurkan)

---

## 6. Contoh Route

Buat minimal satu contoh CRUD route (misal untuk `users`) yang:

- `GET /users` - ambil semua data
- `POST /users` - tambah data baru
- `GET /users/:id` - ambil satu data
- `PUT /users/:id` - update data
- `DELETE /users/:id` - hapus data

Gunakan Drizzle ORM untuk query, bukan raw SQL.

---

## 7. Environment & Konfigurasi

- Buat file `.env` untuk menyimpan konfigurasi sensitif.
- Buat juga `.env.example` sebagai template tanpa nilai asli.
- Gunakan `Bun.env` untuk membaca environment variable.

---

## 8. Development Script

Tambahkan script berikut di `package.json`:

- `dev` - jalankan server dengan hot reload (`bun --watch src/index.ts`)
- `start` - jalankan server production (`bun src/index.ts`)

---

## Catatan

- Tidak perlu authentication atau fitur lanjutan di tahap awal.
- Fokus pada setup yang bersih dan bisa dikembangkan.
- Pastikan project bisa dijalankan dengan `bun dev` setelah setup selesai.
