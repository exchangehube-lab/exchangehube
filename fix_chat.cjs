const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

const chatIdDecl = `  const chatId = currentUser && targetUserId 
    ? [currentUser.uid, targetUserId].sort().join('_') 
    : null;`;

code = code.replace(chatIdDecl, "");

code = code.replace("const messagesEndRef = useRef<HTMLDivElement>(null);", "const messagesEndRef = useRef<HTMLDivElement>(null);\n\n" + chatIdDecl);

fs.writeFileSync('src/PersonalChatWindow.tsx', code);
