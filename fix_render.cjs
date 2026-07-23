const fs = require('fs');

const p = 'src/PersonalChatWindow.tsx';
let content = fs.readFileSync(p, 'utf8');

const regex = /\{isTargetOnline \? \([\s\S]*?\) : targetLastSeen \? \([\s\S]*?\) : null\}/;

const replacement = `{isTargetOnline ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    <span className="text-xs text-gray-400">Offline</span>
                    {targetLastSeen && <span className="text-[10px] text-white/40 ml-1">- Last seen: {new Date(targetLastSeen).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>}
                  </div>
                )}`;

content = content.replace(regex, replacement);
fs.writeFileSync(p, content);
