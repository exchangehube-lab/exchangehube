const fs = require('fs');
let content = fs.readFileSync('src/DashboardPages.tsx', 'utf-8');

// 1. Change navItems
const oldNavItems = `  const navItems = [
    { name: 'Charts', path: '/charts', icon: BarChart2 },
    { name: 'Bots', path: '/bots', icon: Cpu },
    { name: 'Referral Links', path: '/referrals', icon: LinkIcon },
    { name: 'Channels', path: '/channels', icon: Hash },
    { name: 'Profile', path: '/profile', icon: User },
  ];`;

const newNavItems = `  const navItems = [
    { name: 'Chat', path: '/chat', icon: MessageCircle },
    { name: 'Bots', path: '/bots', icon: Cpu },
    { name: 'Channels', path: '/channels', icon: Hash },
    { name: 'Profile', path: '/profile', icon: User },
  ];`;
content = content.replace(oldNavItems, newNavItems);

// 2. Add showLogoutConfirm state
content = content.replace(
  "const [isSidebarOpen, setIsSidebarOpen] = useState(false);",
  "const [isSidebarOpen, setIsSidebarOpen] = useState(false);\n  const [showLogoutConfirmMenu, setShowLogoutConfirmMenu] = useState(false);"
);

// 3. Update the Logout function
const logoutDialog = `
      {/* Logout Confirmation Dialog */}
      {showLogoutConfirmMenu && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirmMenu(false)}></div>
          <div className="relative bg-[#070b1a] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Logout</h3>
            <p className="text-[#B8C0D0] mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirmMenu(false)}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowLogoutConfirmMenu(false);
                  await signOut(auth);
                  localStorage.clear();
                  navigate('/');
                }}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  "{/* Main Content Area */}",
  logoutDialog + "\n      {/* Main Content Area */}"
);

// 4. Update desktop sidebar logout button
content = content.replace(
  `onClick={() => signOut(auth)}`,
  `onClick={() => setShowLogoutConfirmMenu(true)}`
);

// 5. Update mobile drawer logout button
content = content.replace(
  `onClick={() => {
                  signOut(auth);
                  setIsSidebarOpen(false);
                }}`,
  `onClick={() => {
                  setIsSidebarOpen(false);
                  setShowLogoutConfirmMenu(true);
                }}`
);

// 6. Make drawer and hamburger menu visible on all screens by removing lg:hidden
content = content.replace(
  `{/* Mobile Drawer Overlay */}
      <div className={\`lg:hidden fixed inset-0 z-[60] flex transition-all duration-300 \${isSidebarOpen ? 'visible' : 'invisible'}\`}>`,
  `{/* Mobile Drawer Overlay */}
      <div className={\`fixed inset-0 z-[60] flex transition-all duration-300 \${isSidebarOpen ? 'visible' : 'invisible'}\`}>`
);

content = content.replace(
  `className="lg:hidden p-2 -ml-2 text-[#B8C0D0] hover:text-white transition-colors rounded-lg hover:bg-white/5"`,
  `className="p-2 -ml-2 text-[#B8C0D0] hover:text-white transition-colors rounded-lg hover:bg-white/5"`
);

content = content.replace(
  `lg:hidden flex items-center gap-3 absolute left-1/2 -translate-x-1/2`,
  `flex items-center gap-3 absolute left-1/2 -translate-x-1/2`
);

// Fix the lg:justify-end on the top bar so hamburger stays left
content = content.replace(
  `justify-between lg:justify-end px-4 sm:px-8`,
  `justify-between px-4 sm:px-8`
);

fs.writeFileSync('src/DashboardPages.tsx', content);
