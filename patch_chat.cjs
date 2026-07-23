const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

// Add states
code = code.replace(
  'const [targetUser, setTargetUser] = useState<UserProfile | null>(null);',
  'const [targetUser, setTargetUser] = useState<UserProfile | null>(null);\n  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);\n  const [sendError, setSendError] = useState<string | null>(null);'
);

// Add useEffect for currentUserProfile
const loadTargetProfileEffect = `  useEffect(() => {
    if (!targetUserId) return;
    
    const loadTargetProfile = async () => {`;

const loadCurrentUserProfileEffect = `  useEffect(() => {
    if (!currentUser) return;
    const loadCurrentUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCurrentUserProfile({
            username: data.username || 'Unknown',
            fullName: data.fullName || data.username || 'Unknown User',
            photoURL: data.profilePhotoURL || data.profilePicture || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(data.username || data.fullName || 'U')}&background=random\`
          });
        }
      } catch (err) {
        console.error("Failed to load current user profile", err);
      }
    };
    loadCurrentUserProfile();
  }, [currentUser]);\n\n`;

code = code.replace(loadTargetProfileEffect, loadCurrentUserProfileEffect + loadTargetProfileEffect);

// Replace handleSendMessage
const originalHandleSend = `  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !chatId || !targetUserId) return;

    setSending(true);
    try {
      if (editingMessageId) {
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
      setNewMessage('');
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to send/edit message:", err);
    } finally {
      setSending(false);
    }
  };`;

const newHandleSend = `  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !chatId || !targetUserId || !targetUser || !currentUserProfile) return;

    setSending(true);
    setSendError(null);
    try {
      if (editingMessageId) {
        await personalMessageService.editMessage(editingMessageId, newMessage.trim());
        setEditingMessageId(null);
        setNewMessage('');
      } else {
        const response = await fetch('https://zgqhpgmggadacvwwlshf.supabase.co/functions/v1/send-message', {
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
      }
      setReplyingTo(null);
    } catch (err: any) {
      console.error("Failed to send/edit message:", err);
      setSendError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };`;

code = code.replace(originalHandleSend, newHandleSend);

// Add sendError UI
const uploadErrorUI = `{uploadError && (
            <div className="mb-2 max-w-4xl mx-auto w-full px-4 py-2 bg-red-500/20 text-red-300 text-sm rounded-lg flex items-center justify-between">
              <span>{uploadError}</span>
              <button onClick={() => setUploadError(null)}><X className="w-4 h-4" /></button>
            </div>
          )}`;

const sendErrorUI = `{sendError && (
            <div className="mb-2 max-w-4xl mx-auto w-full px-4 py-2 bg-red-500/20 text-red-300 text-sm rounded-lg flex items-center justify-between">
              <span>{sendError}</span>
              <button onClick={() => setSendError(null)}><X className="w-4 h-4" /></button>
            </div>
          )}\n          ` + uploadErrorUI;

code = code.replace(uploadErrorUI, sendErrorUI);

fs.writeFileSync('src/PersonalChatWindow.tsx', code);
