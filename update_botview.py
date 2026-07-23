import sys

with open('src/BotViewModal.tsx', 'r') as f:
    content = f.read()

old_classes = "relative bg-[#070b1a] border border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
new_classes = "relative bg-[#172045]/90 backdrop-blur-md border border-[#8278ff]/15 rounded-3xl w-full max-w-4xl shadow-[0_15px_40px_-5px_rgba(168,85,247,0.25)] animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"

if old_classes in content:
    content = content.replace(old_classes, new_classes)
    print("BotViewModal updated")
else:
    print("Classes not found in BotViewModal.tsx")

with open('src/BotViewModal.tsx', 'w') as f:
    f.write(content)

