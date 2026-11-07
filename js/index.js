/* index.js
   Logika khusus halaman ini saja.
   Fungsi umum tersedia di common.js.
   Gunakan JavaScript hanya untuk interaksi dan pengolahan data.
*/

function statusKey(r) { return r.status === 'selesai' ? 'selesai' : r.type; }
function statusLabel(r) { return r.status === 'selesai' ? 'Selesai' : (r.type === 'hilang' ? 'Hilang' : 'Ditemukan'); }

function reportCard(r) {
  const img = r.foto
    ? `<img src="${esc(r.foto)}" alt="${esc(r.nama)}" loading="lazy">`
    : `<i class="bi ${CATEGORY_ICON[r.kategori] || 'bi-box-seam'}"></i>`;
  return `
    <div class="col-6 col-md-4 col-lg-3">
      <a href="detail-laporan.html?id=${encodeURIComponent(r.id)}" class="report-card">
        <div class="rc-img">${img}<span class="badge-status ${statusKey(r)}">${statusLabel(r)}</span></div>
        <div class="rc-body">
          <h6>${esc(r.nama)}</h6>
          <div class="rc-meta"><span><i class="bi bi-geo-alt"></i> ${esc(r.lokasi)}</span><span>&bull; ${fmtDate(r.tanggal)}</span></div>
          <p class="rc-desc">${esc(r.deskripsi)}</p>
        </div>
      </a>
    </div>`;
}

function fillCategorySelect(sel, placeholder) {
  sel.innerHTML = `<option value="">${placeholder}</option>` +
    CATEGORIES.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
}

/* ################ BAGIAN 2 — LOGIKA HALAMAN ################ */

function initHome() {
  const user = Auth.current();
  const greet = document.getElementById('greeting');
  if (greet && user) {
    greet.innerHTML = `<div class="alert alert-info py-2 mb-3 d-inline-block"><i class="bi bi-person-check me-1"></i>Halo, <strong>${esc(user.nama)}</strong>! Selamat datang kembali.</div>`;
  }
  const extra = document.getElementById('hero-extra');
  if (extra && user) {
    extra.innerHTML = `<a href="dashboard.html" class="btn btn-outline-ukri"><i class="bi bi-speedometer2 me-1"></i>Dashboard</a>
                       <button id="hero-logout" class="btn btn-outline-danger" style="border-radius:10px"><i class="bi bi-box-arrow-right me-1"></i>Keluar</button>`;
    document.getElementById('hero-logout').addEventListener('click', () => { Auth.logout(); location.reload(); });
  }

  fillCategorySelect(document.getElementById('s-kategori'), 'Semua Kategori');
  document.getElementById('search-form').addEventListener('submit', e => {
    e.preventDefault();
    const q = document.getElementById('s-q').value.trim();
    const k = document.getElementById('s-kategori').value;
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (k) p.set('kategori', k);
    location.href = 'daftar-laporan.html' + (p.toString() ? '?' + p : '');
  });

  const active = Reports.all().filter(r => r.status === 'aktif').slice(0, 8);
  document.getElementById('latest-grid').innerHTML = active.length
    ? active.map(reportCard).join('')
    : '<div class="empty-state w-100"><i class="bi bi-inbox"></i><p>Belum ada laporan aktif.</p></div>';
}

document.addEventListener('DOMContentLoaded', () => { initHome(); });
