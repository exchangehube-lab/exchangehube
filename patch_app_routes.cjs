const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('AdminBotRequestsPage')) {
  content = content.replace(/import \{([\s\S]*?)AdminManagementPage([\s\S]*?)\} from '\.\/AdminPages';/, "import {$1AdminManagementPage, AdminBotRequestsPage, AdminUserRequestsPage$2} from './AdminPages';");
}

const routesRegex = /(<Route path="\/Admin\/management" element=\{<AdminProtectedRoute><AdminManagementPage \/><\/AdminProtectedRoute>\} \/>)/;
if (content.match(routesRegex) && !content.includes('/Admin/requests/bot')) {
  content = content.replace(routesRegex, `$1\n      <Route path="/Admin/requests/bot" element={<AdminProtectedRoute><AdminBotRequestsPage /></AdminProtectedRoute>} />\n      <Route path="/Admin/requests/user" element={<AdminProtectedRoute><AdminUserRequestsPage /></AdminProtectedRoute>} />`);
}

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx routes updated');
