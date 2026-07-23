const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const oldFetch = `    const response = await fetch('https://zgqhpgmggadacvwwlshf.supabase.co/functions/v1/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });`;

const newFetch = `    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    const response = await fetch('https://zgqhpgmggadacvwwlshf.supabase.co/functions/v1/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${anonKey}\`
      },
      body: JSON.stringify(req.body)
    });`;

if (serverCode.includes(oldFetch)) {
  serverCode = serverCode.replace(oldFetch, newFetch);
  fs.writeFileSync('server.ts', serverCode);
  console.log("Patched server.ts with Authorization header.");
} else {
  console.log("oldFetch not found in server.ts");
}
