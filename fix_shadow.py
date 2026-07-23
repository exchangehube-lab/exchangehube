import sys

with open('src/components/BotCard.tsx', 'r') as f:
    content = f.read()

old_classes = "bg-[#172045]/90 backdrop-blur-md border border-[#8278ff]/15 rounded-3xl p-8 relative group overflow-hidden transition-all duration-300 shadow-[0_8px_30px_-5px_rgba(168,85,247,0.15)] hover:shadow-[0_15px_40px_-5px_rgba(168,85,247,0.25)] hover:scale-[1.02] hover:bg-[#1d2958]/90 flex flex-col h-full"
new_classes = "bg-[#172045]/90 backdrop-blur-md border border-[#8278ff]/15 rounded-3xl p-8 relative group overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgba(168,85,247,0.1)] hover:shadow-[0_15px_40px_rgba(168,85,247,0.2)] hover:scale-[1.02] hover:bg-[#1d2958]/90 flex flex-col h-full"

if old_classes in content:
    content = content.replace(old_classes, new_classes)
    print("Shadow updated")
else:
    print("Classes not found in BotCard")

with open('src/components/BotCard.tsx', 'w') as f:
    f.write(content)
