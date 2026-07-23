const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Import AdminUsersPage
content = content.replace(
  "import { AdminDashboardPage } from './AdminPages';",
  "import { AdminDashboardPage } from './AdminPages';\nimport { AdminUsersPage } from './AdminUsersPage';"
);

// Add Route
content = content.replace(
  '<Route path="/Admin/dashboard" element={<AdminDashboardPage />} />',
  '<Route path="/Admin/dashboard" element={<AdminDashboardPage />} />\n      <Route path="/Admin/users" element={<AdminUsersPage />} />'
);

fs.writeFileSync('src/App.tsx', content);
