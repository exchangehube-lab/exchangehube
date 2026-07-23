const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import
if (!code.includes('AdminReportsPage')) {
  code = code.replace(
    "import { AdminManagementPage } from './AdminManagementPage';",
    "import { AdminManagementPage } from './AdminManagementPage';\nimport { AdminReportsPage } from './AdminReportsPage';"
  );

  // 2. Add Route
  const routeTarget = `<Route path="/admin/users" element={<AdminProtectedRoute><AdminUsersPage /></AdminProtectedRoute>} />`;
  const routeReplacement = `<Route path="/admin/reports" element={<AdminProtectedRoute><AdminReportsPage /></AdminProtectedRoute>} />
      <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsersPage /></AdminProtectedRoute>} />`;

  code = code.replace(routeTarget, routeReplacement);
  fs.writeFileSync('src/App.tsx', code);
}
