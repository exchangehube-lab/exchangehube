const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/import \{ AdmineDashboardPage \} from '\.\/AdminePages';/g, "import { AdminDashboardPage } from './AdminPages';");
content = content.replace(/<AdmineDashboardPage \/>/g, "<AdminDashboardPage />");

fs.writeFileSync('src/App.tsx', content);
