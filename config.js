// ============================================================
// 填入你的 Supabase 项目信息
// Supabase 控制台 → Project Settings → API
// ============================================================

const SUPABASE_URL      = 'YOUR_SUPABASE_URL';       // https://xxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';  // anon / public key

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
