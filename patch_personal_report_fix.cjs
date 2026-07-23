const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

code = code.replace(
  "reportedUsername={reportingMessage ? (userProfiles[reportingMessage.sender_id]?.username || 'Unknown') : (targetUser?.username || 'Unknown')}",
  "reportedUsername={reportingMessage ? (reportingMessage.sender_id === targetUserId ? targetUser?.username || 'Unknown' : currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Unknown') : (targetUser?.username || 'Unknown')}"
);

fs.writeFileSync('src/PersonalChatWindow.tsx', code);
