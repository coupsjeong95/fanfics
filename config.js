// ============================================================
// 填入你的 Supabase 项目信息
// 在 Supabase 控制台 → Project Settings → API 中可以找到
// ============================================================

const SUPABASE_URL      = 'YOUR_SUPABASE_URL';       // 形如 https://xxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';  // anon / public key

// ============================================================

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
