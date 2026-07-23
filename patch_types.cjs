const fs = require('fs');
let code = fs.readFileSync('src/messaging/types.ts', 'utf8');

code = code.replace(/sender_id: string;/g, 'sender_uid: string;');
code = code.replace(/chat_id: string;/g, 'conversation_id: string;');
code = code.replace(/user_id: string;/g, 'uid: string;');

fs.writeFileSync('src/messaging/types.ts', code);
console.log("Patched types.ts");
