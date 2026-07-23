import sys

with open('src/AdminPages.tsx', 'r') as f:
    content = f.read()

# Replace the navItems definition
old_nav = """  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: Shield },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Bots', path: '/admin/bots', icon: Cpu },
    { name: 'Charts', path: '/admin/charts', icon: BarChart2 },
    { name: 'Referral Links', path: '/admin/referrals', icon: LinkIcon },
    { name: 'Channels', path: '/admin/channels', icon: Hash },
    { 
      name: 'Requests', 
      icon: ClipboardList,
      isSubmenu: true,
      subItems: [
        { name: 'Bot', path: '/admin/requests/bot' },
        { name: 'User', path: '/admin/requests/user' }
      ]
    },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Admin Management', path: '/admin/management', icon: ShieldCheck },
  ];"""

new_nav = """  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: Shield },
    { 
      name: 'Management', 
      path: '/admin/manage', 
      icon: Users,
      activePaths: ['/admin/manage', '/admin/users', '/admin/bots', '/admin/channels']
    },
    { name: 'Charts', path: '/admin/charts', icon: BarChart2 },
    { name: 'Referral Links', path: '/admin/referrals', icon: LinkIcon },
    { 
      name: 'Requests', 
      icon: ClipboardList,
      isSubmenu: true,
      subItems: [
        { name: 'Bot', path: '/admin/requests/bot' },
        { name: 'User', path: '/admin/requests/user' }
      ]
    },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Admin Management', path: '/admin/management', icon: ShieldCheck },
  ];"""

content = content.replace(old_nav, new_nav)

# Replace the Link active check
old_link_active = """location.pathname === item.path"""
new_link_active = """(item.activePaths ? item.activePaths.includes(location.pathname) : location.pathname === item.path)"""

content = content.replace(old_link_active, new_link_active)

with open('src/AdminPages.tsx', 'w') as f:
    f.write(content)
