import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

old_card_bottom = """                <a 
                  href={channel.channelLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-purple-600 group-hover:border-purple-500"
                >
                  Join Channel <ExternalLink className="w-4 h-4 opacity-70" />
                </a>
              </div>"""

new_card_bottom = """                <a 
                  href={channel.channelLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 mb-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-purple-600 group-hover:border-purple-500"
                >
                  Join Channel <ExternalLink className="w-4 h-4 opacity-70" />
                </a>
                
                {channel.postPermission === 'admin' && channel.ownerUid !== auth.currentUser?.uid ? (
                  <p className="text-xs text-center text-[#B8C0D0] italic py-2">
                    Only the Admin can post in this channel.
                  </p>
                ) : (
                  <button className="w-full py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-xl text-purple-300 font-medium transition-colors flex items-center justify-center gap-2 text-sm">
                    Create Post
                  </button>
                )}
              </div>"""

content = content.replace(old_card_bottom, new_card_bottom)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
print("Updated card in DashboardPages.tsx")
