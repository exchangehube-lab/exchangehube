const fs = require('fs');

let code = fs.readFileSync('src/messaging/services/personalMessageService.ts', 'utf8');

code = code.replace(/chat_id/g, 'conversation_id');
code = code.replace(/sender_id/g, 'sender_uid');

fs.writeFileSync('src/messaging/services/personalMessageService.ts', code);
console.log("Patched personalMessageService.ts");
