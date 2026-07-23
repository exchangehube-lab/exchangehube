const fs = require('fs');

let adminContent = fs.readFileSync('src/AdminPages.tsx', 'utf-8');

// Add new icons if not present
if (!adminContent.includes('Bell')) {
  adminContent = adminContent.replace(
    "import { Users, Cpu, Hash, Link as LinkIcon, BarChart2, Shield, LogOut, Menu, X } from 'lucide-react';",
    "import { Users, Cpu, Hash, Link as LinkIcon, BarChart2, Shield, LogOut, Menu, X, Bell, Settings, ShieldCheck } from 'lucide-react';"
  );
}

const oldNavItems = `  const navItems = [
    { name: 'Dashboard', path: '/Admin/dashboard', icon: Shield },
    { name: 'Users', path: '/Admin/users', icon: Users },
  ];`;

const newNavItems = `  const navItems = [
    { name: 'Dashboard', path: '/Admin/dashboard', icon: Shield },
    { name: 'Users', path: '/Admin/users', icon: Users },
    { name: 'Bots', path: '/Admin/bots', icon: Cpu },
    { name: 'Charts', path: '/Admin/charts', icon: BarChart2 },
    { name: 'Referral Links', path: '/Admin/referrals', icon: LinkIcon },
    { name: 'Channels', path: '/Admin/channels', icon: Hash },
    { name: 'Notifications', path: '/Admin/notifications', icon: Bell },
    { name: 'Settings', path: '/Admin/settings', icon: Settings },
    { name: 'Admin Management', path: '/Admin/management', icon: ShieldCheck },
  ];`;

adminContent = adminContent.replace(oldNavItems, newNavItems);

// Make the sidebar icon-only on mobile, full width on desktop
const oldSidebarTag = `<aside className="hidden lg:flex w-72 h-screen flex-col bg-[#070b1a]/80 backdrop-blur-xl border-r border-white/5 relative z-20 shrink-0">`;
const newSidebarTag = `<aside className="flex w-20 lg:w-72 h-screen flex-col bg-[#070b1a]/80 backdrop-blur-xl border-r border-white/5 relative z-20 shrink-0 transition-all duration-300">`;
adminContent = adminContent.replace(oldSidebarTag, newSidebarTag);

// Hide text on mobile for the header
const oldHeader = `          <div>
            <h1 className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-400">
              Admin
            </h1>
            <p className="text-[10px] text-[#B8C0D0] tracking-wider uppercase">Control Panel</p>
          </div>`;
const newHeader = `          <div className="hidden lg:block">
            <h1 className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-400">
              Admin
            </h1>
            <p className="text-[10px] text-[#B8C0D0] tracking-wider uppercase">Control Panel</p>
          </div>`;
adminContent = adminContent.replace(oldHeader, newHeader);

// Adjust nav links spacing and hide text on mobile
const oldNavLink = `              <Link
                key={item.name}
                to={item.path}
                className={\`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 \${
                  isActive 
                    ? 'bg-gradient-to-r from-red-600/20 to-purple-600/20 text-white border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.15)]' 
                    : 'text-[#B8C0D0] hover:text-white hover:bg-white/5 border border-transparent'
                }\`}
              >
                <Icon className={\`w-5 h-5 \${isActive ? 'text-red-400' : 'text-[#B8C0D0]'}\`} />
                <span className="font-medium text-sm">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
                )}
              </Link>`;
const newNavLink = `              <Link
                key={item.name}
                to={item.path}
                title={item.name}
                className={\`flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all duration-300 \${
                  isActive 
                    ? 'bg-gradient-to-r from-red-600/20 to-purple-600/20 text-white border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.15)]' 
                    : 'text-[#B8C0D0] hover:text-white hover:bg-white/5 border border-transparent'
                }\`}
              >
                <Icon className={\`w-5 h-5 shrink-0 \${isActive ? 'text-red-400' : 'text-[#B8C0D0]'}\`} />
                <span className="hidden lg:inline font-medium text-sm whitespace-nowrap">{item.name}</span>
                {isActive && (
                  <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
                )}
              </Link>`;
adminContent = adminContent.replace(oldNavLink, newNavLink);

// Adjust logout button
const oldLogoutBtn = `          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-colors font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>`;
const newLogoutBtn = `          <button
            onClick={handleLogout}
            title="Sign Out"
            className="flex items-center justify-center lg:justify-start gap-3 w-full px-3 lg:px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-colors font-medium text-sm"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="hidden lg:inline">Sign Out</span>
          </button>`;
adminContent = adminContent.replace(oldLogoutBtn, newLogoutBtn);

// Fix the Admin icon div centering
const oldLogo = `        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-purple-600 p-[1px] shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            <div className="w-full h-full bg-[#050816] rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
          </div>`;
const newLogo = `        <div className="p-4 lg:p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-purple-600 p-[1px] shadow-[0_0_20px_rgba(220,38,38,0.4)] shrink-0">
            <div className="w-full h-full bg-[#050816] rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
          </div>`;
adminContent = adminContent.replace(oldLogo, newLogo);

// Fix nav container padding
const oldNav = `<nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">`;
const newNav = `<nav className="flex-1 px-2 lg:px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">`;
adminContent = adminContent.replace(oldNav, newNav);

fs.writeFileSync('src/AdminPages.tsx', adminContent);
