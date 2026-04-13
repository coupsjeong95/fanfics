/* ============================================================
   main.js — 主页逻辑
   ============================================================ */

// ---- Theme ----
(function initTheme() {
  const t = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('themeBtn').textContent = t === 'dark' ? '☀️' : '🌙';
})();

document.getElementById('themeBtn').addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  document.getElementById('themeBtn').textContent = next === 'dark' ? '☀️' : '🌙';
});

// ---- State ----
let allFics = [];
const filters = { era: '', progress: '', length: '', ending: '' };

// ---- Fetch data from Supabase ----
async function loadFanfics() {
  const { data, error } = await db
    .from('fanfics')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    renderState('加载失败，请刷新重试 :(');
    return;
  }

  allFics = data || [];
  render();
}

// ---- Filter pill interactions ----
document.querySelectorAll('.f-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    const { filter, value } = btn.dataset;
    // Deactivate siblings, activate clicked
    document.querySelectorAll(`.f-pill[data-filter="${filter}"]`)
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filters[filter] = value;
    render();
  });
});

// ---- Filter logic ----
function getFiltered() {
  return allFics.filter(f =>
    (!filters.era      || f.era      === filters.era)      &&
    (!filters.progress || f.progress === filters.progress) &&
    (!filters.length   || f.length   === filters.length)   &&
    (!filters.ending   || f.ending   === filters.ending)
  );
}

// ---- Render cards ----
function render() {
  const list = getFiltered();
  const meta = document.getElementById('resultsMeta');
  const grid = document.getElementById('cardGrid');

  meta.textContent = list.length ? `共 ${list.length} 篇` : '';

  if (!list.length) {
    grid.innerHTML = `<div class="state-block">暂无相关作品</div>`;
    return;
  }

  grid.innerHTML = list.map((f, i) => cardHTML(f, i)).join('');
}

function cardHTML(f, idx) {
  const tags = [f.era, f.progress, f.length, f.ending, ...(f.extra_tags || [])]
    .filter(Boolean)
    .map(t => `<span class="tag">${esc(t)}</span>`)
    .join('');

  return `
<article class="fic-card" style="animation-delay:${idx * 0.05}s">
  <a class="card-title"
     href="${esc(f.link)}"
     target="_blank"
     rel="noopener noreferrer">${esc(f.title)}</a>
  <div class="card-author">${esc(f.author)}</div>
  <p class="card-summary">${esc(f.summary)}</p>
  <div class="card-tags">${tags}</div>
</article>`;
}

function renderState(msg) {
  document.getElementById('cardGrid').innerHTML =
    `<div class="state-block">${msg}</div>`;
}

// ---- Utility: HTML escape ----
function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ---- Init ----
loadFanfics();
