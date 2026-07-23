const fs = require('fs');

// Fix ChannelChatPage
let channelCode = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');
channelCode = channelCode.replace(/subscribeToChannelTyping\('channel_id',\s*channelId,\s*\(/g, 'subscribeToChannelTyping(channelId, (');
fs.writeFileSync('src/ChannelChatPage.tsx', channelCode);

// Fix PersonalChatWindow
let personalCode = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');
personalCode = personalCode.replace(/subscribeToChatTyping\('conversation_id',\s*chatId,\s*\(/g, 'subscribeToChatTyping(chatId, (');
personalCode = personalCode.replace(/setPresence\(presence\);/g, `setIsTargetOnline(presence?.status === 'online');\n      setTargetLastSeen(presence?.last_seen || null);`);

fs.writeFileSync('src/PersonalChatWindow.tsx', personalCode);

