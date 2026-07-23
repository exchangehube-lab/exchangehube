const fs = require('fs');
let code = fs.readFileSync('src/messaging/supabase.ts', 'utf8');

const regex = /const supabaseUrl = \(import\.meta as any\)\.env\.SUPABASE_URL \|\| \(import\.meta as any\)\.env\.VITE_SUPABASE_URL;\s*const supabaseAnonKey = \(import\.meta as any\)\.env\.SUPABASE_ANON_KEY \|\| \(import\.meta as any\)\.env\.VITE_SUPABASE_ANON_KEY;/;

const newCode = `let supabaseUrl = (import.meta as any).env.SUPABASE_URL || (import.meta as any).env.VITE_SUPABASE_URL;
    let supabaseAnonKey = (import.meta as any).env.SUPABASE_ANON_KEY || (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
    
    // Fallback to reading from global window object injected by server
    if (!supabaseUrl && (window as any).__ENV__) {
      supabaseUrl = (window as any).__ENV__.SUPABASE_URL;
      supabaseAnonKey = (window as any).__ENV__.SUPABASE_ANON_KEY;
    }`;

if (regex.test(code)) {
  code = code.replace(regex, newCode);
  fs.writeFileSync('src/messaging/supabase.ts', code);
  console.log("Patched supabase.ts successfully");
} else {
  console.log("Regex failed in supabase.ts");
}
