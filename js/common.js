/* =========================================================
   common.js
   Fungsi yang dipakai bersama oleh seluruh halaman UKRI.FIND.
   Logika khusus setiap halaman tetap berada di file JS masing-masing.
   ========================================================= */
/* ===== common.js — fungsi bersama seluruh halaman =====
   Bagian 1: kode dasar (penyimpanan, login/Auth, navbar & footer)
   Fungsi bersama: penyimpanan, autentikasi, data awal, navbar, dan footer ===== */
'use strict';

/* ################ BAGIAN 1 — KODE DASAR ################ */

/* ---------- Storage ---------- */
const KEY = {
  users: 'ukrifind_users',
  reports: 'ukrifind_reports',
  session: 'ukrifind_session',
  messages: 'ukrifind_messages',
  seeded: 'ukrifind_seeded_v1'
};

const DB = {
  get(k, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(k));
      return v === null || v === undefined ? fallback : v;
    } catch (e) { return fallback; }
  },
  set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { return false; } // mis. kuota penuh
  }
};

const CATEGORIES = ['Elektronik', 'Aksesoris', 'Tas & Dompet', 'Alat Tulis', 'Pakaian', 'Kunci', 'Dokumen/Kartu', 'Lainnya'];
const CATEGORY_ICON = {
  'Elektronik': 'bi-phone', 'Aksesoris': 'bi-headphones', 'Tas & Dompet': 'bi-wallet2',
  'Alat Tulis': 'bi-pencil', 'Pakaian': 'bi-bag', 'Kunci': 'bi-key', 'Dokumen/Kartu': 'bi-card-heading', 'Lainnya': 'bi-box-seam'
};
const ADMIN_WA = '6283109753395';

/* ---------- Helpers ---------- */
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function fmtDate(iso) {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`;
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function normalizeWA(n) {
  let d = String(n || '').replace(/\D/g, '');
  if (d.startsWith('0')) d = '62' + d.slice(1);
  return d;
}
function waLink(number, text) {
  return `https://wa.me/${normalizeWA(number)}?text=${encodeURIComponent(text || '')}`;
}
function showToast(message, type = 'success') {
  let box = document.getElementById('toast-box');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toast-box';
    box.className = 'toast-container position-fixed top-0 end-0 p-3';
    box.style.zIndex = 2000;
    document.body.appendChild(box);
  }
  const el = document.createElement('div');
  el.className = `toast align-items-center text-bg-${type} border-0`;
  el.setAttribute('role', 'alert');
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${esc(message)}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  box.appendChild(el);
  const t = new bootstrap.Toast(el, { delay: 3500 });
  t.show();
  el.addEventListener('hidden.bs.toast', () => el.remove());
}

/* ---------- Data awal (akun & laporan percobaan) ---------- */
function seedData() {
  if (DB.get(KEY.seeded, false)) return;

  const users = [
    { id: 1, nama: 'Mahasiswa Demo', username: 'mahasiswa', npm: '2023010001', prodi: 'Teknik Informatika', email: 'mahasiswa@ukri.ac.id', telp: '081234567890', password: 'mahasiswa123', role: 'user' },
    { id: 2, nama: 'Alia Cintia', username: 'alia', npm: '2023010002', prodi: 'Sistem Informasi', email: 'alia@ukri.ac.id', telp: '081223402277', password: 'alia12345', role: 'user' },
    { id: 3, nama: 'Admin UKRI.FIND', username: 'admin', npm: '0000000000', prodi: '-', email: 'admin@ukri.ac.id', telp: '083109753395', password: 'admin123', role: 'admin' }
  ];

  const R = (id, type, nama, kategori, lokasi, tanggal, deskripsi, extra = {}) => ({
    id, type, nama, kategori, lokasi, tanggal, deskripsi,
    rahasia: '', posisi: '', wa: '081223402277', foto: '',
    pelapor: 'Alia Cintia', userId: 2, status: 'aktif', createdAt: tanggal, ...extra
  });

  const reports = [
    R(1, 'ditemukan', 'Dompet Kulit Hitam', 'Tas & Dompet', 'Masjid Kampus', '2026-11-04',
      'Dompet kulit hitam berisi beberapa kartu dan uang tunai. Nama pemilik disamarkan, sebutkan nama dan NIM saat klaim.',
      { posisi: 'Pos Satpam', rahasia: 'KTP, Kartu ATM, SIM' }),
    R(2, 'ditemukan', 'iPhone', 'Elektronik', 'Lobby PT Inti', '2026-11-02',
      'iPhone promax warna burgundy, ada retak kecil di pojok layar.', { posisi: 'Resepsionis Lobby', rahasia: 'Wallpaper foto kucing' }),
    R(3, 'ditemukan', 'Tumblr', 'Aksesoris', 'Labkom UKRI', '2026-10-02',
      'Tumblr Stanley warna pink, ada tulisan nama "agil" di badan tumblr.', { posisi: 'Lemari Labkom' }),
    R(4, 'ditemukan', 'Totebag', 'Tas & Dompet', 'Selasar PT Inti', '2026-10-30',
      'Totebag warna krem dengan gantungan kunci beruang.', { posisi: 'Pos Satpam' }),
    R(5, 'hilang', 'Laptop ASUS', 'Elektronik', 'Labkom PT Inti', '2026-10-10',
      'Laptop warna silver, stiker kucing di bagian belakang, charger tertinggal.', { pelapor: 'Mahasiswa Demo', userId: 1, wa: '081234567890' }),
    R(6, 'hilang', 'Kunci Motor', 'Kunci', 'Parkiran', '2026-10-20',
      'Kunci motor Honda dengan gantungan karakter kartun.', { pelapor: 'Mahasiswa Demo', userId: 1, wa: '081234567890' }),
    R(7, 'hilang', 'Tas Ransel', 'Tas & Dompet', 'Gedung A', '2026-08-30',
      'Tas ransel warna hitam berisi buku catatan dan botol minum.'),
    R(8, 'ditemukan', 'AirPods Case', 'Aksesoris', 'Perpustakaan', '2026-11-03',
      'Case airpods warna putih, ada goresan kecil di tutup.', { posisi: 'Meja Pustakawan' }),
    R(9, 'ditemukan', 'Kacamata Hitam', 'Aksesoris', 'Mushola PT Inti Lt.5', '2026-10-19',
      'Kacamata hitam frame tebal, lensa tidak retak.', { posisi: 'Mushola Lt.5' })
  ];

  DB.set(KEY.users, users);
  DB.set(KEY.reports, reports);
  DB.set(KEY.messages, []);
  DB.set(KEY.seeded, true);
}

/* ---------- Autentikasi ---------- */
const Auth = {
  current() { return DB.get(KEY.session, null); },
  isLogged() { return !!this.current(); },

  login(identifier, password) {
    const id = String(identifier).trim().toLowerCase();
    const user = DB.get(KEY.users, []).find(u =>
      (u.username.toLowerCase() === id || u.npm === id) && u.password === password);
    if (!user) return null;
    const { password: _pw, ...session } = user; // password tidak disimpan di sesi
    DB.set(KEY.session, session);
    return session;
  },

  register(data) {
    const users = DB.get(KEY.users, []);
    if (users.some(u => u.username.toLowerCase() === data.username.toLowerCase()))
      return { ok: false, msg: 'Username sudah dipakai.' };
    if (users.some(u => u.npm === data.npm))
      return { ok: false, msg: 'NPM sudah terdaftar.' };
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase()))
      return { ok: false, msg: 'Email sudah terdaftar.' };
    users.push({ id: Date.now(), role: 'user', ...data });
    DB.set(KEY.users, users);
    return { ok: true };
  },

  logout() { localStorage.removeItem(KEY.session); },

  /* Penjaga halaman: belum login -> diarahkan ke halaman login */
  requireLogin() {
    if (this.isLogged()) return true;
    const page = (location.pathname.split('/').pop() || 'index.html') + location.search;
    location.replace('login.html?need=1&redirect=' + encodeURIComponent(page));
    return false;
  },

  /* Hanya izinkan redirect ke file .html lokal (cegah open redirect) */
  safeRedirect(target) {
    return /^[a-z0-9\-]+\.html(\?[\w=&%.\-]*)?$/i.test(target || '') ? target : 'index.html';
  }
};

/* ---------- Pengelolaan laporan ---------- */
/* Fungsi ini dipakai oleh halaman daftar, detail, dashboard, dan formulir laporan. */
const Reports = {
  // Ambil seluruh laporan dari localStorage.
  all() {
    return DB.get(KEY.reports, []);
  },

  // Cari satu laporan berdasarkan ID.
  find(id) {
    return this.all().find(r => String(r.id) === String(id));
  },

  // Tambahkan laporan baru ke penyimpanan.
  add(report) {
    const list = this.all();
    list.unshift({ id: Date.now(), status: 'aktif', createdAt: todayISO(), ...report });
    return DB.set(KEY.reports, list);
  },

  // Perbarui data laporan yang sudah ada.
  update(id, patch) {
    const list = this.all().map(r =>
      String(r.id) === String(id) ? { ...r, ...patch } : r
    );
    return DB.set(KEY.reports, list);
  },

  // Hapus laporan berdasarkan ID.
  remove(id) {
    return DB.set(KEY.reports, this.all().filter(r => String(r.id) !== String(id)));
  }
};

/* ---------- Status login pada tombol navigasi ---------- */
// Navbar dan footer ditulis langsung di setiap file HTML.
// JavaScript hanya mengubah tombol akun berdasarkan status login.
function updateAuthButton() {
  const area = document.getElementById('auth-area');
  if (!area) return;

  const user = Auth.current();
  if (!user) {
    area.innerHTML = '<a class="btn btn-ukri" href="login.html"><i class="bi bi-box-arrow-in-right me-1"></i>LOGIN</a>';
    return;
  }

  // Nama pengguna ditampilkan dengan aman sebagai teks.
  const name = document.createElement('span');
  name.textContent = user.nama.split(' ')[0];
  area.innerHTML = `<div class="dropdown"><button class="btn btn-ukri dropdown-toggle" data-bs-toggle="dropdown"><i class="bi bi-person-circle me-1"></i><span id="auth-name"></span></button>
    <ul class="dropdown-menu dropdown-menu-end"><li><span class="dropdown-item-text small text-muted" id="auth-detail"></span></li><li><hr class="dropdown-divider"></li>
    <li><a class="dropdown-item" href="dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Dashboard</a></li><li><a class="dropdown-item text-danger" href="#" id="btn-logout"><i class="bi bi-box-arrow-right me-2"></i>Keluar</a></li></ul></div>`;
  document.getElementById('auth-name').textContent = user.nama.split(' ')[0];
  document.getElementById('auth-detail').textContent = `${user.nama} (${user.npm})`;
  document.getElementById('btn-logout').addEventListener('click', event => {
    event.preventDefault();
    Auth.logout();
    location.href = 'index.html';
  });
}

document.addEventListener('DOMContentLoaded', updateAuthButton);

seedData();
