const fs = require('fs');
let content = fs.readFileSync('src/DashboardPages.tsx', 'utf-8');

const endOfTrending = content.indexOf('</DashboardLayout>', content.indexOf('export function TrendingBotsPage'));
if (endOfTrending !== -1 && !content.substring(endOfTrending - 50, endOfTrending).includes('BotViewModal')) {
  content = content.substring(0, endOfTrending) + `{viewingBot && <BotViewModal bot={viewingBot} onClose={() => setViewingBot(null)} />}\n    ` + content.substring(endOfTrending);
}

const endOfPublish = content.indexOf('</DashboardLayout>', content.indexOf('export function PublishBotPage'));
if (endOfPublish !== -1 && !content.substring(endOfPublish - 50, endOfPublish).includes('BotViewModal')) {
  content = content.substring(0, endOfPublish) + `{viewingBot && <BotViewModal bot={viewingBot} onClose={() => setViewingBot(null)} />}\n    ` + content.substring(endOfPublish);
}

fs.writeFileSync('src/DashboardPages.tsx', content);
