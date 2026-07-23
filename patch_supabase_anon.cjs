const fs = require('fs');

let code = fs.readFileSync('src/messaging/supabase.ts', 'utf8');

const regex = /export function getSupabaseUrl\(\): string \{[\s\S]*?return url \|\| '';\n\}/;

const newCode = `export function getSupabaseUrl(): string {
  let url = (import.meta as any).env.SUPABASE_URL || (import.meta as any).env.VITE_SUPABASE_URL;
  if (!url && (window as any).__ENV__) {
    url = (window as any).__ENV__.SUPABASE_URL;
  }
  return url || '';
}

export function getSupabaseAnonKey(): string {
  let key = (import.meta as any).env.SUPABASE_ANON_KEY || (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
  if (!key && (window as any).__ENV__) {
    key = (window as any).__ENV__.SUPABASE_ANON_KEY;
  }
  return key || '';
}`;

if (regex.test(code)) {
  code = code.replace(regex, newCode);
  fs.writeFileSync('src/messaging/supabase.ts', code);
  console.log("Added getSupabaseAnonKey");
} else {
  console.log("Regex failed in patch_supabase_anon.cjs");
}
