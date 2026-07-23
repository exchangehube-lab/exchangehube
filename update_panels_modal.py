import sys

with open('src/BotViewModal.tsx', 'r') as f:
    content = f.read()

content = content.replace('className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col"', 'className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col"')
content = content.replace('className="bg-white/5 p-6 rounded-2xl border border-white/5"', 'className="bg-black/20 p-6 rounded-2xl border border-white/5"')
content = content.replace('className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-3"', 'className="bg-black/20 border border-white/5 p-5 rounded-2xl flex flex-col gap-3"')

with open('src/BotViewModal.tsx', 'w') as f:
    f.write(content)
