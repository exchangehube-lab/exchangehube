const fs = require('fs');
let code = fs.readFileSync('src/DashboardPages.tsx', 'utf8');

const targetNav = `  const navItems = [
    { 
      name: 'Bots', 
      icon: Cpu,
      isSubmenu: true,
      subItems: [
        { name: 'Trending', path: '/bots/trending' },
        { name: 'Publish', path: '/bots/publish' }
      ]
    },
    { name: 'Messages', path: '/messages', icon: MessageCircle },
    { name: 'Channels', path: '/channels', icon: Hash },
    { name: 'Profile', path: '/profile', icon: User },
  ];`;

const replacementNav = `  const navItems = [
    { name: 'Chat', path: '/messages', icon: MessageCircle },
    { name: 'Bot', path: '/bots/trending', icon: Cpu },
    { name: 'Channel', path: '/channels', icon: Hash },
    { name: 'Profile', path: '/profile', icon: User },
  ];`;

if (code.includes(targetNav)) {
  code = code.replace(targetNav, replacementNav);
} else {
  console.log("targetNav not found");
}

fs.writeFileSync('src/DashboardPages.tsx', code);
