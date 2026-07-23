const fs = require('fs');

let code = fs.readFileSync('supabase/functions/send-message/index.ts', 'utf8');

code = code.replace(/chat_id/g, 'conversation_id');
code = code.replace(/sender_id: actualSenderId/g, 'sender_uid: actualSenderId');

fs.writeFileSync('supabase/functions/send-message/index.ts', code);
