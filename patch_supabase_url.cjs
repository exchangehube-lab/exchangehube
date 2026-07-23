const fs = require('fs');

let code = fs.readFileSync('src/messaging/supabase.ts', 'utf8');

if (!code.includes('export let supabaseUrl')) {
  code = code.replace('let supabaseUrl =', 'export let supabaseUrl =');
  code = code.replace('let _supabase: SupabaseClient | null = null;', 'export let supabaseUrl = "";\nlet _supabase: SupabaseClient | null = null;');
  code = code.replace(/let supabaseUrl = \(import\.meta as any\)\.env/g, 'supabaseUrl = (import.meta as any).env');
  fs.writeFileSync('src/messaging/supabase.ts', code);
  console.log("Patched supabase.ts to export supabaseUrl");
}
