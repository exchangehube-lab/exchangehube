const fs = require('fs');

let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');
code = code.replace(/subscribeToChatTyping\(chatId,\s*\(/g, 'subscribeToChatTyping(conversationId, (');
fs.writeFileSync('src/PersonalChatWindow.tsx', code);
