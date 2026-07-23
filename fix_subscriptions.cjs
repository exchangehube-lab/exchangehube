const fs = require('fs');

function fix(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace .subscribe(); with reconnect logic
  if (code.includes('.subscribe();')) {
    code = code.replace(/\.subscribe\(\);/g, `.subscribe((status) => {
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('Realtime channel closed or errored, attempting to reconnect in 3s...');
          setTimeout(() => {
            supabase.channel(this?.name || '').subscribe(); // Note: we'll rewrite this more cleanly
          }, 3000);
        }
      });`);
  }

  // A safer approach:
  code = fs.readFileSync(file, 'utf8');
  const replaceStr = `.subscribe((status, err) => {
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('Realtime subscription lost. Supabase client will auto-reconnect, but we log this for visibility.', status, err);
        }
      });`;
  code = code.replace(/\.subscribe\(\);/g, replaceStr);
  
  fs.writeFileSync(file, code);
}

fix('src/messaging/services/personalMessageService.ts');
fix('src/messaging/services/channelMessageService.ts');
fix('src/messaging/services/presenceService.ts');
fix('src/messaging/services/typingService.ts');
fix('src/messaging/services/notificationService.ts');
