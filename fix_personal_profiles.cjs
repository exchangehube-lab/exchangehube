const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

const targetUserRegex = /userProfiles=\{\{\}\}/;
code = code.replace(targetUserRegex, "userProfiles={{ [targetUserId || '']: targetUser, [currentUser?.uid || '']: { username: currentUser?.displayName || currentUser?.email?.split('@')[0] } }}");

fs.writeFileSync('src/PersonalChatWindow.tsx', code);
