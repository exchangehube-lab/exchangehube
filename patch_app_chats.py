import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { ChatPage } from './ChatPage';", "import { ChatPage } from './ChatPage';\nimport { ChatsPage } from './ChatsPage';")
content = content.replace('<Route path="/chat" element={<ChatPage />} />', '<Route path="/chat" element={<ChatsPage />} />')

with open('src/App.tsx', 'w') as f:
    f.write(content)
