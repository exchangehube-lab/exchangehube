const fs = require('fs');
let code = fs.readFileSync('tsconfig.json', 'utf8');

if (!code.includes('"exclude":')) {
  code = code.replace('"include": [', '"exclude": ["supabase/functions"],\n  "include": [');
  fs.writeFileSync('tsconfig.json', code);
  console.log("Excluded supabase functions from tsconfig");
}
