const fs = require('fs');

function fix(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('getSupabaseUrl')) return;
  
  if (!code.includes("import { getSupabaseUrl } from './messaging/supabase';")) {
    code = code.replace("import { auth, db } from './firebase';", "import { auth, db } from './firebase';\nimport { getSupabaseUrl } from './messaging/supabase';");
    fs.writeFileSync(file, code);
  }
}

fix('src/PersonalChatWindow.tsx');
fix('src/ChannelChatPage.tsx');
console.log("Fixed imports");
