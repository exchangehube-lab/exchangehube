const fs = require('fs');

let content = fs.readFileSync('src/DashboardPages.tsx', 'utf8');

content = content.replace(
  "const q = query(channelsRef, where('members', 'array-contains', user.uid), where('status', '==', 'active'));",
  "const q = query(channelsRef, where('members', 'array-contains', user.uid));"
);

fs.writeFileSync('src/DashboardPages.tsx', content);
console.log("Success removed status from joined query");
