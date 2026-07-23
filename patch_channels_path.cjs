const fs = require('fs');
let code = fs.readFileSync('src/DashboardPages.tsx', 'utf8');

const target = `  useEffect(() => {
    if (location.pathname !== '/' && location.pathname !== '/signup' && location.pathname !== '/admin-login') {
      // localStorage.setItem('last_visited_page', location.pathname);
    }
  }, [location.pathname]);`;

const replacement = `  useEffect(() => {
    if (location.pathname === '/channels' || location.pathname === '/messages' || location.pathname.startsWith('/channels/') || location.pathname.startsWith('/messages/')) {
      localStorage.setItem('last_chat_path', location.pathname);
    }
  }, [location.pathname]);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/DashboardPages.tsx', code);
