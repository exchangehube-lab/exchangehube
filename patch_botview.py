import sys

with open('src/BotViewModal.tsx', 'r') as f:
    content = f.read()

import_stmt = "import { PublisherInfo } from './components/PublisherInfo';\n"
if "PublisherInfo" not in content:
    content = content.replace("import { ExternalLink", import_stmt + "import { ExternalLink")

old_publisher = """                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 mb-4 mx-auto md:mx-0">
                  <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                    {bot.ownerProfilePicture ? (
                      <img src={bot.ownerProfilePicture} alt={bot.ownerUsername} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-[#B8C0D0]" />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider leading-tight">Publisher</span>
                    <span className="text-sm font-medium text-white leading-tight">{bot.ownerUsername || 'Unknown'}</span>
                  </div>
                </div>"""

new_publisher = """                <div className="mb-4 mx-auto md:mx-0">
                  <PublisherInfo ownerUid={bot.ownerUid} initialUsername={bot.ownerUsername} initialProfilePicture={bot.ownerProfilePicture} />
                </div>"""

if old_publisher in content:
    content = content.replace(old_publisher, new_publisher)
    print("BotViewModal updated")
else:
    print("BotViewModal old string not found")

with open('src/BotViewModal.tsx', 'w') as f:
    f.write(content)
