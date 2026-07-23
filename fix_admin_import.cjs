const fs = require('fs');

const p = 'src/AdminPages.tsx';
let content = fs.readFileSync(p, 'utf8');
if (!content.includes('import { presenceService }')) {
  content = content.replace(/import \{ auth, db \} from '\.\/firebase';/, "import { auth, db } from './firebase';\nimport { presenceService } from './messaging/services/presenceService';");
  fs.writeFileSync(p, content);
}
