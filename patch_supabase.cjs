const fs = require('fs');
let code = fs.readFileSync('src/messaging/supabase.ts', 'utf8');

code = code.replace(
  `const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;`,
  `const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || (import.meta as any).env.SUPABASE_URL;`
);

code = code.replace(
  `const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;`,
  `const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env.SUPABASE_ANON_KEY;`
);

fs.writeFileSync('src/messaging/supabase.ts', code);
