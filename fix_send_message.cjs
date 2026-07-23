const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

const target = `      if (editingMessageId) {
        await personalMessageService.editMessage(editingMessageId, newMessage.trim());
        setEditingMessageId(null);
        setNewMessage('');
      } else {
        const response = await fetch('/api/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
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
            message_type: 'text'
          })
        });

        if (!response.ok) {
          throw new Error('Failed to send message.');
        }
        setNewMessage('');
      }`;

const replacement = `      if (editingMessageId) {
        await personalMessageService.editMessage(editingMessageId, newMessage.trim());
        setEditingMessageId(null);
      } else {
        await personalMessageService.sendMessage({
          chat_id: chatId,
          sender_id: currentUser.uid,
          content: newMessage.trim(),
          reply_to: replyingTo?.id
        });
      }
      setNewMessage('');`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/PersonalChatWindow.tsx', code);
  console.log("Restored personalMessageService.sendMessage");
} else {
  console.log("Target not found");
}
