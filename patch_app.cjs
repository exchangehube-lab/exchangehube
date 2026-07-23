const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('SupabaseVerification')) {
  // Add import
  code = code.replace(
    `import { AdminUsersPage } from './AdminUsersPage';`,
    `import { AdminUsersPage } from './AdminUsersPage';\nimport { SupabaseVerification } from './components/SupabaseVerification';`
  );
  
  // Add component inside Routes or outside? Better outside Routes, inside the root element. But App only returns <Routes>. We should wrap it in a Fragment.
  code = code.replace(
    `export default function App() {\n  return (\n    <Routes>`,
    `export default function App() {\n  return (\n    <>\n      <SupabaseVerification />\n      <Routes>`
  );
  code = code.replace(
    `    </Routes>\n  );\n}`,
    `    </Routes>\n    </>\n  );\n}`
  );
  
  fs.writeFileSync('src/App.tsx', code);
}
