const fs = require('fs');

// 1. Patch server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
const proxyRoute = `
// Proxy send-message to Supabase Edge Function to bypass CORS
app.post('/api/send-message', async (req, res) => {
  try {
    const response = await fetch('https://zgqhpgmggadacvwwlshf.supabase.co/functions/v1/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error:', errorText);
      return res.status(response.status).json({ error: 'Failed to send message', details: errorText });
    }
    
    // We try to parse json, if it fails, just return success text
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return res.json(data);
    } catch(e) {
      return res.json({ success: true, text });
    }
  } catch (error) {
    console.error('Error proxying message:', error);
    return res.status(500).json({ error: error.message || 'Failed to proxy message' });
  }
});
`;

if (!serverCode.includes('/api/send-message')) {
  serverCode = serverCode.replace('async function startServer()', proxyRoute + '\nasync function startServer()');
  fs.writeFileSync('server.ts', serverCode);
}

// 2. Patch PersonalChatWindow.tsx
let chatCode = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');
chatCode = chatCode.replace('https://zgqhpgmggadacvwwlshf.supabase.co/functions/v1/send-message', '/api/send-message');
fs.writeFileSync('src/PersonalChatWindow.tsx', chatCode);
console.log("Patched server and client");
