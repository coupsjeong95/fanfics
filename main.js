/* ============================================================
   main.js — 主页逻辑
   ============================================================ */

let allFics = [];
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
  render();
}

document.querySelectorAll('.f-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    const { filter, value } = btn.dataset;
    document.querySelectorAll(`.f-pill[data-filter="${filter}"]`)
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filters[filter] = value;
    render();
  });
});

function getFiltered() {
  return allFics.filter(f =>
    (!filters.era      || f.era      === filters.era)      &&
    (!filters.progress || f.progress === filters.progress) &&
    (!filters.length   || f.length   === filters.length)   &&
    (!filters.ending   || f.ending   === filters.ending)
  );
}

function render() {
  const list = getFiltered();
  document.getElementById('resultsMeta').textContent = list.length ? `共 ${list.length} 篇` : '';

  const container = document.getElementById('cardList');
  if (!list.length) {
    container.innerHTML = `<div class="state-block">暂无相关作品</div>`;
    return;
  }
  container.innerHTML = list.map((f, i) => cardHTML(f, i)).join('');
}

function cardHTML(f, idx) {
  const allTags = [f.era, f.progress, f.length, f.ending, ...(f.extra_tags || [])].filter(Boolean);
  const tagsStr = allTags.map(t => esc(t)).join('<span class="t-sep">·</span>');
  const platformLabel = esc((f.platform || '').toUpperCase());

  return `
<article class="fic-card" style="animation-delay:${idx * 0.04}s">
  <div class="card-top">
    <a class="card-title" href="${esc(f.link)}" target="_blank" rel="noopener noreferrer">${esc(f.title)}</a>
    <span class="card-author">${esc(f.author)}</span>
  </div>
  <div class="card-mid">
    <span class="card-summary">${esc(f.summary)}</span>
    <span class="card-platform">${esc(f.platform)}</span>
    </div>
  <div class="card-tags">${tagsStr}</div>
</article>`;
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
