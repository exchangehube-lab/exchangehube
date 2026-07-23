const fs = require('fs');
let content = fs.readFileSync('src/DashboardPages.tsx', 'utf-8');

// Add viewingBot state to TrendingBotsPage
const trendingFnMatch = content.match(/export function TrendingBotsPage\(\) \{\s*const \[bots, setBots\] = useState<any\[\]>\(\[\]\);/);
if (trendingFnMatch) {
  content = content.replace(trendingFnMatch[0], `${trendingFnMatch[0]}\n  const [viewingBot, setViewingBot] = useState<any | null>(null);`);
}

// Add state to PublishBotPage
const publishFnMatch = content.match(/export function PublishBotPage\(\) \{\s*const \[activeTab, setActiveTab\] = useState<'Publish' \| 'List'>\('Publish'\);/);
if (publishFnMatch) {
  content = content.replace(publishFnMatch[0], `${publishFnMatch[0]}\n  const [viewingBot, setViewingBot] = useState<any | null>(null);`);
}

// Fix View buttons in TrendingBotsPage and PublishBotPage
// They look like:
// <button
//   onClick={() => setViewingBot(bot)} // removed
//   className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-medium text-sm"
// >
//   <Eye className="w-4 h-4" /> View
// </button>
content = content.replace(
  /<button\s+className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white\/5 hover:bg-white\/10 text-white border border-white\/10 rounded-xl transition-all font-medium text-sm"\s*>\s*<Eye className="w-4 h-4" \/> View\s*<\/button>/g,
  `<button
    onClick={() => setViewingBot(bot)}
    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-medium text-sm"
  >
    <Eye className="w-4 h-4" /> View
  </button>`
);

content = content.replace(
  /<button\s+className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white\/5 hover:bg-white\/10 text-white border border-white\/10 rounded-xl transition-all font-medium text-sm"\s*>\s*<Eye className="w-4 h-4" \/> View\s*<\/button>/g,
  `<button
    onClick={() => setViewingBot(bot)}
    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-medium text-sm"
  >
    <Eye className="w-4 h-4" /> View
  </button>`
);


fs.writeFileSync('src/DashboardPages.tsx', content);
