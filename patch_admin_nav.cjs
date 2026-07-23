const fs = require('fs');
let code = fs.readFileSync('src/AdminPages.tsx', 'utf8');

// 1. Import Flag
if (!code.includes('Flag')) {
  code = code.replace(
    "CheckCircle, XCircle, Ban, Mail, X, Shield, Lock, Trash2, Key, Link as LinkIcon",
    "CheckCircle, XCircle, Ban, Mail, X, Shield, Lock, Trash2, Key, Link as LinkIcon, Flag"
  );
}

// 2. Add to navItems
const navItemsTarget = `    { name: 'Charts', path: '/admin/charts', icon: BarChart2 },`;
const navItemsReplacement = `    { name: 'Reports', path: '/admin/reports', icon: Flag },
    { name: 'Charts', path: '/admin/charts', icon: BarChart2 },`;

if (!code.includes("path: '/admin/reports'")) {
  code = code.replace(navItemsTarget, navItemsReplacement);
  fs.writeFileSync('src/AdminPages.tsx', code);
}
