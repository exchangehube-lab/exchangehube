const fs = require('fs');
let content = fs.readFileSync('src/DashboardPages.tsx', 'utf-8');
content = content.replace('Upload, ExternalLink', 'Upload, Eye');
fs.writeFileSync('src/DashboardPages.tsx', content);
