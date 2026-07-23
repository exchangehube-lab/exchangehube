import sys

with open('src/ChatPage.tsx', 'r') as f:
    lines = f.readlines()
    
for i, line in enumerate(lines):
    if "Fetch joined channels" in line:
        print("".join(lines[i:i+35]))
        break
