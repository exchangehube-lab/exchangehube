const fs = require('fs');

const p = 'src/DashboardPages.tsx';
let content = fs.readFileSync(p, 'utf8');

const regex = /const handleVisibilityChange = \(\) => \{[\s\S]*?window\.removeEventListener\('beforeunload', handleBeforeUnload\);\s*\};\s*\}, \[user\]\);/;

const replacement = `const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        presenceService.updatePresence(user.uid, true).catch(console.error);
      } else {
        presenceService.updatePresence(user.uid, false).catch(console.error);
      }
    };
    
    const handleBeforeUnload = () => {
      presenceService.updatePresence(user.uid, false).catch(console.error);
    };

    const handleOffline = () => {
      presenceService.updatePresence(user.uid, false).catch(console.error);
    };

    const handleOnline = () => {
      presenceService.updatePresence(user.uid, true).catch(console.error);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [user]);`;

content = content.replace(regex, replacement);
fs.writeFileSync(p, content);
