const fs = require('fs');
let code = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');
const lines = code.split('\n');

const startIndex = lines.findIndex(l => l.includes('{profile?.username?.charAt(0).toUpperCase() || \'?\'}'));

if (startIndex !== -1) {
  // We want to delete the lines containing setForwardingMessage inside this header
  lines.splice(startIndex + 1, 4);
}

// Also add the !isMine forward button properly to ChannelChatPage
const notMineBlock = /\{!isMine && \(\s*<div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">\s*<ReactionPicker onSelect=\{\(emoji\) => handleReaction\(msg\.id, emoji, msg\.reactions\)\} position="right" \/>\s*<button onClick=\{\(\) => setReplyingTo\(msg\)\} className="p-1 rounded-full text-white\/50 hover:bg-white\/10 hover:text-white transition-colors">\s*<Reply className="w-4 h-4" \/>\s*<\/button>\s*\{isAdmin && \(\s*<button onClick=\{\(\) => handlePin\(msg\)\} className="p-1 rounded-full text-white\/50 hover:bg-white\/10 hover:text-white transition-colors">\s*\{msg\.pinned \? <PinOff className="w-4 h-4" \/> : <Pin className="w-4 h-4" \/>\}\s*<\/button>\s*\)\}\s*\{isAdmin && !msg\.deleted_for_all && \(\s*<button onClick=\{\(\) => setMessageToDelete\(msg\)\} className="p-1 rounded-full text-white\/50 hover:bg-white\/10 hover:text-red-400 transition-colors">\s*<Trash2 className="w-3\.5 h-3\.5" \/>\s*<\/button>\s*\)\}\s*<\/div>\s*\)\}/;

const notMineGood = `{!isMine && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <ReactionPicker onSelect={(emoji) => handleReaction(msg.id, emoji, msg.reactions)} position="right" />
                          <button onClick={() => setForwardingMessage(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Forward className="w-4 h-4" />
                          </button>
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

const finalCode = lines.join('\n').replace(notMineBlock, notMineGood);

fs.writeFileSync('src/ChannelChatPage.tsx', finalCode);
