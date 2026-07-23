const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// We have it twice in App.tsx: once in Home() and once in Signup() (probably)
code = code.replace(/const lastPage = '\/channels';\s*navigate\(lastPage\);/g, `const lastPage = localStorage.getItem('last_chat_path') || '/messages';\n        navigate(lastPage);`);

fs.writeFileSync('src/App.tsx', code);
