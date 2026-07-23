const fs = require('fs');

function updateFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace("import { supabase, supabaseUrl }", "import { supabase, getSupabaseUrl }");
  code = code.replaceAll("\`${supabaseUrl}/functions/v1/send-message\`", "\`${getSupabaseUrl()}/functions/v1/send-message\`");
  
  fs.writeFileSync(file, code);
}

updateFile('src/ChannelChatPage.tsx');
updateFile('src/PersonalChatWindow.tsx');

console.log("Updated frontend to use getSupabaseUrl");
