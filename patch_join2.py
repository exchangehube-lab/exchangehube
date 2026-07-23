import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

content = content.replace("window.location.href = `/chat/${channel.id}`;", "navigate(`/chat/${channel.id}`);")

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
