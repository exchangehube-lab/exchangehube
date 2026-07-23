import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

old_card_head = """                  <div>
                    <h3 className="text-lg font-medium text-white line-clamp-1">{channel.channelName}</h3>
                    <p className="text-sm text-purple-400 font-medium">{channel.channelType}</p>
                  </div>
                </div>"""

new_card_head = """                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-lg font-medium text-white line-clamp-1">{channel.channelName}</h3>
                    <p className="text-sm text-purple-400 font-medium mb-1">{channel.channelType}</p>
                    <p className="text-xs text-[#B8C0D0] truncate opacity-70 font-mono">{channel.channelLink}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <button 
                    onClick={() => navigator.clipboard.writeText(channel.channelLink)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[#B8C0D0] hover:text-white font-medium transition-colors flex items-center justify-center gap-2 text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Link
                  </button>
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: channel.channelName,
                          url: channel.channelLink
                        }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(channel.channelLink);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[#B8C0D0] hover:text-white font-medium transition-colors flex items-center justify-center gap-2 text-xs"
                  >
                    <Share className="w-3.5 h-3.5" /> Share
                  </button>
                </div>"""

content = content.replace(old_card_head, new_card_head)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)

