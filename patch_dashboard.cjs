const fs = require('fs');
let code = fs.readFileSync('src/DashboardPages.tsx', 'utf8');

code = code.replace(
  `      setUser(currentUser);\n        presenceService.updateStatus(currentUser.uid, "online").catch(console.error);\n      if (currentUser) {`,
  `      setUser(currentUser);\n      if (currentUser) {\n        presenceService.updateStatus(currentUser.uid, "online").catch(console.error);`
);

fs.writeFileSync('src/DashboardPages.tsx', code);
