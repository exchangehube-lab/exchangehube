const fs = require('fs');

let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

// Imports
code = code.replace(
  "import { VoiceRecorder, VoicePlayer } from './components/VoiceMessage';",
  "import { VoiceRecorder, VoicePlayer } from './components/VoiceMessage';\nimport { ReactionPicker, ReactionDisplay } from './components/ReactionPicker';"
);

// handleReaction
const handleReaction = `
  const handleReaction = async (messageId: string, emoji: string, currentReactions: Record<string, string[]> = {}) => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const newReactions = { ...currentReactions };
    
    // Toggle logic
    const usersForEmoji = newReactions[emoji] || [];
    if (usersForEmoji.includes(uid)) {
      newReactions[emoji] = usersForEmoji.filter(id => id !== uid);
      if (newReactions[emoji].length === 0) delete newReactions[emoji];
    } else {
      // Find if user reacted with any other emoji and remove it if we only want one reaction per user
      // But usually multiple reactions are allowed, or one per emoji. Let's just toggle this specific emoji.
      newReactions[emoji] = [...usersForEmoji, uid];
    }

    try {
      // Optimistic update
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: newReactions } : m));
      await personalMessageService.updateReactions(messageId, newReactions);
    } catch (err) {
      console.error('Failed to update reaction:', err);
    }
  };
`;
code = code.replace("const handleSendMessage = async", handleReaction + "\n\n  const handleSendMessage = async");

// Render
const renderUI = `
                  <div className={\`flex flex-col \${isMine ? 'items-end' : 'items-start'} max-w-[75%] group\`}>
                    <div className="flex items-center gap-2">
                      {isMine && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ReactionPicker onSelect={(emoji) => handleReaction(msg.id, emoji, msg.reactions)} position="left" />
                        </div>
                      )}
                      <div className={\`px-4 py-2 rounded-2xl \${
                        isMine 
                          ? 'bg-purple-600 text-white rounded-br-none' 
                          : 'bg-white/10 text-white rounded-bl-none'
                      }\`}>
`;

// It replaces:
// <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[75%]`}>
//   <div className={`px-4 py-2 rounded-2xl ${
//     isMine 
//       ? 'bg-purple-600 text-white rounded-br-none' 
//       : 'bg-white/10 text-white rounded-bl-none'
//   }`}>

const searchStr = '<div className={`flex flex-col ${isMine ? \'items-end\' : \'items-start\'} max-w-[75%]`}>\n                    <div className={`px-4 py-2 rounded-2xl ${\n                      isMine \n                        ? \'bg-purple-600 text-white rounded-br-none\' \n                        : \'bg-white/10 text-white rounded-bl-none\'\n                    }`}>';

code = code.replace(searchStr, renderUI);

const afterMsg = `
                      {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                    </div>
                    {!isMine && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                        <ReactionPicker onSelect={(emoji) => handleReaction(msg.id, emoji, msg.reactions)} position="right" />
                      </div>
                    )}
                    </div>
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && currentUser && (
                      <div className={\`\${isMine ? 'mr-2' : 'ml-2'}\`}>
                        <ReactionDisplay 
                          reactions={msg.reactions} 
                          currentUserId={currentUser.uid} 
                          onToggle={(emoji) => handleReaction(msg.id, emoji, msg.reactions)} 
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-1 mx-1">
`;

// It replaces:
// {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
// </div>
// <div className="flex items-center gap-1 mt-1 mx-1">

const searchStr2 = '{msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}\n                    </div>\n                    <div className="flex items-center gap-1 mt-1 mx-1">';

code = code.replace(searchStr2, afterMsg);

fs.writeFileSync('src/PersonalChatWindow.tsx', code);

