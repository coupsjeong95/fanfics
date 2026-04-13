// ============================================================
// 填入你的 Supabase 项目信息
// 在 Supabase 控制台 → Project Settings → API 中可以找到
// ============================================================

const SUPABASE_URL      = 'https://iylveifhyaxpkrkgukdg.supabase.co';       // 形如 https://xxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bHZlaWZoeWF4cGtya2d1a2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTg3MzIsImV4cCI6MjA5MTU5NDczMn0.gX_8kstRlqkSPkNDO6-FQuECgE8TYbcWBgyPOG_QjmQ';  // anon / public key

// ============================================================

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
