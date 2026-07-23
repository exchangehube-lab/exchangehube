const fs = require('fs');

function fixTypes() {
  const p = 'src/messaging/types.ts';
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/status:\s*'online'\s*\|\s*'offline'\s*\|\s*'away';/, 'is_online: boolean;');
  fs.writeFileSync(p, content);
}

function fixService() {
  const p = 'src/messaging/services/presenceService.ts';
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/status:\s*'online'\s*\|\s*'offline'\s*\|\s*'away'/, 'is_online: boolean');
  content = content.replace(/status,/, 'is_online,');
  fs.writeFileSync(p, content);
}

function fixDashboard() {
  const p = 'src/DashboardPages.tsx';
  let content = fs.readFileSync(p, 'utf8');
  // presenceService.updatePresence(currentUser.uid, "online").catch(console.error);
  // presenceService.updatePresence(user.uid, 'online').catch(console.error);
  // presenceService.updatePresence(user.uid, 'offline').catch(console.error);
  content = content.replace(/updatePresence\(([^,]+),\s*["']online["']\)/g, 'updatePresence($1, true)');
  content = content.replace(/updatePresence\(([^,]+),\s*["']offline["']\)/g, 'updatePresence($1, false)');
  fs.writeFileSync(p, content);
}

function fixPersonalChatWindow() {
  const p = 'src/PersonalChatWindow.tsx';
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/presence\.status\s*===\s*['"]online['"]/g, 'presence.is_online');
  content = content.replace(/presence\?\.status\s*===\s*['"]online['"]/g, 'presence?.is_online');
  fs.writeFileSync(p, content);
}

function fixChannelChatPage() {
  // If channel chat page has presence, but let's check
  const p = 'src/ChannelChatPage.tsx';
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/presence\.status\s*===\s*['"]online['"]/g, 'presence.is_online');
    content = content.replace(/presence\?\.status\s*===\s*['"]online['"]/g, 'presence?.is_online');
    fs.writeFileSync(p, content);
  }
}

fixTypes();
fixService();
fixDashboard();
fixPersonalChatWindow();
fixChannelChatPage();
