import sys

with open('src/components/BotCard.tsx', 'r') as f:
    content = f.read()

content = content.replace("bg-white/5 p-5 rounded-2xl border border-white/10", "bg-black/20 p-5 rounded-2xl border border-white/5")

with open('src/components/BotCard.tsx', 'w') as f:
    f.write(content)
