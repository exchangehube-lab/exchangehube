const fs = require('fs');

let code = fs.readFileSync('src/messaging/supabase.ts', 'utf8');

const oldFetch = `const customFetch = async (url: RequestInfo | URL, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  if (currentToken) {
    headers.set('Authorization', \\\`Bearer \\\${currentToken}\\\`);
    headers.set('X-Firebase-Token', currentToken);
  }
  return fetch(url, {
    ...options,
    headers
  });
};`;

const newFetch = `const customFetch = async (url: RequestInfo | URL, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  
  let token = currentToken;
  if (!token && auth.currentUser) {
     try {
       token = await auth.currentUser.getIdToken();
       currentToken = token;
     } catch(e) {}
  }
  
  if (token) {
    headers.set('Authorization', \`Bearer \${token}\`);
    headers.set('X-Firebase-Token', token);
  }
  return fetch(url, {
    ...options,
    headers
  });
};`;

code = code.replace(/const customFetch = async \([\s\S]*?\};\n/, newFetch + "\n");
fs.writeFileSync('src/messaging/supabase.ts', code);
