import sys

def replace_file(filepath, old_str, new_str):
    with open(filepath, 'r') as f:
        content = f.read()
    content = content.replace(old_str, new_str)
    with open(filepath, 'w') as f:
        f.write(content)

bot_old = """<h3 className="text-xl font-bold text-white mb-1 truncate">{bot.botName}</h3>"""
bot_new = """<h3 className="text-xl font-bold text-white mb-1 truncate">{bot.botName}</h3>
                    <p className="text-xs text-[#B8C0D0] mb-4">
                      {bot.createdAt?.toDate ? bot.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </p>"""

chan_old = """<h3 className="text-lg font-medium text-white line-clamp-1 mb-2">{channel.channelName}</h3>"""
chan_new = """<h3 className="text-lg font-medium text-white line-clamp-1">{channel.channelName}</h3>
                    <p className="text-xs text-[#B8C0D0] mb-2">
                      {channel.createdAt?.toDate ? channel.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </p>"""

replace_file('src/AdminBotsPage.tsx', bot_old, bot_new)
replace_file('src/AdminChannelsPage.tsx', chan_old, chan_new)
