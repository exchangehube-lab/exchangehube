const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

if (!code.includes('if (!currentUser) return <div')) {
  code = code.replace(
    '  const currentUser = auth.currentUser;',
    '  const currentUser = auth.currentUser;'
  );
  
  // Actually, we can't put `if (!currentUser) return` before hooks.
  // We have to put it after hooks.
  // Where is a safe place?
}
