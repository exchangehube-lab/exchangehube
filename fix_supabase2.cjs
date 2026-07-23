const fs = require('fs');

let code = fs.readFileSync('src/messaging/supabase.ts', 'utf8');

const regex = /export let supabaseUrl = "";\nlet _supabase: SupabaseClient \| null = null;/;

const newCode = `let _supabase: SupabaseClient | null = null;
export function getSupabaseUrl(): string {
  let url = (import.meta as any).env.SUPABASE_URL || (import.meta as any).env.VITE_SUPABASE_URL;
  if (!url && (window as any).__ENV__) {
    url = (window as any).__ENV__.SUPABASE_URL;
  }
  return url || '';
}`;

if (regex.test(code)) {
  code = code.replace(regex, newCode);
  code = code.replace("supabaseUrl = (import.meta as any).env.SUPABASE_URL", "let supabaseUrl = (import.meta as any).env.SUPABASE_URL");
  fs.writeFileSync('src/messaging/supabase.ts', code);
  console.log("Fixed supabaseUrl export");
} else {
  console.log("Regex failed in fix_supabase2.cjs");
}
