/* lapor-kehilangan.js
   Logika khusus halaman ini saja.
   Fungsi umum tersedia di common.js.
   Gunakan JavaScript hanya untuk interaksi dan pengolahan data.
*/

function fillCategorySelect(sel, placeholder) {
    sel.innerHTML = `<option value="">${placeholder}</option>` +
        CATEGORIES.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
}

function resizeImage(file, max = 800) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onerror = reject;
        fr.onload = () => {
            const im = new Image();
            im.onerror = reject;
            im.onload = () => {
                const s = Math.min(1, max / Math.max(im.width, im.height));
                const c = document.createElement('canvas');
                c.width = Math.round(im.width * s);
                c.height = Math.round(im.height * s);
                c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
                resolve(c.toDataURL('image/jpeg', 0.75));
            };
            im.src = fr.result;
        };
        fr.readAsDataURL(file);
    });
}

/* ################ BAGIAN 2 — LOGIKA HALAMAN ################ */

/* PENJAGA HALAMAN: belum login -> dialihkan ke login.html */
if (!Auth.requireLogin()) document.documentElement.style.display = 'none';
function initLaporKehilangan() {
    const user = Auth.current();
    const form = document.getElementById('report-form');
    fillCategorySelect(document.getElementById('kategori'), 'Pilih Kategori');
    document.getElementById('tanggal').max = todayISO();
    document.getElementById('wa').value = user.telp || '';

    const desc = document.getElementById('deskripsi'), cnt = document.getElementById('desc-count');
    desc.addEventListener('input', () => cnt.textContent = `${desc.value.length}/200`);

    /* Upload foto (klik atau drag & drop) - opsional */
    const dz = document.getElementById('dropzone'), file = document.getElementById('foto');
    const err = document.getElementById('foto-err');
    let fotoData = '';
    async function handleFile(f) {
        err.textContent = '';
        if (!f) return;
        if (!/^image\/(jpeg|png)$/.test(f.type)) {err.textContent = 'Format harus JPG atau PNG.'; return; }
        if (f.size > 5 * 1024 * 1024) { err.textContent = 'Ukuran maksimal 5MB.'; return; }
        fotoData = await resizeImage(f);
        dz.innerHTML = `<img src="${fotoData}" alt="Pratinjau"><p class="small text-muted mt-2 mb-0">Klik untuk mengganti foto</p>`;
    }
    dz.addEventListener('click', () => file.click());
    file.addEventListener('change', () => handleFile(file.files[0]));
    ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('drag'); }));
    dz.addEventListener('drop', e => handleFile(e.dataTransfer.files[0]));

    document.getElementById('btn-cancel').addEventListener('click', () =>
        history.length > 1 ? history.back() : location.href = 'index.html');

    /* Kirim laporan */
    form.addEventListener('submit', e => {
        e.preventDefault();
        form.classList.add('was-validated');
        if (!form.checkValidity()) return;

        const newId = Reports.add({
            type: 'hilang',
            nama: document.getElementById('nama').value.trim(),
            kategori: document.getElementById('kategori').value,
            lokasi: document.getElementById('lokasi').value.trim(),
            tanggal: document.getElementById('tanggal').value,
            deskripsi: desc.value.trim(),
            rahasia: '', posisi: '',
            wa: document.getElementById('wa').value.trim(),
            foto: fotoData,
            pelapor: user.nama, userId: user.id,
            status: 'aktif', createdAt: todayISO()
        });
        if (!newId) { showToast('Penyimpanan penuh. Coba gunakan foto yang lebih kecil.', 'danger'); return; }
        location.href = 'detail-laporan.html?id=' + newId;
    });
}

document.addEventListener('DOMContentLoaded', () => { if (!Auth.isLogged()) return; initLaporKehilangan(); });