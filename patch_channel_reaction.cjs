const fs = require('fs');

let code = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');

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
    
    const usersForEmoji = newReactions[emoji] || [];
    if (usersForEmoji.includes(uid)) {
      newReactions[emoji] = usersForEmoji.filter(id => id !== uid);
      if (newReactions[emoji].length === 0) delete newReactions[emoji];
    } else {
      newReactions[emoji] = [...usersForEmoji, uid];
    }

    try {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: newReactions } : m));
      await channelMessageService.updateReactions(messageId, newReactions);
    } catch (err) {
      console.error('Failed to update reaction:', err);
    }
  };
`;
code = code.replace("const handleSendMessage = async", handleReaction + "\n\n  const handleSendMessage = async");

// Render Group Hover UI
const renderUI = `
                  <div className={\`flex flex-col \${isMine ? 'items-end' : 'items-start'} max-w-[75%] group\`}>
                    {!isMine && (
                      <span className="text-xs text-[#B8C0D0] mb-1 ml-1">{profile?.username || 'Loading...'}</span>
                    )}
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
//   {!isMine && (
//     <span className="text-xs text-[#B8C0D0] mb-1 ml-1">{profile?.username || 'Loading...'}</span>
//   )}
//   <div className={`px-4 py-2 rounded-2xl ${

const searchStr = /<div className=\{`flex flex-col \$\{isMine \? 'items-end' : 'items-start'\} max-w-\[75%\]`\}>\s*\{!isMine && \(\s*<span className="text-xs text-\[#B8C0D0\] mb-1 ml-1">\{profile\?\.username \|\| 'Loading\.\.\.'\}<\/span>\s*\)\}\s*<div className=\{`px-4 py-2 rounded-2xl \$\{/;
code = code.replace(searchStr, renderUI);

const regex = /\{msg\.content && <p className="whitespace-pre-wrap break-words">\{msg\.content\}<\/p>\}\s*<\/div>\s*<span className="text-\[10px\] text-white\/40 mt-1 mx-1">\{timeString\}<\/span>/;

const replacement = `{msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
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
                    <span className="text-[10px] text-white/40 mt-1 mx-1">{timeString}</span>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/ChannelChatPage.tsx', code);
