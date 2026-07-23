const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

const draftLogic = `  // --- Draft Logic ---
  useEffect(() => {
    if (chatId) {
      setEditingMessageId(null);
      setReplyingTo(null);
      const draft = localStorage.getItem(\`draft_personal_\${chatId}\`);
      if (draft) {
        setNewMessage(draft);
      } else {
        setNewMessage('');
      }
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId && !sending && !editingMessageId) {
      if (newMessage.trim() === '') {
        localStorage.removeItem(\`draft_personal_\${chatId}\`);
      } else {
        localStorage.setItem(\`draft_personal_\${chatId}\`, newMessage);
      }
    }
  }, [newMessage, chatId, sending, editingMessageId]);
  // -------------------`;

code = code.replace(draftLogic, '');

const target = `  const chatId = currentUser && targetUserId 
    ? [currentUser.uid, targetUserId].sort().join('_') 
    : null;`;

code = code.replace(target, target + '\n\n' + draftLogic);
fs.writeFileSync('src/PersonalChatWindow.tsx', code);
