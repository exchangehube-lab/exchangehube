const fs = require('fs');
let content = fs.readFileSync('src/AdminPages.tsx', 'utf-8');

if (!content.includes("import { BotViewModal }")) {
  content = `import { BotViewModal } from './BotViewModal';\n` + content;
}

const botsMapStart = content.indexOf('{bots.map(bot => (');
const botsMapEnd = content.indexOf('</div>\n            ))}');
if (botsMapStart !== -1 && botsMapEnd !== -1) {
  const adminBotsCard = `{bots.map(bot => (
              <div key={bot.id} className="bg-[#070b1a] border border-white/5 rounded-3xl p-6 relative group overflow-hidden hover:border-purple-500/30 transition-all flex flex-col h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                
                <div className="flex flex-col items-center mb-6 relative z-10">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden mb-4 shadow-xl">
                    {bot.botImageURL ? (
                      <img src={bot.botImageURL} alt={bot.botName} className="w-full h-full object-cover" />
                    ) : (
                      <Cpu className="w-10 h-10 text-purple-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white text-center mb-2">{bot.botName}</h3>
                  {bot.description && (
                    <p className="text-sm text-[#B8C0D0] text-center line-clamp-2 w-full max-w-xs">
                      {bot.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 text-sm flex-1 relative z-10 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mine</span>
                    <span className="font-medium text-white">{bot.category || '-'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mining Type</span>
                    <span className="font-medium text-white">{bot.accessType || '-'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Currency</span>
                    <span className="font-medium text-white">{bot.botCurrency || '-'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Submitted</span>
                    <span className="font-medium text-white">{bot.createdAt?.toDate ? bot.createdAt.toDate().toLocaleDateString() : 'Unknown'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                    {bot.ownerProfilePicture ? (
                      <img src={bot.ownerProfilePicture} alt={bot.ownerUsername} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-[#B8C0D0]" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Publisher</span>
                    <span className="text-sm font-medium text-white truncate max-w-[120px]">{bot.ownerUsername || 'Unknown'}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 relative z-10 mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handlePublish(bot.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 hover:border-green-500/30 rounded-xl transition-all font-medium text-sm"
                    >
                      <Check className="w-4 h-4" /> Publish
                    </button>
                    <button 
                      onClick={() => setRejectDialogBotId(bot.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all font-medium text-sm"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                  <button
                    onClick={() => setViewingBot(bot)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-medium text-sm"
                  >
                    <Eye className="w-4 h-4" /> View
                  </button>
                </div>
`;
  content = content.substring(0, botsMapStart) + adminBotsCard + content.substring(botsMapEnd);
  
  // Update to grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
  content = content.replace(/<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">/, '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">');
  
  // Add viewingBot state to AdminBotRequestsPage
  const adminFnMatch = content.match(/export function AdminBotRequestsPage\(\) \{\s*const \[bots, setBots\] = useState<any\[\]>\(\[\]\);/);
  if (adminFnMatch) {
    content = content.replace(adminFnMatch[0], `${adminFnMatch[0]}\n  const [viewingBot, setViewingBot] = useState<any | null>(null);`);
  }
  
  const adminLayoutEnd = content.indexOf('</AdminLayout>', content.indexOf('export function AdminBotRequestsPage'));
  if (adminLayoutEnd !== -1) {
    content = content.substring(0, adminLayoutEnd) + `\n      {viewingBot && <BotViewModal bot={viewingBot} onClose={() => setViewingBot(null)} />}\n    ` + content.substring(adminLayoutEnd);
  }
}

fs.writeFileSync('src/AdminPages.tsx', content);
console.log('updated AdminPages.tsx bots cards');
