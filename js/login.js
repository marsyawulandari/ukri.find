/* login.js
   Logika khusus halaman ini saja.
   Fungsi umum tersedia di common.js.
   Gunakan JavaScript hanya untuk interaksi dan pengolahan data.
*/

/* ################ BAGIAN 2 — LOGIKA HALAMAN ################ */

function initLogin() {
  const params = new URLSearchParams(location.search);
  const redirect = Auth.safeRedirect(params.get('redirect'));
  if (Auth.isLogged()) { location.replace(redirect); return; }

  if (params.get('need')) {
    document.getElementById('need-login').classList.remove('d-none');
  }
  if (params.get('tab') === 'daftar') bootstrap.Tab.getOrCreateInstance(document.getElementById('tab-daftar')).show();

  const msg = document.getElementById('auth-msg');
  const alertBox = (t, ok) => msg.innerHTML = `<div class="alert alert-${ok ? 'success' : 'danger'} py-2 small">${esc(t)}</div>`;

  /* Login */
  const lf = document.getElementById('login-form');
  lf.addEventListener('submit', e => {
    e.preventDefault();
    lf.classList.add('was-validated');
    if (!lf.checkValidity()) return;
    const u = Auth.login(document.getElementById('l-id').value, document.getElementById('l-pw').value);
    if (!u) { alertBox('NIM/Username atau kata sandi salah.', false); return; }
    alertBox('Login berhasil, mengalihkan...', true);
    setTimeout(() => location.href = redirect, 500);
  });

  /* Isi otomatis akun percobaan */
  document.querySelectorAll('[data-demo]').forEach(b => b.addEventListener('click', () => {
    const [id, pw] = b.dataset.demo.split('|');
    document.getElementById('l-id').value = id;
    document.getElementById('l-pw').value = pw;
  }));

  /* Daftar */
  const rf = document.getElementById('register-form');
  rf.addEventListener('submit', e => {
    e.preventDefault();
    rf.classList.add('was-validated');
    if (!rf.checkValidity()) return;
    const g = id => document.getElementById(id).value.trim();
    const res = Auth.register({
      nama: g('r-nama'), username: g('r-username'), npm: g('r-npm'), prodi: g('r-prodi'),
      email: g('r-email'), telp: g('r-telp'), password: document.getElementById('r-pw').value
    });
    if (!res.ok) { alertBox(res.msg, false); return; }
    Auth.login(g('r-username'), document.getElementById('r-pw').value);
    alertBox('Pendaftaran berhasil! Mengalihkan...', true);
    setTimeout(() => location.href = redirect, 700);
  });
}

document.addEventListener('DOMContentLoaded', () => { initLogin(); });
