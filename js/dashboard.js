/* dashboard.js
   Logika khusus halaman ini saja.
   Fungsi umum tersedia di common.js.
   Gunakan JavaScript hanya untuk interaksi dan pengolahan data.
*/

function statusKey(r) { return r.status === 'selesai' ? 'selesai' : r.type; }
function statusLabel(r) { return r.status === 'selesai' ? 'Selesai' : (r.type === 'hilang' ? 'Hilang' : 'Ditemukan'); }

/* ################ BAGIAN 2 — LOGIKA HALAMAN ################ */

/* PENJAGA HALAMAN: belum login -> dialihkan ke login.html */
if (!Auth.requireLogin()) document.documentElement.style.display = 'none';

function initDashboard() {
  const user = Auth.current();
  document.getElementById('dash-name').textContent = user.nama;
  const wrap = document.getElementById('dash-list');

  function render() {
    const mine = Reports.all().filter(r => r.userId === user.id);
    document.getElementById('stat-total').textContent = mine.length;
    document.getElementById('stat-hilang').textContent = mine.filter(r => r.type === 'hilang').length;
    document.getElementById('stat-temuan').textContent = mine.filter(r => r.type === 'ditemukan').length;
    wrap.innerHTML = mine.length ? mine.map(r => `
      <tr>
        <td class="fw-semibold">${esc(r.nama)}</td>
        <td><span class="pill ${statusKey(r)}">${statusLabel(r)}</span></td>
        <td>${esc(r.lokasi)}</td>
        <td>${fmtDate(r.tanggal)}</td>
        <td class="text-end text-nowrap">
          <a class="btn btn-sm btn-outline-ukri" href="detail-laporan.html?id=${r.id}">Lihat</a>
          ${r.status === 'aktif' ? `<button class="btn btn-sm btn-success" data-done="${r.id}">Selesai</button>` : ''}
          <button class="btn btn-sm btn-outline-danger" data-del="${r.id}"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`).join('')
      : '<tr><td colspan="5" class="text-center text-muted py-4">Anda belum membuat laporan.</td></tr>';
  }
  wrap.addEventListener('click', e => {
    const d = e.target.closest('[data-del]'), s = e.target.closest('[data-done]');
    if (d && confirm('Hapus laporan ini?')) { Reports.remove(d.dataset.del); render(); showToast('Laporan dihapus.'); }
    if (s) { Reports.update(s.dataset.done, { status: 'selesai' }); render(); showToast('Laporan ditandai selesai.'); }
  });
  render();
}

document.addEventListener('DOMContentLoaded', () => { if (!Auth.isLogged()) return; initDashboard(); });
