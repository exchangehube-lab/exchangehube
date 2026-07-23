import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Update the import
old_import = "import { ChartsPage, BotsPage, TrendingBotsPage, PublishBotPage, ReferralsPage, ChannelsPage, ProfilePage, ChatPage } from './DashboardPages';"
new_import = "import { ChartsPage, BotsPage, TrendingBotsPage, PublishBotPage, ReferralsPage, ChannelsPage, ProfilePage } from './DashboardPages';\nimport { ChatPage } from './ChatPage';"

content = content.replace(old_import, new_import)

with open('src/App.tsx', 'w') as f:
    f.write(content)
