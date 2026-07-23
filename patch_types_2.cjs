const fs = require('fs');
let code = fs.readFileSync('src/messaging/types.ts', 'utf8');

code = code.replace(/chat_id\?: string;/g, 'conversation_id?: string;');

fs.writeFileSync('src/messaging/types.ts', code);
