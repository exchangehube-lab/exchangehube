import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

# Fix the type issue in the filter
old_filter = "const myChannels = fetchedChannels.filter(c => c.members?.includes(auth.currentUser?.uid) && c.status === 'active');"
new_filter = "const myChannels = fetchedChannels.filter((c: any) => c.members?.includes(auth.currentUser?.uid) && c.status === 'active');"

content = content.replace(old_filter, new_filter)

with open('src/ChatPage.tsx', 'w') as f:
    f.write(content)
