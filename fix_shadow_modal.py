import sys

with open('src/BotViewModal.tsx', 'r') as f:
    content = f.read()
    
content = content.replace("shadow-[0_15px_40px_-5px_rgba(168,85,247,0.25)]", "shadow-[0_15px_40px_rgba(168,85,247,0.2)]")

with open('src/BotViewModal.tsx', 'w') as f:
    f.write(content)
