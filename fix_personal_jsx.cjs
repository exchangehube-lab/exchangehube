const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

const regex = /\{msg\.content && <p className="whitespace-pre-wrap break-words">\{msg\.content\}<\/p>\}\s*<\/div>\s*\{!isMine && \(\s*<div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex items-center gap-1">\s*<ReactionPicker onSelect=\{\(emoji\) => handleReaction\(msg\.id, emoji, msg\.reactions\)\} position="right" \/>\s*<button onClick=\{\(\) => setReplyingTo\(msg\)\} className="p-1 rounded-full text-white\/50 hover:bg-white\/10 hover:text-white transition-colors">\s*<Reply className="w-4 h-4" \/>\s*<\/button>\s*<\/div>\s*\)\}\s*<\/div>/;

const replacement = `{msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                        </div>
                      </div>
                      {!isMine && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <ReactionPicker onSelect={(emoji) => handleReaction(msg.id, emoji, msg.reactions)} position="right" />
                          <button onClick={() => setReplyingTo(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Reply className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/PersonalChatWindow.tsx', code);
