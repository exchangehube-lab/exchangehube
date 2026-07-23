const fs = require('fs');
let code = fs.readFileSync('src/messaging/supabase.ts', 'utf8');

if (!code.includes('limit: () => mockQuery')) {
  code = code.replace('order: () => mockQuery,', 'order: () => mockQuery,\n    limit: () => mockQuery,');
  fs.writeFileSync('src/messaging/supabase.ts', code);
}
