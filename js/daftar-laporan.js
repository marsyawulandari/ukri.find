/* Logika halaman daftar laporan.
   Struktur kartu, keadaan kosong, pilihan kategori, dan item pagination
   didefinisikan di HTML. JavaScript hanya mengolah data dan interaksi. */

function statusKey(r) {
  return r.status === 'selesai' ? 'selesai' : r.type;
}

function statusLabel(r) {
  return r.status === 'selesai' ? 'Selesai' : (r.type === 'hilang' ? 'Hilang' : 'Ditemukan');
}

function createReportCard(report) {
  const template = document.getElementById('report-card-template');
  const fragment = template.content.cloneNode(true);
  const link = fragment.querySelector('[data-report-link]');
  const image = fragment.querySelector('[data-report-image]');
  const icon = fragment.querySelector('[data-report-icon]');
  const status = fragment.querySelector('[data-report-status]');

  link.href = `detail-laporan.html?id=${encodeURIComponent(report.id)}`;

  if (report.foto) {
    image.src = report.foto;
    image.alt = report.nama || 'Foto barang';
    image.hidden = false;
    icon.hidden = true;
  } else {
    icon.className = `bi ${CATEGORY_ICON[report.kategori] || 'bi-box-seam'}`;
    icon.hidden = false;
    image.hidden = true;
  }

  status.classList.add(statusKey(report));
  status.textContent = statusLabel(report);
  fragment.querySelector('[data-report-name]').textContent = report.nama || 'Tanpa nama';
  fragment.querySelector('[data-report-location]').textContent = report.lokasi || '-';
  fragment.querySelector('[data-report-date]').textContent = fmtDate(report.tanggal);
  fragment.querySelector('[data-report-description]').textContent = report.deskripsi || '';

  return fragment;
}

function initList() {
  const PER_PAGE = 8;
  const params = new URLSearchParams(window.location.search);
  const el = {
    q: document.getElementById('f-q'),
    category: document.getElementById('f-kategori'),
    date: document.getElementById('f-tanggal'),
    status: document.getElementById('f-status'),
    grid: document.getElementById('list-grid'),
    pagination: document.getElementById('pagination'),
    count: document.getElementById('result-count'),
    cardTemplate: document.getElementById('report-card-template'),
    emptyTemplate: document.getElementById('empty-state-template'),
    pageTemplate: document.getElementById('pagination-item-template')
  };
  let currentPage = 1;

  el.q.value = params.get('q') || '';
  el.category.value = params.get('kategori') || '';
  el.status.value = params.get('status') || '';

  function addPageItem(label, pageNumber, options = {}) {
    const fragment = el.pageTemplate.content.cloneNode(true);
    const item = fragment.querySelector('.page-item');
    const link = fragment.querySelector('.page-link');
    item.classList.toggle('active', Boolean(options.active));
    item.classList.toggle('disabled', Boolean(options.disabled));
    if (options.active) link.setAttribute('aria-current', 'page');
    link.textContent = label;
    link.dataset.p = String(pageNumber);
    if (options.disabled) link.setAttribute('aria-disabled', 'true');
    el.pagination.appendChild(fragment);
  }

  function renderPagination(totalPages) {
    el.pagination.replaceChildren();
    if (totalPages <= 1) return;

    addPageItem('«', currentPage - 1, { disabled: currentPage === 1 });
    for (let number = 1; number <= totalPages; number += 1) {
      addPageItem(String(number), number, { active: number === currentPage });
    }
    addPageItem('»', currentPage + 1, { disabled: currentPage === totalPages });
  }

  function render() {
    const query = el.q.value.trim().toLowerCase();
    const reports = Reports.all().filter(report =>
      report.status === 'aktif' &&
      (!query || [report.nama, report.lokasi, report.deskripsi].join(' ').toLowerCase().includes(query)) &&
      (!el.category.value || report.kategori === el.category.value) &&
      (!el.date.value || report.tanggal === el.date.value) &&
      (!el.status.value || report.type === el.status.value)
    );

    el.count.textContent = `${reports.length} laporan ditemukan`;
    const totalPages = Math.max(1, Math.ceil(reports.length / PER_PAGE));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * PER_PAGE;
    const visibleReports = reports.slice(start, start + PER_PAGE);

    el.grid.replaceChildren();
    if (visibleReports.length) {
      const cards = document.createDocumentFragment();
      visibleReports.forEach(report => cards.appendChild(createReportCard(report)));
      el.grid.appendChild(cards);
    } else {
      el.grid.appendChild(el.emptyTemplate.content.cloneNode(true));
    }

    renderPagination(totalPages);
  }

  el.pagination.addEventListener('click', event => {
    const link = event.target.closest('[data-p]');
    if (!link || link.closest('.page-item').classList.contains('disabled')) return;
    event.preventDefault();
    currentPage = Number(link.dataset.p);
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  [el.q, el.category, el.date, el.status].forEach(input => {
    input.addEventListener('input', () => {
      currentPage = 1;
      render();
    });
    input.addEventListener('change', () => {
      currentPage = 1;
      render();
    });
  });

  document.getElementById('f-reset').addEventListener('click', () => {
    el.q.value = '';
    el.category.value = '';
    el.date.value = '';
    el.status.value = '';
    currentPage = 1;
    render();
  });

  render();
}

document.addEventListener('DOMContentLoaded', initList);
