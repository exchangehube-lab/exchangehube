const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /const supabaseUrl = .*/,
    "const supabaseUrl = (import.meta as any).env.SUPABASE_URL || (import.meta as any).env.VITE_SUPABASE_URL;"
  );
  code = code.replace(
    /const supabaseAnonKey = .*/,
    "const supabaseAnonKey = (import.meta as any).env.SUPABASE_ANON_KEY || (import.meta as any).env.VITE_SUPABASE_ANON_KEY;"
  );
  fs.writeFileSync(file, code);
}

patchFile('src/messaging/supabase.ts');
patchFile('src/components/SupabaseVerification.tsx');
