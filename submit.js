/* ============================================================
   submit.js — 投稿页逻辑
   ============================================================ */

const MAX_EXTRA_TAGS = 3;

const EXTRA_TAGS = [
  '甜文', '治愈', '虐文',
  'ABO', '哨兵向导', '双性',
  '电竞', '直播', '刑侦', '校园', '公路文',
  '破镜重圆', '先婚后爱', '强制爱', '穿越',
  '论坛体', '性转', '捡手机', '强强', '骨科',
  '直掰弯', 'BDSM'
];

// ---- Render extra tag checkboxes ----
(function renderExtraTags() {
  document.getElementById('extraTagsGrid').innerHTML = EXTRA_TAGS.map(t => `
<label class="xtag-opt">
  <input type="checkbox" name="extra_tags" value="${t}">
  <span class="xtag-face">${t}</span>
</label>`).join('');
})();

// ---- Title weight: CJK = 2, others = 1, max 20 ----
function titleWeight(str) {
  let w = 0;
  for (const c of str) {
    w += /[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\uff00-\uffef]/u.test(c) ? 2 : 1;
  }
  return w;
}

const titleInput   = document.getElementById('fTitle');
const titleCounter = document.getElementById('titleCounter');
titleInput.addEventListener('input', () => {
  // Trim on the fly if over limit
  let str = titleInput.value;
  let trimmed = '', acc = 0;
  for (const c of str) {
    const cw = /[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\uff00-\uffef]/u.test(c) ? 2 : 1;
    if (acc + cw > 20) break;
    trimmed += c; acc += cw;
  }
  if (titleInput.value !== trimmed) titleInput.value = trimmed;
  titleCounter.textContent = `${acc} / 20`;
  titleCounter.classList.toggle('warn', acc > 16);
});

// ---- Summary counter: max 25 characters ----
const summaryInput   = document.getElementById('fSummary');
const summaryCounter = document.getElementById('summaryCounter');
summaryInput.addEventListener('input', () => {
  const chars = [...summaryInput.value];
  if (chars.length > 25) {
    summaryInput.value = chars.slice(0, 25).join('');
  }
  const len = [...summaryInput.value].length;
  summaryCounter.textContent = `${len} / 25`;
  summaryCounter.classList.toggle('warn', len > 20);
});

// ---- Extra tags limit ----
const tagsCounter = document.getElementById('tagsCounter');
document.getElementById('extraTagsGrid').addEventListener('change', updateTagsState);

function getCheckedTags() {
  return [...document.querySelectorAll('input[name="extra_tags"]:checked')];
}

function updateTagsState() {
  const count = getCheckedTags().length;
  const atLimit = count >= MAX_EXTRA_TAGS;
  tagsCounter.textContent = `${count} / ${MAX_EXTRA_TAGS}`;
  tagsCounter.classList.toggle('warn', atLimit);

  document.querySelectorAll('.xtag-opt').forEach(opt => {
    const cb = opt.querySelector('input[type="checkbox"]');
    if (atLimit && !cb.checked) {
      opt.classList.add('at-limit');
      cb.disabled = true;
    } else {
      opt.classList.remove('at-limit');
      cb.disabled = false;
    }
  });
}

// ---- Toast ----
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3500);
}

// ---- Back to top ----
const topBtn = document.getElementById('topBtn');
window.addEventListener('scroll', () => {
  topBtn.classList.toggle('visible', window.scrollY > 280);
}, { passive: true });
topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ---- Form submit ----
document.getElementById('submitForm').addEventListener('submit', async e => {
  e.preventDefault();

  const title    = document.getElementById('fTitle').value.trim();
  const author   = document.getElementById('fAuthor').value.trim();
  const link     = document.getElementById('fLink').value.trim();
  const summary  = document.getElementById('fSummary').value.trim();
  const platform = document.querySelector('input[name="platform"]:checked')?.value;
  const era      = document.querySelector('input[name="era"]:checked')?.value;
  const progress = document.querySelector('input[name="progress"]:checked')?.value;
  const length   = document.querySelector('input[name="length"]:checked')?.value;
  const ending   = document.querySelector('input[name="ending"]:checked')?.value;
  const extra_tags = getCheckedTags().map(x => x.value);

  if (!title || !author || !link || !summary) return showToast('请填写所有必填项', 'err');
  if (!/^https?:\/\//i.test(link))            return showToast('链接格式不正确，请以 https:// 开头', 'err');
  if (!platform)                               return showToast('请选择阅读平台', 'err');
  if (!era || !progress || !length || !ending) return showToast('请完整选择时代、进度、篇幅和结局', 'err');

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = '提交中…';

  const { error } = await db.from('fanfics').insert({
    title, author, link, summary,
    platform, era, progress, length, ending,
    extra_tags,
    status: 'pending'
  });

  if (error) {
    console.error('Supabase error:', error);
    showToast('提交失败，请稍后重试', 'err');
    btn.disabled = false;
    btn.textContent = '提交投稿';
    return;
  }

  showToast('投稿成功！审核通过后将出现在合集 ✦', 'ok');
  document.getElementById('submitForm').reset();
  titleCounter.textContent   = '0 / 20';
  summaryCounter.textContent = '0 / 25';
  tagsCounter.textContent    = '0 / 3';
  titleCounter.classList.remove('warn');
  summaryCounter.classList.remove('warn');
  tagsCounter.classList.remove('warn');
  updateTagsState();
  btn.disabled = false;
  btn.textContent = '提交投稿';
});
