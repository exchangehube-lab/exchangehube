const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');
code = code.replace(/subscribeToChatTyping\(conversationId,\s*\(/g, 'subscribeToChatTyping(chatId, (');
fs.writeFileSync('src/PersonalChatWindow.tsx', code);
