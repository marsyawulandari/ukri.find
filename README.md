# UKRI.FIND — Lost & Found Kampus

Website HTML + CSS + Bootstrap 5 + JavaScript (tanpa backend; data disimpan di `localStorage` browser).

## Cara menjalankan
Buka folder ini di VS Code → klik kanan `index.html` → **Open with Live Server**
(atau cukup double-click `index.html`; butuh internet untuk CDN Bootstrap & font).

## Struktur (tiap halaman MANDIRI)
Setiap halaman hanya memuat **1 file CSS + 1 file JS miliknya sendiri** (plus Bootstrap dari CDN).
Tidak ada `global.css` maupun `core.js`.
```
ukrifind/
├── index.html              ← css/index.css            + js/index.js
├── login.html              ← css/login.css            + js/login.js
├── daftar-laporan.html     ← css/daftar-laporan.css   + js/daftar-laporan.js
├── detail-laporan.html     ← css/detail-laporan.css   + js/detail-laporan.js
├── lapor-kehilangan.html   ← css/lapor-kehilangan.css + js/lapor-kehilangan.js   🔒 wajib login
├── lapor-temuan.html       ← css/lapor-temuan.css     + js/lapor-temuan.js       🔒 wajib login
├── dashboard.html          ← css/dashboard.css        + js/dashboard.js          🔒 wajib login
├── tentang.html            ← css/tentang.css          + js/tentang.js
└── kontak.html             ← css/kontak.css           + js/kontak.js
```
Isi tiap file CSS/JS dibagi dua bagian (ada penandanya di komentar):
- **BAGIAN 1 — dasar**: variabel warna, navbar, tombol, footer (CSS) / penyimpanan, Auth, navbar & footer (JS)
- **BAGIAN 2 — khusus halaman**: gaya dan logika yang hanya dipakai halaman itu

> Karena mandiri, bagian dasar ada di setiap file. Jika ingin mengubah warna tema, navbar, atau data akun
> percobaan, ubah di **semua** file terkait (cari teks yang sama, mis. `--primary` atau `ukrifind_users`).

## Akun percobaan
| Username    | NPM        | Kata sandi     |
|-------------|------------|----------------|
| mahasiswa   | 2023010001 | mahasiswa123   |
| alia        | 2023010002 | alia12345      |
| admin       | 0000000000 | admin123       |

Login bisa memakai **username atau NPM**. Akun baru bisa dibuat lewat tab DAFTAR.

## Proteksi halaman
`lapor-kehilangan.html`, `lapor-temuan.html`, dan `dashboard.html` memanggil `Auth.requireLogin()`
(di dalam file JS halamannya, dimuat di `<head>`). Jika belum login, pengguna langsung dialihkan ke `login.html` dengan pesan peringatan,
dan setelah login otomatis kembali ke halaman yang dituju.

## Catatan penting
- Ini proteksi **sisi klien** (cukup untuk tugas/demo). Untuk produksi, autentikasi harus divalidasi di server
  (PHP/Node/Laravel + database) dan password harus di-hash.
- Reset data demo: hapus localStorage lewat DevTools → Application → Local Storage → Clear.
- Ganti data tim di `js/tentang.js` (array `TEAM`) dan email kontak di `kontak.html`.


## Catatan revisi struktur JavaScript

- `js/common.js` berisi fungsi bersama: penyimpanan `localStorage`, data contoh awal, autentikasi, helper, navbar, dan footer.
- File `js/<halaman>.js` sekarang hanya berisi logika khusus halaman tersebut, seperti validasi form, login, penyimpanan laporan, filter, dan menampilkan data yang berubah.
- Setiap halaman HTML memuat `common.js` sebelum skrip halaman masing-masing.
- Bagian tampilan yang bergantung pada data pengguna/laporan tetap perlu dirender oleh JavaScript. Konten statis lainnya tetap berada di HTML.
- Data masih disimpan di `localStorage` browser, bukan database/server. Ini cocok untuk demonstrasi tugas, tetapi bukan autentikasi aman untuk produksi.
