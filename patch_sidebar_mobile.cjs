const fs = require('fs');

let content = fs.readFileSync('src/DashboardPages.tsx', 'utf8');

// The replacement was applied twice. 
// We can find the second occurrence and modify the onClick handler.

const parts = content.split('Joined Channels</div>');
if (parts.length === 3) {
  // Mobile is the second one
  const mobilePart = parts[2];
  
  // replace onClick={() => navigate(\`/channels/\${channel.id}/chat\`)}
  // with onClick={() => { navigate(\`/channels/\${channel.id}/chat\`); setIsSidebarOpen(false); }}
  
  const modifiedMobilePart = mobilePart.replace(
    /onClick=\{\(\) => navigate\(\`\/channels\/\$\{\channel\.id\}\/chat\`\)\}/g,
    'onClick={() => { navigate(`/channels/${channel.id}/chat`); setIsSidebarOpen(false); }}'
  );
  
  content = parts[0] + 'Joined Channels</div>' + parts[1] + 'Joined Channels</div>' + modifiedMobilePart;
  fs.writeFileSync('src/DashboardPages.tsx', content);
  console.log("Success DashboardPages mobile patch");
} else {
  console.log("Unexpected parts length", parts.length);
}

