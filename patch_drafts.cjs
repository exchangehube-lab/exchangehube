const fs = require('fs');

function patchPersonal() {
  let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');
  
  const target = `  const [targetLastSeen, setTargetLastSeen] = useState<string | null>(null);
  const [isTargetTyping, setIsTargetTyping] = useState(false);`;
  
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

  code = code.replace(target, target + '\n\n' + draftLogic);
  fs.writeFileSync('src/PersonalChatWindow.tsx', code);
}

function patchChannel() {
  let code = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');
  
  const target = `  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());`;
  
  const draftLogic = `  // --- Draft Logic ---
  useEffect(() => {
    if (channelId) {
      setEditingMessageId(null);
      setReplyingTo(null);
      const draft = localStorage.getItem(\`draft_channel_\${channelId}\`);
      if (draft) {
        setNewMessage(draft);
      } else {
        setNewMessage('');
      }
    }
  }, [channelId]);

  useEffect(() => {
    if (channelId && !sending && !editingMessageId) {
      if (newMessage.trim() === '') {
        localStorage.removeItem(\`draft_channel_\${channelId}\`);
      } else {
        localStorage.setItem(\`draft_channel_\${channelId}\`, newMessage);
      }
    }
  }, [newMessage, channelId, sending, editingMessageId]);
  // -------------------`;

  code = code.replace(target, target + '\n\n' + draftLogic);
  fs.writeFileSync('src/ChannelChatPage.tsx', code);
}

patchPersonal();
patchChannel();
