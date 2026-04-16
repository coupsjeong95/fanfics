/* ============================================================
   main.js — 主页逻辑
   ============================================================ */

const PAGE_SIZE = 10;

let allFics = [];
let displayed = [];   // 当前过滤+排序后的完整列表
let currentPage = 1;
let currentSort = 'newest';

const filters = { era: '', progress: '', length: '', ending: '' };

async function loadFanfics() {
  const { data, error } = await db
    .from('fanfics')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    document.getElementById('cardList').innerHTML =
      `<div class="state-block">加载失败，请刷新重试</div>`;
    return;
  }

  allFics = data || [];
  applyAndRender();
}

// –– Filter pills ––
document.querySelectorAll('.f-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    const { filter, value } = btn.dataset;
    document.querySelectorAll(`.f-pill[data-filter="${filter}"]`)
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filters[filter] = value;
     currentPage = 1;
    applyAndRender();
  });
});

// –– Sort buttons ––
document.querySelectorAll('.sort-btn').forEach(btn => {
btn.addEventListener('click', () => {
document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
currentSort = btn.dataset.sort;
currentPage = 1;
applyAndRender();
});
});

// –– Filter + sort ––
function applyAndRender() {
// Filter
let list = allFics.filter(f =>
    (!filters.era      || f.era      === filters.era)      &&
    (!filters.progress || f.progress === filters.progress) &&
    (!filters.length   || f.length   === filters.length)   &&
    (!filters.ending   || f.ending   === filters.ending)
  );

// Sort
if (currentSort === 'newest') {
list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
} else if (currentSort === 'oldest') {
list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
} else if (currentSort === 'random') {
// Fisher-Yates shuffle
for (let i = list.length - 1; i > 0; i–) {
const j = Math.floor(Math.random() * (i + 1));
[list[i], list[j]] = [list[j], list[i]];
}
}

   displayed = list;
renderPage();
}

// –– Render current page ––
function renderPage() {
const total = displayed.length;
const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
currentPage = Math.min(currentPage, totalPages);

const start = (currentPage - 1) * PAGE_SIZE;
const slice = displayed.slice(start, start + PAGE_SIZE);

// Meta
const meta = document.getElementById('resultsMeta');
meta.textContent = total
? `共 ${total} 篇 · 第 ${currentPage} / ${totalPages} 页`
: '';
   
   // Cards
  const list = document.getElementById('cardList');
if (!total) {
list.innerHTML = `<div class="state-block">暂无相关作品</div>`;
document.getElementById('pagination').innerHTML = '';
return;
}

list.innerHTML = slice.map((f, i) => cardHTML(f, i)).join('');

   // Pagination
renderPagination(totalPages);
}

// –– Pagination ––
function renderPagination(totalPages) {
const pg = document.getElementById('pagination');
if (totalPages <= 1) { pg.innerHTML = ''; return; }

const pages = getPageNums(currentPage, totalPages);
let html = '';

// Prev
html += `<button class="pg-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goPage(${currentPage - 1})">&#8592;</button>`;

pages.forEach(p => {
if (p === '…') {
html += `<span class="pg-sep">…</span>`;
} else {
html += `<button class="pg-btn ${p === currentPage ? 'active' : ''}" onclick="goPage(${p})">${p}</button>`;
}
});

// Next
html += `<button class="pg-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goPage(${currentPage + 1})">&#8594;</button>`;

pg.innerHTML = html;
}

function goPage(n) {
currentPage = n;
renderPage();
window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show at most 7 page numbers with ellipsis
function getPageNums(cur, total) {
if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
const pages = [];
pages.push(1);
if (cur > 3) pages.push('…');
for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) {
pages.push(i);
}
if (cur < total - 2) pages.push('…');
pages.push(total);
return pages;
}

function cardHTML(f, idx) {
  const coreTags = [f.era, f.progress, f.length, f.ending].filter(Boolean);
const extraTags = (f.extra_tags || []);
const allTags = […coreTags, …extraTags];
const tagsHtml = allTags
.map((t, i) => `${i > 0 ? '<span class="t-sep">·</span>' : ''}${esc(t)}`)
.join('');

const summaryHtml = f.summary
? `<p class="card-summary">${esc(f.summary)}</p>` : '';

  return `
  
<article class="fic-card" style="animation-delay:${idx * 0.04}s">
  <div class="card-top">
    <a class="card-title" href="${esc(f.link)}" target="_blank" rel="noopener noreferrer">${esc(f.title)}</a>
    <span class="card-author">${esc(f.author)}</span>
  </div>
  <div class="card-mid">
    <p class="card-summary">${esc(f.summary)}</p>
    <span class="card-platform">${esc(f.platform)}</span>
    </div>
  <div class="card-tags">${tagsStr}</div>
</article>`;
}

function renderState(msg) {
document.getElementById(‘cardList’).innerHTML =
`<div class="state-block">${msg}</div>`;
}

// Back to top
const topBtn = document.getElementById('topBtn');
window.addEventListener('scroll', () => {
  topBtn.classList.toggle('visible', window.scrollY > 280);
}, { passive: true });
topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

loadFanfics();
