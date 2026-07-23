import sys
import re

with open('src/BotViewModal.tsx', 'r') as f:
    content = f.read()

new_c = content.replace('overflow-y-auto custom-scrollbar pr-2 min-h-[300px]', 'flex flex-col gap-4')

with open('src/BotViewModal.tsx', 'w') as f:
    f.write(new_c)
print("Removed inner overflow")
