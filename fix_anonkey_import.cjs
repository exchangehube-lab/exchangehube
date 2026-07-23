const fs = require('fs');

function fix(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes('getSupabaseAnonKey')) {
    if (!code.includes('import { supabase, getSupabaseUrl, getSupabaseAnonKey }')) {
      code = code.replace("import { supabase, getSupabaseUrl }", "import { supabase, getSupabaseUrl, getSupabaseAnonKey }");
      code = code.replace("import { getSupabaseUrl }", "import { getSupabaseUrl, getSupabaseAnonKey }");
      fs.writeFileSync(file, code);
    }
  }
}

fix('src/ChannelChatPage.tsx');
fix('src/PersonalChatWindow.tsx');
