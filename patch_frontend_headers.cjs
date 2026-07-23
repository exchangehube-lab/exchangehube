const fs = require('fs');

function updateFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (code.includes('import { supabase, getSupabaseUrl }')) {
    code = code.replace('import { supabase, getSupabaseUrl }', 'import { supabase, getSupabaseUrl, getSupabaseAnonKey }');
  }
  
  code = code.replaceAll("'Authorization': `Bearer ${idToken}`", "'Authorization': `Bearer ${getSupabaseAnonKey()}`,\n          'X-Firebase-Token': idToken");
  
  fs.writeFileSync(file, code);
}

updateFile('src/ChannelChatPage.tsx');
updateFile('src/PersonalChatWindow.tsx');

console.log("Updated frontend headers to use X-Firebase-Token");
