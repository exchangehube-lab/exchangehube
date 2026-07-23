const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/data\.role === 'Admin'/g, "data.role === 'admin'");
content = content.replace(/Admine access denied\./g, 'Admin access denied.');
content = content.replace(/not-Admin/g, 'not-admin');

fs.writeFileSync('src/App.tsx', content);

let admineContent = fs.readFileSync('src/AdminePages.tsx', 'utf-8');
admineContent = admineContent.replace(/admine/g, 'Admin');
admineContent = admineContent.replace(/Admine/g, 'Admin');
admineContent = admineContent.replace(/data\.role !== 'Admin'/g, "data.role !== 'admin'");
admineContent = admineContent.replace(/not-Admin/g, 'not-admin');
fs.writeFileSync('src/AdminPages.tsx', admineContent);
fs.unlinkSync('src/AdminePages.tsx');
