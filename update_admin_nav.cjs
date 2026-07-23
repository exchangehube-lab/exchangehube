const fs = require('fs');
let content = fs.readFileSync('src/AdminPages.tsx', 'utf-8');

const oldNavItems = `  const navItems = [
    { name: 'Dashboard', path: '/Admin/dashboard', icon: Shield },
  ];`;

const newNavItems = `  const navItems = [
    { name: 'Dashboard', path: '/Admin/dashboard', icon: Shield },
    { name: 'Users', path: '/Admin/users', icon: Users },
  ];`;

content = content.replace(oldNavItems, newNavItems);
fs.writeFileSync('src/AdminPages.tsx', content);
