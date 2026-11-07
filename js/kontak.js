/* kontak.js
   Logika khusus halaman ini saja.
   Fungsi umum tersedia di common.js.
   Gunakan JavaScript hanya untuk interaksi dan pengolahan data.
*/

/* ==================== BAGIAN 2 - LOGIKA HALAMAN ==================== */

function initContact() {
  const f = document.getElementById('contact-form');
  const u = Auth.current();
  if (u) { document.getElementById('c-nama').value = u.nama; document.getElementById('c-email').value = u.email; }
  f.addEventListener('submit', e => {
    e.preventDefault();
    f.classList.add('was-validated');
    if (!f.checkValidity()) return;
    const msgs = DB.get(KEY.messages, []);
    msgs.push({
      nama: document.getElementById('c-nama').value.trim(),
      email: document.getElementById('c-email').value.trim(),
      pesan: document.getElementById('c-pesan').value.trim(),
      waktu: new Date().toISOString()
    });
    DB.set(KEY.messages, msgs);
    f.reset(); f.classList.remove('was-validated');
    showToast('Pesan Anda berhasil dikirim. Terima kasih!');
  });
}

document.addEventListener('DOMContentLoaded', () => { initContact(); });

