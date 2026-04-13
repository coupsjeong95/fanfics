/* ============================================================
   submit.js — 投稿页逻辑
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

// ---- Extra tags list ----
const EXTRA_TAGS = [
  '甜文', '治愈', '虐文',
  'ABO', '哨兵向导', '双性',
  '电竞', '直播', '刑侦', '校园', '公路文',
  '破镜重圆', '先婚后爱', '强制爱', '穿越',
  '论坛体', '性转', '捡手机', '强强', '骨科',
  '直掰弯', 'BDSM'
];

// Render extra tag checkboxes
(function renderExtraTags() {
  const grid = document.getElementById('extraTagsGrid');
  grid.innerHTML = EXTRA_TAGS.map(t => `
<label class="xtag-opt">
  <input type="checkbox" name="extra_tags" value="${t}">
  <span class="xtag-face">${t}</span>
</label>`).join('');
})();

// ---- Toast ----
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 3500);
}

// ---- Form submit ----
document.getElementById('submitForm').addEventListener('submit', async e => {
  e.preventDefault();

  const g = id => document.getElementById(id).value.trim();
  const r = name => document.querySelector(`input[name="${name}"]:checked`)?.value;
  const c = name => [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(x => x.value);

  const title    = g('fTitle');
  const author   = g('fAuthor');
  const link     = g('fLink');
  const summary  = g('fSummary');
  const era      = r('era');
  const progress = r('progress');
  const length   = r('length');
  const ending   = r('ending');
  const extra_tags = c('extra_tags');

  // Validation
  if (!title || !author || !link || !summary) {
    return showToast('请填写所有必填项', 'err');
  }
  if (!/^https?:\/\//i.test(link)) {
    return showToast('链接格式不正确，请以 http 或 https 开头', 'err');
  }
  if (!era || !progress || !length || !ending) {
    return showToast('请选择时代、进度、篇幅和结局', 'err');
  }

  // Submit
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = '提交中…';

  const { error } = await db.from('fanfics').insert({
    title, author, link, summary,
    era, progress, length, ending,
    extra_tags,
    status: 'pending'
  });

  if (error) {
    console.error('Supabase insert error:', error);
    showToast('提交失败，请稍后重试', 'err');
    btn.disabled = false;
    btn.textContent = '提交投稿';
    return;
  }

  showToast('投稿成功！审核通过后将出现在主页 ✦', 'ok');
  document.getElementById('submitForm').reset();
  btn.disabled = false;
  btn.textContent = '提交投稿';
});
