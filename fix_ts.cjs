const fs = require('fs');

// Fix ChannelChatPage
let channelCode = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');
channelCode = channelCode.replace(/typingService\.subscribeToTyping/g, 'typingService.subscribeToChannelTyping');
fs.writeFileSync('src/ChannelChatPage.tsx', channelCode);

// Fix DashboardPages
let dashCode = fs.readFileSync('src/DashboardPages.tsx', 'utf8');
dashCode = dashCode.replace(/presenceService\.updateStatus/g, 'presenceService.updatePresence');
fs.writeFileSync('src/DashboardPages.tsx', dashCode);

// Fix PersonalChatWindow
let personalCode = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');
personalCode = personalCode.replace(/presenceService\.getPresence/g, 'presenceService.getUserPresence');
personalCode = personalCode.replace(/typingService\.subscribeToTyping/g, 'typingService.subscribeToChatTyping');

// Fix the presence subscription callback in PersonalChatWindow
// The old code probably looks like:
// const presenceSub = presenceService.subscribeToPresence(targetUserId, (payload) => {
//   if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
//     setPresence(payload.new as UserPresence);
//   }
// });
// We need to replace it.
const oldPresenceSub = /const presenceSub = presenceService\.subscribeToPresence\([\s\S]*?\}\);/m;
const newPresenceSub = `const presenceSub = presenceService.subscribeToPresence(targetUserId, (presence) => {
      setPresence(presence);
    });`;
personalCode = personalCode.replace(oldPresenceSub, newPresenceSub);
fs.writeFileSync('src/PersonalChatWindow.tsx', personalCode);

