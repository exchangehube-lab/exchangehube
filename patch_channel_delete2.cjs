const fs = require('fs');
let code = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');

// Inside isMine hover
const isMineEdit = /\{isEditable && \(\s*<button onClick=\{\(\) => startEditing\(msg\)\} className="p-1 rounded-full text-white\/50 hover:bg-white\/10 hover:text-white transition-colors">\s*<Pencil className="w-3\.5 h-3\.5" \/>\s*<\/button>\s*\)\}/;
const isMineNew = `{isEditable && (
                            <button onClick={() => startEditing(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {!msg.deleted_for_all && (
                            <button onClick={() => setMessageToDelete(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}`;
code = code.replace(isMineEdit, isMineNew);


// Inside !isMine hover
const notMineBlock = /\{!isMine && \(\s*<div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">\s*<ReactionPicker onSelect=\{\(emoji\) => handleReaction\(msg\.id, emoji, msg\.reactions\)\} position="right" \/>\s*<button onClick=\{\(\) => setReplyingTo\(msg\)\} className="p-1 rounded-full text-white\/50 hover:bg-white\/10 hover:text-white transition-colors">\s*<Reply className="w-4 h-4" \/>\s*<\/button>\s*<\/div>\s*\)\}/;
const notMineNew = `{!isMine && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <ReactionPicker onSelect={(emoji) => handleReaction(msg.id, emoji, msg.reactions)} position="right" />
                          <button onClick={() => setReplyingTo(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Reply className="w-4 h-4" />
                          </button>
                          {isAdmin && !msg.deleted_for_all && (
                            <button onClick={() => setMessageToDelete(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}`;
code = code.replace(notMineBlock, notMineNew);


// Style deleted_for_all message
const contentRegex = /\{msg\.content && <p className="whitespace-pre-wrap break-words">\{msg\.content\}<\/p>\}/;
const newContent = `{msg.content && <p className={\`whitespace-pre-wrap break-words \${msg.deleted_for_all ? 'italic opacity-60' : ''}\`}>{msg.content}</p>}`;
code = code.replace(contentRegex, newContent);


// Add confirmation Modal
const modalUI = `
      {/* Delete Confirmation Modal */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1A1D2D] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Delete Message</h3>
            <p className="text-white/70 mb-6 text-sm">Are you sure you want to delete this message? This will remove it for everyone in the channel.</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleDelete}
                className="w-full py-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl font-medium transition-colors"
              >
                Delete for Everyone
              </button>
              <button 
                onClick={() => setMessageToDelete(null)}
                className="w-full py-3 mt-2 text-white/50 hover:text-white transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
`;

code = code.replace(/<\/DashboardLayout>/, modalUI);

fs.writeFileSync('src/ChannelChatPage.tsx', code);
