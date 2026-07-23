const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /\/\/ Proxy send-message to Supabase Edge Function to bypass CORS[\s\S]*?app\.post\('\/api\/send-message'[\s\S]*?\}\);\n/m;
code = code.replace(regex, '');
fs.writeFileSync('server.ts', code);
