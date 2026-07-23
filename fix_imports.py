import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_import = "import { AdminDashboardPage, AdminBotsPage, AdminChartsPage, AdminReferralsPage, AdminChannelsPage, AdminNotificationsPage, AdminSettingsPage, AdminBotRequestsPage, AdminUserRequestsPage } from './AdminPages';"
new_import = """import { AdminDashboardPage, AdminChartsPage, AdminReferralsPage, AdminNotificationsPage, AdminSettingsPage, AdminBotRequestsPage, AdminUserRequestsPage } from './AdminPages';
import { AdminBotsPage } from './AdminBotsPage';
import { AdminChannelsPage } from './AdminChannelsPage';"""

content = content.replace(old_import, new_import)

with open('src/App.tsx', 'w') as f:
    f.write(content)
