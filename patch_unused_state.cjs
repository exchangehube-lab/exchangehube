const fs = require('fs');
let code = fs.readFileSync('src/DashboardPages.tsx', 'utf8');

const target = `  const [isBotsExpanded, setIsBotsExpanded] = useState(location.pathname.startsWith('/bots/'));`;

if (code.includes(target)) {
  code = code.replace(target, '');
  fs.writeFileSync('src/DashboardPages.tsx', code);
}
