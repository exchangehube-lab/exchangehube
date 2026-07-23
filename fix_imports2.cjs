const fs = require('fs');
let content = fs.readFileSync('src/DashboardPages.tsx', 'utf-8');
content = content.replace(/ExternalLink([^}]*)ExternalLink/g, 'ExternalLink$1');
fs.writeFileSync('src/DashboardPages.tsx', content);
