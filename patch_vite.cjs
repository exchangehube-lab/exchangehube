const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

if (!code.includes('envPrefix')) {
  code = code.replace(
    'plugins: [react(), tailwindcss()],',
    "envPrefix: ['VITE_', 'SUPABASE_'],\n    plugins: [react(), tailwindcss()],"
  );
  fs.writeFileSync('vite.config.ts', code);
}
