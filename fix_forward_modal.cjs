const fs = require('fs');
let code = fs.readFileSync('src/components/ForwardModal.tsx', 'utf8');

code = code.replace(/sender_id/g, 'sender_uid');
code = code.replace(/chat_id:/g, 'conversation_id:');

fs.writeFileSync('src/components/ForwardModal.tsx', code);
