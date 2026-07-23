import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

start_str = '            ) : myBots.length > 0 ? ('
end_str = '            ) : ('

start_idx = content.find(start_str, content.find('activeTab === \'List\''))
if start_idx != -1:
    end_idx = content.find(end_str, start_idx + len(start_str))
    if end_idx != -1:
        replacement = """            ) : myBots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[1400px]:grid-cols-4 w-full gap-8">
                {myBots.map(bot => (
                  <BotCard 
                    key={bot.id} 
                    bot={bot}
                    actionButtons={
                      <>
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
                      </>
                    }
                  />
                ))}
              </div>
"""
        new_content = content[:start_idx] + replacement + content[end_idx:]
        with open('src/DashboardPages.tsx', 'w') as f:
            f.write(new_content)
        print("Replaced chunk 2")
    else:
        print("End string not found")
else:
    print("Start string not found")
