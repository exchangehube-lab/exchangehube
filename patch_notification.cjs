const fs = require('fs');
let code = fs.readFileSync('src/messaging/services/notificationService.ts', 'utf8');
code = code.replace(/user_id/g, 'uid');
fs.writeFileSync('src/messaging/services/notificationService.ts', code);
console.log("Patched notificationService.ts");
