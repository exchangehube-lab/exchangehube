import sys

with open('src/AdminPages.tsx', 'r') as f:
    content = f.read()

old_badges = """                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${channel.channelType === 'Public Channel' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {channel.channelType}
                      </span>
                    </div>"""

new_badges = """                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${channel.channelType === 'Public Channel' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {channel.channelType}
                      </span>
                      {channel.postPermission && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${channel.postPermission === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                          {channel.postPermission === 'admin' ? 'Admin Only' : 'Public'}
                        </span>
                      )}
                    </div>"""

content = content.replace(old_badges, new_badges)

with open('src/AdminPages.tsx', 'w') as f:
    f.write(content)
print("Updated AdminPages.tsx")
