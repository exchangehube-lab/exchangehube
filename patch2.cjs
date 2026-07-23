const fs = require('fs');

let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

const search = `{msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                    </div>
                    <div className="flex items-center gap-1 mt-1 mx-1">`;
                    
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
                    <div className="flex items-center gap-1 mt-1 mx-1">`;

code = code.replace(search, replacement);
fs.writeFileSync('src/PersonalChatWindow.tsx', code);
