/* detail-laporan.js
   Logika khusus halaman ini saja.
   Fungsi umum tersedia di common.js.
   Gunakan JavaScript hanya untuk interaksi dan pengolahan data.
*/

function statusKey(r) { return r.status === 'selesai' ? 'selesai' : r.type; }
function statusLabel(r) { return r.status === 'selesai' ? 'Selesai' : (r.type === 'hilang' ? 'Hilang' : 'Ditemukan'); }

/* ################ BAGIAN 2 — LOGIKA HALAMAN ################ */

function initDetail() {
  const id = new URLSearchParams(location.search).get('id');
  const r = Reports.find(id);
  const box = document.getElementById('detail-box');
  if (!r) {
    box.innerHTML = '<div class="empty-state"><i class="bi bi-exclamation-circle"></i><h5>Laporan tidak ditemukan</h5><a href="daftar-laporan.html" class="btn btn-ukri mt-2">Kembali ke Daftar Laporan</a></div>';
    return;
  }
  const user = Auth.current();
  const isOwner = user && user.id === r.userId;
  const found = r.type === 'ditemukan';
  const tanggalLabel = found ? 'Tanggal Ditemukan' : 'Tanggal Hilang';
  const lokasiLabel = found ? 'Lokasi Ditemukan' : 'Lokasi Terakhir';
  const img = r.foto ? `<img src="${esc(r.foto)}" alt="${esc(r.nama)}">` : `<i class="bi ${CATEGORY_ICON[r.kategori] || 'bi-box-seam'}"></i>`;

  const notice = found
    ? 'Barang ini ditemukan di area kampus. Jika merasa ini milik Anda, klik tombol <strong>“Ini Barang Saya”</strong> untuk mengklaim.'
    : 'Barang ini dilaporkan hilang di area kampus. Jika Anda menemukannya, silakan hubungi pelapor atau admin.';

  const buttons = r.status === 'selesai' ? '' : (found
    ? `<button class="btn btn-ukri" id="btn-claim"><i class="bi bi-hand-index-thumb me-1"></i>Ini Barang Saya</button>
       <a class="btn btn-outline-ukri" target="_blank" rel="noopener" href="${waLink(ADMIN_WA, `Halo Admin UKRI.FIND, saya ingin bertanya tentang laporan "${r.nama}" (ID ${r.id}).`)}"><i class="bi bi-headset me-1"></i>Hubungi Admin</a>`
    : `<a class="btn btn-ukri" target="_blank" rel="noopener" href="${waLink(r.wa, `Halo ${r.pelapor}, saya menemukan barang yang mungkin milik Anda: ${r.nama}.`)}"><i class="bi bi-whatsapp me-1"></i>Hubungi Pelapor</a>
       <a class="btn btn-outline-ukri" target="_blank" rel="noopener" href="${waLink(ADMIN_WA, `Halo Admin UKRI.FIND, saya ingin bertanya tentang laporan "${r.nama}" (ID ${r.id}).`)}"><i class="bi bi-headset me-1"></i>Hubungi Admin</a>`);

  document.title = `${r.nama} — UKRI.FIND`;
  box.innerHTML = `
    <nav aria-label="breadcrumb"><ol class="breadcrumb small">
      <li class="breadcrumb-item"><a href="index.html">Beranda</a></li>
      <li class="breadcrumb-item"><a href="daftar-laporan.html">Daftar Laporan</a></li>
      <li class="breadcrumb-item active">Detail ${found ? 'Ditemukan' : 'Hilang'}</li>
    </ol></nav>
    <div class="row g-4">
      <div class="col-lg-5"><div class="detail-img">${img}</div></div>
      <div class="col-lg-7">
        <div class="d-flex gap-2 flex-wrap mb-2">
          <span class="pill ${statusKey(r)}">${statusLabel(r)}</span>
          ${r.status === 'aktif' ? '<span class="pill aktif">Aktif</span>' : ''}
          <span class="pill kategori">${esc(r.kategori)}</span>
        </div>
        <h2 class="fw-bold mb-3">${esc(r.nama)}</h2>
        <dl class="row detail-info">
          <div class="col-sm-6"><dt>${lokasiLabel}</dt><dd>${esc(r.lokasi)}</dd></div>
          <div class="col-sm-6"><dt>${tanggalLabel}</dt><dd>${fmtDate(r.tanggal)}</dd></div>
          ${found && r.posisi ? `<div class="col-sm-6"><dt>Posisi Barang Saat Ini</dt><dd>${esc(r.posisi)}</dd></div>` : ''}
          <div class="col-sm-6"><dt>${found ? 'Ditemukan Oleh' : 'Dilaporkan Oleh'}</dt><dd>${esc(r.pelapor)}</dd></div>
          <div class="col-12"><dt>Deskripsi</dt><dd class="fw-normal">${esc(r.deskripsi) || '-'}</dd></div>
          ${isOwner && r.rahasia ? `<div class="col-12"><dt>Deskripsi Rahasia (hanya terlihat oleh Anda)</dt><dd>${esc(r.rahasia)}</dd></div>` : ''}
        </dl>
        <div class="notice-box mb-3"><i class="bi bi-info-circle me-1"></i>${notice}</div>
        <div class="d-flex gap-2 flex-wrap">
          <a class="btn btn-outline-ukri" href="daftar-laporan.html"><i class="bi bi-arrow-left me-1"></i>Daftar Laporan</a>
          ${buttons}
        </div>
      </div>
    </div>

    <div class="modal fade" id="claimModal" tabindex="-1"><div class="modal-dialog modal-dialog-centered"><div class="modal-content" style="border-radius:18px">
      <div class="modal-header"><h5 class="modal-title fw-bold">Klaim Barang</h5><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body" id="claim-body"></div>
    </div></div></div>`;

  const claimBtn = document.getElementById('btn-claim');
  if (!claimBtn) return;
  claimBtn.addEventListener('click', () => {
    if (!Auth.isLogged()) {
      location.href = 'login.html?need=1&redirect=' + encodeURIComponent('detail-laporan.html?id=' + r.id);
      return;
    }
    const body = document.getElementById('claim-body');
    body.innerHTML = `
      <p class="small text-muted">Untuk memastikan barang ini milik Anda, ${r.rahasia ? 'sebutkan ciri/isi barang yang <strong>tidak tampil di publik</strong> (pisahkan dengan koma).' : 'jelaskan ciri-ciri barang Anda.'}</p>
      <textarea id="claim-text" class="form-control" rows="3" placeholder="Contoh: isi dompet, wallpaper HP, nomor seri..."></textarea>
      <div id="claim-msg" class="mt-2 small"></div>
      <button class="btn btn-ukri w-100 mt-3" id="claim-submit">Verifikasi &amp; Hubungi Penemu</button>`;
    new bootstrap.Modal('#claimModal').show();
    document.getElementById('claim-submit').addEventListener('click', () => {
      const txt = document.getElementById('claim-text').value.trim().toLowerCase();
      const msg = document.getElementById('claim-msg');
      if (txt.length < 3) { msg.innerHTML = '<span class="text-danger">Isi keterangan terlebih dahulu.</span>'; return; }
      if (r.rahasia) {
        const keys = r.rahasia.toLowerCase().split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
        if (!keys.some(k => txt.includes(k))) {
          msg.innerHTML = '<span class="text-danger">Keterangan belum cocok dengan data penemu. Coba sebutkan ciri lain.</span>';
          return;
        }
      }
      const u = Auth.current();
      const text = `Halo ${r.pelapor}, saya ${u.nama} (NPM ${u.npm}). Saya ingin mengklaim barang "${r.nama}" di UKRI.FIND. Ciri barang: ${document.getElementById('claim-text').value.trim()}`;
      msg.innerHTML = `<div class="alert alert-success py-2">Verifikasi berhasil!</div>
        <a class="btn btn-success w-100" target="_blank" rel="noopener" href="${waLink(r.wa, text)}"><i class="bi bi-whatsapp me-1"></i>Chat Penemu via WhatsApp</a>`;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => { initDetail(); });
