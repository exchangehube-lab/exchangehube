const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.get\('\*', \(req, res\) => \{\s*res\.sendFile\(path\.join\(distPath, 'index\.html'\)\);\s*\}\);/;

const replace = `app.get('*', async (req, res) => {
      try {
        let html = await require('fs').promises.readFile(path.join(distPath, 'index.html'), 'utf-8');
        const envScript = \`<script>window.__ENV__ = \${JSON.stringify({
          SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
          SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
        })}</script>\`;
        html = html.replace('<head>', '<head>' + envScript);
        res.send(html);
      } catch (err) {
        res.status(500).send('Error loading index.html');
      }
    });`;

if (regex.test(code)) {
  code = code.replace(regex, replace);
  // Also need to stop express.static from serving index.html automatically
  code = code.replace("app.use(express.static(distPath));", "app.use(express.static(distPath, { index: false }));");
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts successfully");
} else {
  console.log("Regex failed in server.ts");
}
