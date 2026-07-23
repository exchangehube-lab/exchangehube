import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

old_str = "relative bg-[#0f152e] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
new_str = "relative bg-[#172045]/90 backdrop-blur-md border border-[#8278ff]/15 rounded-3xl p-8 max-w-md w-full shadow-[0_15px_40px_-5px_rgba(168,85,247,0.25)]"

if old_str in content:
    content = content.replace(old_str, new_str)
    print("DashboardPages updated")
else:
    print("DashboardPages string not found")

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
