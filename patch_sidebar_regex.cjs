const fs = require('fs');

let content = fs.readFileSync('src/DashboardPages.tsx', 'utf8');

const regex = /          \}\)\}\n        <\/div>\n        <div className="p-6 border-t border-white\/5">/g;
        
const replacementDesktop = `          })}
          
          {joinedChannels.length > 0 && (
            <div className="mt-4 border-t border-white/5 pt-4">
              <div className="px-4 mb-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">Joined Channels</div>
              {joinedChannels.map(channel => (
                <button 
                  key={channel.id}
                  onClick={() => navigate(\`/channels/\${channel.id}/chat\`)}
                  className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all \${location.pathname === \`/channels/\${channel.id}/chat\` ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-[#B8C0D0] hover:bg-white/5 hover:text-white border border-transparent'}\`}
                >
                  <Hash className={\`w-4 h-4 \${location.pathname === \`/channels/\${channel.id}/chat\` ? 'text-purple-400' : 'opacity-50'}\`} />
                  <span className="font-medium text-sm truncate">{channel.channelName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-white/5">`;

let matches = content.match(regex);
console.log("Matches found:", matches ? matches.length : 0);

if (matches && matches.length > 0) {
  content = content.replace(regex, replacementDesktop);
  fs.writeFileSync('src/DashboardPages.tsx', content);
  console.log("Success DashboardPages regex");
} else {
  // Try alternative regex 
  const regex2 = /\}\)\}\s*<\/div>\s*<div className="p-6 border-t border-white\/5">/g;
  let matches2 = content.match(regex2);
  console.log("Matches2 found:", matches2 ? matches2.length : 0);
  if (matches2 && matches2.length > 0) {
    content = content.replace(regex2, replacementDesktop);
    fs.writeFileSync('src/DashboardPages.tsx', content);
    console.log("Success DashboardPages regex2");
  }
}

