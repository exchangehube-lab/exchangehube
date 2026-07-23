const fs = require('fs');

function fix(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  content = content.replace(/await signOut\(auth\);/g, 'if (auth.currentUser) await presenceService.updatePresence(auth.currentUser.uid, false); await signOut(auth);');
  content = content.replace(/await auth\.signOut\(\);/g, 'if (auth.currentUser) await presenceService.updatePresence(auth.currentUser.uid, false); await auth.signOut();');
  fs.writeFileSync(filepath, content);
}

fix('src/DashboardPages.tsx');
fix('src/AdminPages.tsx');
fix('src/App.tsx');
