const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

code = code.replaceAll('https://zgqhpgmggadacvwwlshf.supabase.co/functions/v1/send-message', '/api/send-message');

fs.writeFileSync('src/PersonalChatWindow.tsx', code);
console.log("Patched PersonalChatWindow.tsx");
