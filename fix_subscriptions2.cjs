const fs = require('fs');

function fix(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace the simple warning with an actual resubscribe wrapper
  const pattern = /\.subscribe\(\(status, err\) => \{[\s\S]*?\}\);/g;
  
  const replacement = `.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully connected to realtime channel');
        }
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('Realtime channel disconnected. Attempting to reconnect...');
          setTimeout(() => {
            // We just trigger subscribe again on the same channel
            supabase.getChannels().forEach(ch => {
               if (ch.state !== 'joined' && ch.state !== 'joining') {
                 ch.subscribe();
               }
            });
          }, 5000);
        }
      });`;
  
  code = code.replace(pattern, replacement);
  fs.writeFileSync(file, code);
}

fix('src/messaging/services/personalMessageService.ts');
fix('src/messaging/services/channelMessageService.ts');
fix('src/messaging/services/presenceService.ts');
fix('src/messaging/services/typingService.ts');
fix('src/messaging/services/notificationService.ts');
