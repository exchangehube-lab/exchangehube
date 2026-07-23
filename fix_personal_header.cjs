const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

const badPart = `{targetUser?.username?.charAt(0).toUpperCase() || '?'}
                          <button onClick={() => setForwardingMessage(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Forward className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>`;

const goodPart = `{targetUser?.username?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>`;

code = code.replace(badPart, goodPart);

// Now I need to add the !isMine forward button properly.
// The !isMine block is around ReactionPicker for !isMine.
const notMineBlock = /\{!isMine && \(\s*<div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">\s*<ReactionPicker onSelect=\{\(emoji\) => handleReaction\(msg\.id, emoji, msg\.reactions\)\} position="right" \/>\s*<button onClick=\{\(\) => handlePin\(msg\)\} className="p-1 rounded-full text-white\/50 hover:bg-white\/10 hover:text-white transition-colors">\s*\{msg\.pinned \? <PinOff className="w-4 h-4" \/> : <Pin className="w-4 h-4" \/>\}\s*<\/button>\s*<button onClick=\{\(\) => setReplyingTo\(msg\)\} className="p-1 rounded-full text-white\/50 hover:bg-white\/10 hover:text-white transition-colors">\s*<Reply className="w-4 h-4" \/>\s*<\/button>\s*<\/div>\s*\)\}/;

const notMineGood = `{!isMine && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <ReactionPicker onSelect={(emoji) => handleReaction(msg.id, emoji, msg.reactions)} position="right" />
                          <button onClick={() => setForwardingMessage(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Forward className="w-4 h-4" />
                          </button>
                          <button onClick={() => handlePin(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            {msg.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setReplyingTo(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Reply className="w-4 h-4" />
                          </button>
                        </div>
                      )}`;

code = code.replace(notMineBlock, notMineGood);

fs.writeFileSync('src/PersonalChatWindow.tsx', code);
