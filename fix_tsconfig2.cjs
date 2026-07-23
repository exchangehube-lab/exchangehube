const fs = require('fs');
let code = fs.readFileSync('tsconfig.json', 'utf8');

if (!code.includes('"exclude":')) {
  code = code.replace('"compilerOptions": {', '"exclude": ["supabase/functions"],\n  "compilerOptions": {');
  fs.writeFileSync('tsconfig.json', code);
  console.log("Excluded supabase functions from tsconfig");
}
