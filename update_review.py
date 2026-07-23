import sys

with open('src/components/ReviewModal.tsx', 'r') as f:
    content = f.read()

old_1 = "relative bg-[#0f152e] border border-purple-500/20 rounded-3xl w-full max-w-md shadow-[0_8px_30px_-5px_rgba(168,85,247,0.2)] animate-in fade-in zoom-in-95 duration-200 flex flex-col p-8"
new_1 = "relative bg-[#172045]/90 backdrop-blur-md border border-[#8278ff]/15 rounded-3xl w-full max-w-md shadow-[0_15px_40px_-5px_rgba(168,85,247,0.25)] animate-in fade-in zoom-in-95 duration-200 flex flex-col p-8"

old_2 = "relative bg-[#0f152e] border border-purple-500/20 rounded-3xl w-full max-w-sm shadow-[0_8px_30px_-5px_rgba(168,85,247,0.2)] animate-in fade-in zoom-in-95 duration-200 flex flex-col p-8 items-center text-center"
new_2 = "relative bg-[#172045]/90 backdrop-blur-md border border-[#8278ff]/15 rounded-3xl w-full max-w-sm shadow-[0_15px_40px_-5px_rgba(168,85,247,0.25)] animate-in fade-in zoom-in-95 duration-200 flex flex-col p-8 items-center text-center"

if old_1 in content:
    content = content.replace(old_1, new_1)
    print("ReviewModal 1 updated")
if old_2 in content:
    content = content.replace(old_2, new_2)
    print("ReviewModal 2 updated")

with open('src/components/ReviewModal.tsx', 'w') as f:
    f.write(content)
