const fs = require('fs');

function updateFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('import { supabaseUrl }')) {
    code = code.replace("import { supabase } from './messaging/supabase';", "import { supabase, supabaseUrl } from './messaging/supabase';");
    code = code.replace("import { supabase } from '../messaging/supabase';", "import { supabase, supabaseUrl } from '../messaging/supabase';");
  }
  
  code = code.replaceAll("'https://zgqhpgmggadacvwwlshf.supabase.co/functions/v1/send-message'", "\`${supabaseUrl}/functions/v1/send-message\`");
  
  fs.writeFileSync(file, code);
}

updateFile('src/ChannelChatPage.tsx');
updateFile('src/PersonalChatWindow.tsx');

console.log("Updated frontend to use dynamic supabaseUrl");
