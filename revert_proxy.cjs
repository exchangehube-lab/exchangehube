const fs = require('fs');

let channelCode = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');
channelCode = channelCode.replaceAll('/api/send-message', 'https://zgqhpgmggadacvwwlshf.supabase.co/functions/v1/send-message');
fs.writeFileSync('src/ChannelChatPage.tsx', channelCode);

let personalCode = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');
personalCode = personalCode.replaceAll('/api/send-message', 'https://zgqhpgmggadacvwwlshf.supabase.co/functions/v1/send-message');
fs.writeFileSync('src/PersonalChatWindow.tsx', personalCode);

console.log("Reverted frontend to use Edge function directly.");
