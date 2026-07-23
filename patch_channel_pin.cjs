const fs = require('fs');
let code = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');

// Imports
code = code.replace(
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic, Reply, MessageSquare, Pencil, Trash2 } from 'lucide-react';",
  "import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic, Reply, MessageSquare, Pencil, Trash2, Pin, PinOff } from 'lucide-react';"
);

// Pinned Logic
const handlePin = `
  const handlePin = async (msg: ChannelMessage) => {
    try {
      await channelMessageService.pinMessage(msg.id, !msg.pinned);
    } catch (err) {
      console.error("Failed to pin/unpin message:", err);
    }
  };
`;
code = code.replace("const handleDelete = async () => {", handlePin + "\n\n  const handleDelete = async () => {");

// Add Pin to hover buttons
// In ChannelChatPage, ONLY isAdmin can pin.
// For isMine (on the left side of message):
const isMineButtons = `{isEditable && (
                            <button onClick={() => startEditing(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isAdmin && (
                            <button onClick={() => handlePin(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                              {msg.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          {!msg.deleted_for_all && (
                            <button onClick={() => setMessageToDelete(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}`;
const isMineEdit = /\{isEditable && \(\s*<button onClick=\{\(\) => startEditing\(msg\)\} className="p-1 rounded-full text-white\/50 hover:bg-white\/10 hover:text-white transition-colors">\s*<Pencil className="w-3\.5 h-3\.5" \/>\s*<\/button>\s*\)\}\s*\{!msg\.deleted_for_all && \(\s*<button onClick=\{\(\) => setMessageToDelete\(msg\)\} className="p-1 rounded-full text-white\/50 hover:bg-white\/10 hover:text-red-400 transition-colors">\s*<Trash2 className="w-3\.5 h-3\.5" \/>\s*<\/button>\s*\)\}/;
code = code.replace(isMineEdit, isMineButtons);

// For !isMine (on the right side of message):
const notMineButtons = `{!isMine && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <ReactionPicker onSelect={(emoji) => handleReaction(msg.id, emoji, msg.reactions)} position="right" />
                          <button onClick={() => setReplyingTo(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Reply className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button onClick={() => handlePin(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                              {msg.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                            </button>
                          )}
                          {isAdmin && !msg.deleted_for_all && (
                            <button onClick={() => setMessageToDelete(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}`;
const notMineBlock = /\{!isMine && \(\s*<div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">\s*<ReactionPicker onSelect=\{\(emoji\) => handleReaction\(msg\.id, emoji, msg\.reactions\)\} position="right" \/>\s*<button onClick=\{\(\) => setReplyingTo\(msg\)\} className="p-1 rounded-full text-white\/50 hover:bg-white\/10 hover:text-white transition-colors">\s*<Reply className="w-4 h-4" \/>\s*<\/button>\s*\{isAdmin && !msg\.deleted_for_all && \(\s*<button onClick=\{\(\) => setMessageToDelete\(msg\)\} className="p-1 rounded-full text-white\/50 hover:bg-white\/10 hover:text-red-400 transition-colors">\s*<Trash2 className="w-3\.5 h-3\.5" \/>\s*<\/button>\s*\)\}\s*<\/div>\s*\)\}/;
code = code.replace(notMineBlock, notMineButtons);


// Show a pin icon in the message if it's pinned
// Find timeString and add pin icon
const timeStringRegex = /<span className="text-\[10px\] text-white\/40 mt-1 mx-1">\{timeString\}\{msg\.edited && ' \(Edited\)'\}<\/span>/;
const newTimeString = `<span className="text-[10px] text-white/40 mt-1 mx-1 flex items-center gap-1">{msg.pinned && <Pin className="w-2.5 h-2.5 text-purple-400" />}{timeString}{msg.edited && ' (Edited)'}</span>`;
code = code.replace(timeStringRegex, newTimeString);


// Add Pinned Messages section below header
const headerEndRegex = /<\/div>\s*\{\/\* Messages \*\/\}/;

const pinnedSection = `</div>

        {/* Pinned Messages */}
        {messages.some(m => m.pinned) && (
          <div className="bg-[#1A1D2D] border-b border-white/10 px-6 py-2 flex flex-col gap-2 shrink-0 z-10">
            <div className="text-xs font-semibold text-purple-400 flex items-center gap-1">
              <Pin className="w-3 h-3" /> Pinned Messages
            </div>
            <div className="flex flex-row overflow-x-auto gap-2 pb-1 scrollbar-hide">
              {messages.filter(m => m.pinned).map(msg => {
                const profile = userProfiles[msg.sender_id];
                return (
                  <div 
                    key={msg.id} 
                    onClick={() => scrollToMessage(msg.id)}
                    className="bg-white/5 hover:bg-white/10 cursor-pointer p-2 rounded-lg min-w-[200px] max-w-[250px] shrink-0 border border-white/5 transition-colors"
                  >
                    <div className="text-[10px] text-white/40 mb-1 truncate">
                      {msg.sender_id === currentUser?.uid ? 'You' : profile?.username || 'user'}
                    </div>
                    <div className="text-xs text-white/80 truncate">
                      {msg.deleted_for_all ? <span className="italic opacity-60">Message deleted</span> : getReplyPreview(msg)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages */}`;

code = code.replace(headerEndRegex, pinnedSection);

fs.writeFileSync('src/ChannelChatPage.tsx', code);
