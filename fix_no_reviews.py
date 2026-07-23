import sys

with open('src/BotViewModal.tsx', 'r') as f:
    content = f.read()

content = content.replace('bg-white/5 border border-white/5 rounded-2xl', 'bg-black/20 border border-white/5 rounded-2xl')

with open('src/BotViewModal.tsx', 'w') as f:
    f.write(content)
