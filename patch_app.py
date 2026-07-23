import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

import_old = "import { AdminManagementPage } from './AdminManagementPage';"
import_new = "import { AdminManagementPage } from './AdminManagementPage';\nimport { AdminManagementHubPage } from './AdminManagementHubPage';"

route_old = """<Route path="/admin/management" element={<AdminProtectedRoute><AdminManagementPage /></AdminProtectedRoute>} />"""
route_new = """<Route path="/admin/management" element={<AdminProtectedRoute><AdminManagementPage /></AdminProtectedRoute>} />
      <Route path="/admin/manage" element={<AdminProtectedRoute><AdminManagementHubPage /></AdminProtectedRoute>} />"""

content = content.replace(import_old, import_new)
content = content.replace(route_old, route_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
