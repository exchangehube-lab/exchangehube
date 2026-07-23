const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');
const lines = code.split('\n');

const startIndex = lines.findIndex(l => l.includes('{targetUser?.username?.charAt(0).toUpperCase() || \'?\'}'));

if (startIndex !== -1) {
  // We want to delete the lines containing setForwardingMessage inside this header
  lines.splice(startIndex + 1, 4);
}

fs.writeFileSync('src/PersonalChatWindow.tsx', lines.join('\n'));
