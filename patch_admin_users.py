import sys

with open('src/AdminUsersPage.tsx', 'r') as f:
    content = f.read()

old_title = """<h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-8">User Management</h1>"""
new_title = """<div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-[#B8C0D0] mb-2">
            <Link to="/admin/manage" className="hover:text-white transition-colors">Management</Link>
            <span>/</span>
            <span className="text-white">Users</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Users</h1>
        </div>"""

content = content.replace(old_title, new_title)
content = content.replace("import { Link } from 'react-router-dom';", "")
content = content.replace("import { AdminLayout } from './AdminPages';", "import { AdminLayout } from './AdminPages';\nimport { Link } from 'react-router-dom';")

with open('src/AdminUsersPage.tsx', 'w') as f:
    f.write(content)
