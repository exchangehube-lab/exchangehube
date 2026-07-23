const fs = require('fs');
let code = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');
code = code.replace(/user_id, is_typing/g, 'uid, is_typing');
code = code.replace(/newSet\.add\(user_id\)/g, 'newSet.add(uid)');
code = code.replace(/newSet\.delete\(user_id\)/g, 'newSet.delete(uid)');
fs.writeFileSync('src/ChannelChatPage.tsx', code);
