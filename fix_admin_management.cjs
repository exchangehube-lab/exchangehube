const fs = require('fs');

let adminContent = fs.readFileSync('src/AdminPages.tsx', 'utf-8');
const adminManagementRegex = /export function AdminManagementPage\(\) \{\s*return \(\s*<AdminLayout>\s*<div className="flex flex-col gap-6">\s*<h1 className="text-3xl font-display font-bold text-white">Admin Management<\/h1>\s*<p className="text-gray-400">Admin management coming soon\.<\/p>\s*<\/div>\s*<\/AdminLayout>\s*\);\s*\}/g;

adminContent = adminContent.replace(adminManagementRegex, '');
fs.writeFileSync('src/AdminPages.tsx', adminContent);

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
if (!appContent.includes("import { AdminManagementPage } from './AdminManagementPage';")) {
  appContent = appContent.replace(
    "import { AdminDashboardPage, AdminBotsPage, AdminChartsPage, AdminReferralsPage, AdminChannelsPage, AdminNotificationsPage, AdminSettingsPage, AdminManagementPage } from './AdminPages';",
    "import { AdminDashboardPage, AdminBotsPage, AdminChartsPage, AdminReferralsPage, AdminChannelsPage, AdminNotificationsPage, AdminSettingsPage } from './AdminPages';\nimport { AdminManagementPage } from './AdminManagementPage';"
  );
  fs.writeFileSync('src/App.tsx', appContent);
}

