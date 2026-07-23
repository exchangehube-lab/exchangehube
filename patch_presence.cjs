const fs = require('fs');
let code = fs.readFileSync('src/DashboardPages.tsx', 'utf8');

const effectCode = `
  useEffect(() => {
    if (!user) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        presenceService.updateStatus(user.uid, 'online').catch(console.error);
      } else {
        presenceService.updateStatus(user.uid, 'offline').catch(console.error);
      }
    };
    
    const handleBeforeUnload = () => {
      presenceService.updateStatus(user.uid, 'offline').catch(console.error);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);
`;

code = code.replace('const [isBotsExpanded, setIsBotsExpanded] = useState(location.pathname.startsWith(\'/bots/\'));', effectCode + '\n  const [isBotsExpanded, setIsBotsExpanded] = useState(location.pathname.startsWith(\'/bots/\'));');

fs.writeFileSync('src/DashboardPages.tsx', code);
