const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

// Imports
code = code.replace(
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic } from 'lucide-react';",
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic, Reply, MessageSquare } from 'lucide-react';"
);

// State
code = code.replace(
  "const [isRecordingVoice, setIsRecordingVoice] = useState(false);",
  "const [isRecordingVoice, setIsRecordingVoice] = useState(false);\n  const [replyingTo, setReplyingTo] = useState<PersonalMessage | null>(null);"
);

// Update handleSendMessage
code = code.replace(
  "content: newMessage.trim(),",
  "content: newMessage.trim(),\n        reply_to: replyingTo?.id,"
);
code = code.replace(
  "setNewMessage('');",
  "setNewMessage('');\n      setReplyingTo(null);"
);

// Update handleVoiceSend
code = code.replace(
  "voice_duration: duration",
  "voice_duration: duration,\n        reply_to: replyingTo?.id"
);
code = code.replace(
  "setUploadProgress(0);",
  "setUploadProgress(0);\n      setReplyingTo(null);"
);

// Update handleFileSelect
code = code.replace(
  "file_size: file.size || result.bytes",
  "file_size: file.size || result.bytes,\n        reply_to: replyingTo?.id"
);

// Scroll to message
const scrollLogic = `
  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(\`msg-\${msgId}\`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-purple-500', 'ring-offset-2', 'ring-offset-[#0B0F19]', 'transition-all', 'duration-500');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-purple-500', 'ring-offset-2', 'ring-offset-[#0B0F19]');
      }, 1500);
    }
  };
  
  const getReplyPreview = (msg: PersonalMessage) => {
    if (msg.content) return msg.content;
    if (msg.message_type === 'image') return 'Photo';
    if (msg.message_type === 'video') return 'Video';
    if (msg.message_type === 'voice') return 'Voice Message';
    if (msg.message_type === 'file' || msg.file_url) return msg.file_name || 'File';
    return 'Message';
  };
`;
code = code.replace("const handleReaction = async", scrollLogic + "\n\n  const handleReaction = async");

// Render UI for message wrapper
code = code.replace(
  /<div key=\{msg.id\} className=\{`flex gap-3 \$\{isMine \? 'flex-row-reverse' : 'flex-row'\}`\}>/,
  "<div key={msg.id} id={`msg-${msg.id}`} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>"
);

// Render UI for reply button and replied message
const renderReplyStr = `
                    <div className="flex items-center gap-2">
                      {isMine && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button onClick={() => setReplyingTo(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Reply className="w-4 h-4" />
                          </button>
                          <ReactionPicker onSelect={(emoji) => handleReaction(msg.id, emoji, msg.reactions)} position="left" />
                        </div>
                      )}
                      <div className={\`flex flex-col \${isMine ? 'items-end' : 'items-start'}\`}>
                        {msg.reply_to && messages.find(m => m.id === msg.reply_to) && (
                          <div 
                            onClick={() => scrollToMessage(msg.reply_to!)}
                            className={\`cursor-pointer mb-1 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 max-w-sm \${
                              isMine ? 'bg-white/10 text-white/70 mr-1' : 'bg-purple-500/20 text-purple-200 ml-1'
                            }\`}
                          >
                            <Reply className="w-3 h-3 shrink-0" />
                            <span className="truncate">{getReplyPreview(messages.find(m => m.id === msg.reply_to)!)}</span>
                          </div>
                        )}
                        <div className={\`px-4 py-2 rounded-2xl \${
                          isMine 
                            ? 'bg-purple-600 text-white rounded-br-none' 
                            : 'bg-white/10 text-white rounded-bl-none'
                        }\`}>
`;
const oldStr = /<div className="flex items-center gap-2">\s*\{isMine && \(\s*<div className="opacity-0 group-hover:opacity-100 transition-opacity">\s*<ReactionPicker onSelect=\{\(emoji\) => handleReaction\(msg\.id, emoji, msg\.reactions\)\} position="left" \/>\s*<\/div>\s*\)\}\s*<div className=\{`px-4 py-2 rounded-2xl \$\{\s*isMine \s*\? 'bg-purple-600 text-white rounded-br-none' \s*: 'bg-white\/10 text-white rounded-bl-none'\s*\}`\}>/;
code = code.replace(oldStr, renderReplyStr);

const renderReplyRightStr = `
                    {!isMine && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex items-center gap-1">
                        <ReactionPicker onSelect={(emoji) => handleReaction(msg.id, emoji, msg.reactions)} position="right" />
                        <button onClick={() => setReplyingTo(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                          <Reply className="w-4 h-4" />
                        </button>
                      </div>
                    )}
`;
const oldRightStr = /\{!isMine && \(\s*<div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">\s*<ReactionPicker onSelect=\{\(emoji\) => handleReaction\(msg\.id, emoji, msg\.reactions\)\} position="right" \/>\s*<\/div>\s*\)\}/;
code = code.replace(oldRightStr, renderReplyRightStr);

// Input Area for Replying
const inputReplyUI = `
        {/* Input Area */}
        <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-md shrink-0">
          
          {replyingTo && (
            <div className="max-w-4xl mx-auto w-full mb-2 bg-[#1A1D2D]/80 border border-white/10 rounded-xl p-3 flex items-start justify-between">
              <div className="flex flex-col min-w-0">
                <div className="text-xs text-purple-400 font-medium flex items-center gap-1.5 mb-1">
                  <Reply className="w-3 h-3" />
                  Replying to {replyingTo.sender_id === currentUser?.uid ? 'yourself' : targetUser?.username || 'user'}
                </div>
                <div className="text-sm text-white/70 truncate">
                  {getReplyPreview(replyingTo)}
                </div>
              </div>
              <button 
                onClick={() => setReplyingTo(null)}
                className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
`;
const oldInputArea = /\{\/\* Input Area \*\/\}\s*<div className="p-4 bg-white\/5 border-t border-white\/10 backdrop-blur-md shrink-0">/;
code = code.replace(oldInputArea, inputReplyUI);

// Check if we need to close one more div for `div className="flex flex-col..."` around the bubble in Render Group Hover UI
const closingDivSearch = `{msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                    </div>
                    {!isMine && (`;
const closingDivRepl = `{msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                        </div>
                      </div>
                    {!isMine && (`;
code = code.replace(closingDivSearch, closingDivRepl);

fs.writeFileSync('src/PersonalChatWindow.tsx', code);
