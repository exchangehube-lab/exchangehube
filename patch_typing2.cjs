const fs = require('fs');

let code = fs.readFileSync('src/messaging/services/typingService.ts', 'utf8');
code = code.replace(/chat_id/g, 'conversation_id');
code = code.replace(/chatId/g, 'conversationId');
fs.writeFileSync('src/messaging/services/typingService.ts', code);
