import sys

with open('src/components/BotCard.tsx', 'r') as f:
    content = f.read()

# Add import
import_stmt = "import { PublisherInfo } from './PublisherInfo';\n"
if "PublisherInfo" not in content:
    content = content.replace("import { ReviewModal", import_stmt + "import { ReviewModal")

old_publisher = """      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center shrink-0 border border-white/5">
          {bot.ownerProfilePicture ? (
            <img src={bot.ownerProfilePicture} alt={bot.ownerUsername} className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-[#B8C0D0]" />
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[10px] text-[#8F9BB3] uppercase tracking-wider font-medium">Publisher</span>
          <span className="text-sm font-semibold text-white truncate ">{bot.ownerUsername || 'Unknown'}</span>
        </div>
      </div>"""

new_publisher = """      <div className="mb-8 relative z-10">
        <PublisherInfo ownerUid={bot.ownerUid} initialUsername={bot.ownerUsername} initialProfilePicture={bot.ownerProfilePicture} />
      </div>"""

if old_publisher in content:
    content = content.replace(old_publisher, new_publisher)
    print("BotCard updated")
else:
    print("BotCard old string not found")

with open('src/components/BotCard.tsx', 'w') as f:
    f.write(content)
