/* tentang.js
   Logika khusus halaman tentang.
*/

const TEAM = [
    // Sesuaikan nama file foto (misal: syahdan.jpg) sesuai nama file di foldermu
    { nama: 'Syahdan Aryadi', npm: 'NPM 20251320064', wa: '085864845063', foto: 'img/Syahdan.jpg' },
    { nama: 'Muhammad Agil Ramdani', npm: 'NPM 20251320074', wa: '085862980575', foto: 'img/Agil.jpg' },
    { nama: 'Marsya Wulandari', npm: 'NPM 20251320054', wa: '083852084549', foto: 'img/Marsya.jpg' },
    { nama: 'Zulfikar Ramadhani', npm: 'NPM 20251320079', wa: '081223402277', foto: 'img/Zulfikar.jpg' },
    { nama: 'Debby Ramadhani', npm: 'NPM 20251320042', wa: '081322695875', foto: 'img/Debby.jpg' },
    { nama: 'Alia Cintia Anjjali', npm: 'NPM 20251320047', wa: '089699294622', foto: 'img/Alia.jpg' },
    { nama: 'Aufa Satria Ekaputra', npm: 'NPM 20251320058', wa: '083109753395', foto: 'img/Aufa.jpg' }
];

function initAbout() {
    const teamGrid = document.getElementById('team-grid');
    if (!teamGrid) return;

    teamGrid.innerHTML = TEAM.map(t => {
        const waNum = t.wa.startsWith('0') ? '62' + t.wa.slice(1) : t.wa;
        const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent('Halo, saya dari UKRI.FIND.')}`;

        return `
      <div class="col-6 col-md-4 col-lg-2">
        <div class="team-card">
          <div class="team-avatar">
            <img src="${t.foto}" alt="${t.nama}" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'bi bi-person\\'></i>';">
          </div>
          <h6>${t.nama}</h6>
          <small>${t.npm}</small>
          <a class="btn btn-sm btn-ukri mt-2" target="_blank" rel="noopener" href="${waUrl}">HUBUNGI</a>
        </div>
      </div>
    `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    initAbout();
});