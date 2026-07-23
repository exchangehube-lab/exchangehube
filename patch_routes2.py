import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('<Route path="/chat/:channelId" element={<ChatPage />} />', '<Route path="/channels/:channelId/chat" element={<ChatPage />} />')

with open('src/App.tsx', 'w') as f:
    f.write(content)
