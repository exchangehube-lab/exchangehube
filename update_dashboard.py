import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

target1 = """        ) : filteredBots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[1400px]:grid-cols-4 w-full gap-6 mb-10">
            {filteredBots.map((bot) => (
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
                    <p className="text-sm text-[#B8C0D0] text-center line-clamp-2 w-full">
                      {bot.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 text-sm flex-1 relative z-10 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mine</span>
                    <span className="font-medium text-white">{bot.category || '-'}</span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mining Type</span>
                    <span className="font-medium text-white">{bot.accessType || '-'}</span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Currency</span>
                    <span className="font-medium text-white">{bot.botCurrency || '-'}</span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
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
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Publisher</span>
                    <span className="text-sm font-medium text-white truncate ">{bot.ownerUsername || 'Unknown'}</span>
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
            ))}
          </div>
        ) : ("""

replacement1 = """        ) : filteredBots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[1400px]:grid-cols-4 w-full gap-8 mb-12">
            {filteredBots.map((bot) => (
              <BotCard 
                key={bot.id} 
                bot={bot} 
                actionButtons={
                  <>
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
                  </>
                }
              />
            ))}
          </div>
        ) : ("""

if target1 in content:
    content = content.replace(target1, replacement1)
    print("Replaced chunk 1")
else:
    print("Chunk 1 not found")

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
