const fs = require('fs');

let code = fs.readFileSync('src/messaging/services/channelMessageService.ts', 'utf8');

code = code.replace(/sender_id/g, 'sender_uid');

fs.writeFileSync('src/messaging/services/channelMessageService.ts', code);
console.log("Patched channelMessageService.ts");
