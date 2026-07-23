const fs = require('fs');
let code = fs.readFileSync('src/messaging/supabase.ts', 'utf8');
code = code.replace('export supabaseUrl = ', 'supabaseUrl = ');
fs.writeFileSync('src/messaging/supabase.ts', code);
