import sys

with open('src/AdminPages.tsx', 'r') as f:
    content = f.read()

old_admin_info = """                <p className="text-sm text-[#B8C0D0] mb-6 flex-1 line-clamp-3">
                  {channel.channelBio}
                </p>"""

new_admin_info = """                <p className="text-sm text-[#B8C0D0] mb-4 flex-1 line-clamp-3">
                  {channel.channelBio}
                </p>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#B8C0D0]">Username</span>
                    <span className="text-white font-medium">{channel.channelUsername || 'N/A (Private)'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#B8C0D0]">Link</span>
                    <span className="text-purple-400 font-medium truncate max-w-[150px]">{channel.channelLink}</span>
                  </div>
                </div>"""

content = content.replace(old_admin_info, new_admin_info)

with open('src/AdminPages.tsx', 'w') as f:
    f.write(content)

