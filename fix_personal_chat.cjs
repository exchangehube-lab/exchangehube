const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

const oldCode = `      if (editingMessageId) {
        await personalMessageService.editMessage(editingMessageId, newMessage.trim());
        setEditingMessageId(null);
      } else {
        await personalMessageService.sendMessage({
          chat_id: chatId,
          sender_id: currentUser.uid,
          content: newMessage.trim(),
          reply_to: replyingTo?.id
        });
      }`;

const newCode = `      if (editingMessageId) {
        await personalMessageService.editMessage(editingMessageId, newMessage.trim());
        setEditingMessageId(null);
      } else {
        const idToken = await currentUser.getIdToken();
        const response = await fetch('https://zgqhpgmggadacvwwlshf.supabase.co/functions/v1/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${idToken}\`
          },
          body: JSON.stringify({
            conversation_id: chatId,
            sender_uid: currentUser.uid,
            receiver_uid: targetUserId,
            sender_username: currentUserProfile.username,
            receiver_username: targetUser.username,
            sender_photo: currentUserProfile.photoURL,
            receiver_photo: targetUser.photoURL,
            message: newMessage.trim(),
            message_type: 'text',
            reply_to: replyingTo?.id
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error('Failed to send message: ' + errorText);
        }
      }`;

if (code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync('src/PersonalChatWindow.tsx', code);
  console.log("Patched PersonalChatWindow.tsx successfully");
} else {
  console.log("Old code not found in PersonalChatWindow.tsx");
}
