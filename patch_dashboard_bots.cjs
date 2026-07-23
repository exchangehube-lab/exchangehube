const fs = require('fs');
let content = fs.readFileSync('src/DashboardPages.tsx', 'utf-8');

if (!content.includes("import { BotViewModal }")) {
  content = content.replace(/import \{([^}]+)\} from 'lucide-react';/, "import {$1, ExternalLink } from 'lucide-react';");
  content = `import { BotViewModal } from './BotViewModal';\n` + content;
}

// 1. Update TrendingBotsPage
const trendingMapStart = content.indexOf('{filteredBots.map((bot) => (');
const trendingMapEnd = content.indexOf('</a>', trendingMapStart) + 4;
if (trendingMapStart !== -1 && trendingMapEnd !== -1) {
  const trendingCard = `{filteredBots.map((bot) => (
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

                <div className="flex gap-3 relative z-10 mt-auto pt-4 border-t border-white/5">
                  <button
                    onClick={() => setViewingBot(bot)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-medium text-sm"
                  >
                    <Eye className="w-4 h-4" /> View
                  </button>
                  <a 
                    href={bot.botLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
                  >
                    <ExternalLink className="w-4 h-4" /> Open
                  </a>
                </div>
              </div>
            ))}`;
  
  content = content.substring(0, trendingMapStart) + trendingCard + content.substring(trendingMapEnd);
  
  // Add viewingBot state to TrendingBotsPage
  const trendingFnMatch = content.match(/export function TrendingBotsPage\(\) \{\s*const \[bots, setBots\] = useState<any\[\]>\(\[\]\);/);
  if (trendingFnMatch) {
    content = content.replace(trendingFnMatch[0], `${trendingFnMatch[0]}\n  const [viewingBot, setViewingBot] = useState<any | null>(null);`);
  }
  
  const trendingLayoutEnd = content.indexOf('</DashboardLayout>');
  if (trendingLayoutEnd !== -1) {
    content = content.substring(0, trendingLayoutEnd) + `\n      {viewingBot && <BotViewModal bot={viewingBot} onClose={() => setViewingBot(null)} />}\n    ` + content.substring(trendingLayoutEnd);
  }
}

// 2. Update PublishBotPage My Bots list
const myBotsStart = content.indexOf('{myBots.map(bot => (');
const myBotsEnd = content.indexOf('</div>\n                ))}');
if (myBotsStart !== -1 && myBotsEnd !== -1) {
  const myBotsCard = `{myBots.map(bot => (
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

                    <div className="flex gap-3 relative z-10 mt-auto pt-4 border-t border-white/5">
                      <button 
                        onClick={() => {
                          setActiveTab('Publish');
                          setEditingBotId(bot.id);
                          setName(bot.botName || '');
                          setLink(bot.botLink || '');
                          setDescription(bot.description || '');
                          setCategory(bot.category || '');
                          setAccessType(bot.accessType || '');
                          setBotCurrency(bot.botCurrency || '');
                          setLogoPreview(bot.botImageURL || '');
                          setLogoFile(null);
                          setMessage('');
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setViewingBot(bot)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-medium text-sm"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                    </div>
`;
  
  content = content.substring(0, myBotsStart) + myBotsCard + content.substring(myBotsEnd);
  
  // Need to change wrapper class to grid
  content = content.replace(/<div className="grid gap-4">/, '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">');
  
  // Add viewingBot state to PublishBotPage
  const publishFnMatch = content.match(/export function PublishBotPage\(\) \{\s*const \[activeTab, setActiveTab\] = useState<'Publish' \| 'List'>\('Publish'\);/);
  if (publishFnMatch) {
    content = content.replace(publishFnMatch[0], `${publishFnMatch[0]}\n  const [viewingBot, setViewingBot] = useState<any | null>(null);`);
  }
  
  const publishLayoutEnd = content.indexOf('</DashboardLayout>', content.indexOf('export function PublishBotPage'));
  if (publishLayoutEnd !== -1) {
    content = content.substring(0, publishLayoutEnd) + `\n      {viewingBot && <BotViewModal bot={viewingBot} onClose={() => setViewingBot(null)} />}\n    ` + content.substring(publishLayoutEnd);
  }
}

fs.writeFileSync('src/DashboardPages.tsx', content);
console.log('updated DashboardPages.tsx bots cards');
