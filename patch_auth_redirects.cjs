const fs = require('fs');

// Fix DashboardLayout
let dashboard = fs.readFileSync('src/DashboardPages.tsx', 'utf-8');
dashboard = dashboard.replace(/if \(docSnap\.exists\(\)\) \{\s*const data = docSnap\.data\(\);\s*if \(data\.role === 'admin' && data\.isActive === true\) \{\s*navigate\('\/Admin\/dashboard'\);\s*return;\s*\}\s*\}/, '');
fs.writeFileSync('src/DashboardPages.tsx', dashboard);

console.log("Fixed DashboardLayout");
