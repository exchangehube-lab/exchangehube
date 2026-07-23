import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add /chat/:channelId route
route_old = '<Route path="/chat" element={<ChatPage />} />'
route_new = '<Route path="/chat" element={<ChatPage />} />\n      <Route path="/chat/:channelId" element={<ChatPage />} />'

content = content.replace(route_old, route_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
