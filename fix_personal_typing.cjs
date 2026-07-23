const fs = require('fs');

let content = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

// Add remoteTypingTimeoutsRef
const targetRef = `  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);`;
const replacementRef = `  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);`;
if (content.includes(targetRef)) {
  content = content.replace(targetRef, replacementRef);
}

// Fix subscription
const subTarget = `    const typingSub = typingService.subscribeToChatTyping(chatId, (payload) => {
      if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && payload.new.uid === targetUserId) {
        setIsTargetTyping(payload.new.is_typing);
      }
    });
    
    return () => {
      typingService.unsubscribe(typingSub);
    };
  }, [chatId, targetUserId]);`;

const subReplacement = `    const typingSub = typingService.subscribeToChatTyping(chatId, (payload) => {
      if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE')) {
        const { uid, is_typing } = payload.new || { uid: payload.old?.uid, is_typing: false };
        if (uid === targetUserId) {
          setIsTargetTyping(is_typing);
          if (is_typing) {
            if (targetTypingTimeoutRef.current) clearTimeout(targetTypingTimeoutRef.current);
            targetTypingTimeoutRef.current = setTimeout(() => {
              setIsTargetTyping(false);
            }, 3000);
          } else {
            if (targetTypingTimeoutRef.current) clearTimeout(targetTypingTimeoutRef.current);
          }
        }
      }
    });
    
    return () => {
      typingService.unsubscribe(typingSub);
      if (targetTypingTimeoutRef.current) clearTimeout(targetTypingTimeoutRef.current);
    };
  }, [chatId, targetUserId]);`;

if (content.includes(subTarget)) {
  content = content.replace(subTarget, subReplacement);
}

// Fix handleTyping
const handleTarget = `  const handleTyping = () => {
    if (!currentUser || !chatId) return;
    typingService.updateTypingStatus(currentUser.uid, true, undefined, chatId).catch(console.error);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      typingService.updateTypingStatus(currentUser.uid, false, undefined, chatId).catch(console.error);
    }, 3000);
  };`;

const handleReplacement = `  const handleTyping = (text: string) => {
    if (!currentUser || !chatId) return;
    
    if (!text.trim()) {
      typingService.updateTypingStatus(currentUser.uid, false, undefined, chatId).catch(console.error);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      return;
    }

    typingService.updateTypingStatus(currentUser.uid, true, undefined, chatId).catch(console.error);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      typingService.updateTypingStatus(currentUser.uid, false, undefined, chatId).catch(console.error);
    }, 2000);
  };

  // Clear typing on unmount
  useEffect(() => {
    return () => {
      if (currentUser && chatId) {
        typingService.updateTypingStatus(currentUser.uid, false, undefined, chatId).catch(console.error);
      }
    };
  }, [currentUser, chatId]);`;

if (content.includes(handleTarget)) {
  content = content.replace(handleTarget, handleReplacement);
}

// Fix onChange
if (content.includes(`onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}`)) {
  content = content.replace(`onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}`, `onChange={(e) => { setNewMessage(e.target.value); handleTyping(e.target.value); }}`);
}

// Fix on Send
const sendTarget = `      setNewMessage('');
      setReplyingTo(null);`;

const sendReplacement = `      setNewMessage('');
      setReplyingTo(null);
      typingService.updateTypingStatus(currentUser.uid, false, undefined, chatId).catch(console.error);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);`;

content = content.replace(sendTarget, sendReplacement);

fs.writeFileSync('src/PersonalChatWindow.tsx', content);
console.log("Success");
