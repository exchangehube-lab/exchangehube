import sys

with open('src/ChatPage.tsx', 'r') as f:
    lines = f.readlines()

for i in range(len(lines)-1, -1, -1):
    if "</DashboardLayout>" in lines[i]:
        idx = i - 1
        while idx >= 0:
            if "</div>" in lines[idx]:
                break
            idx -= 1
        if idx >= 0:
            lines.insert(idx, "        )}\n")
            break

with open('src/ChatPage.tsx', 'w') as f:
    f.writelines(lines)

print("Injected )}")
