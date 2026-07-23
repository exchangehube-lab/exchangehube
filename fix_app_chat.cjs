const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Update imports
content = content.replace(
  "import { ChartsPage, BotsPage, ReferralsPage, ChannelsPage, ProfilePage } from './DashboardPages';",
  "import { ChartsPage, BotsPage, ReferralsPage, ChannelsPage, ProfilePage, ChatPage } from './DashboardPages';"
);

// Add Route
content = content.replace(
  '<Route path="/charts" element={<ChartsPage />} />',
  '<Route path="/chat" element={<ChatPage />} />\n      <Route path="/charts" element={<ChartsPage />} />'
);

fs.writeFileSync('src/App.tsx', content);
