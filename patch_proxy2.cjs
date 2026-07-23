const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const proxyCode = `
// Proxy send-message to Supabase Edge Function to bypass CORS during development
app.post('/api/send-message', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const response = await fetch('https://zgqhpgmggadacvwwlshf.supabase.co/functions/v1/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error:', errorText);
      return res.status(response.status).json({ error: 'Failed to send message', details: errorText });
    }
    
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

if (!code.includes("app.post('/api/send-message'")) {
  code = code.replace('async function startServer() {', proxyCode + '\nasync function startServer() {');
  fs.writeFileSync('server.ts', code);
  console.log("Added proxy to server.ts");
} else {
  console.log("Proxy already exists in server.ts");
}
