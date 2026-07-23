const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `import { SupabaseVerification } from './components/SupabaseVerification';\n`,
  ''
);
code = code.replace(
  `import { SupabaseVerification } from './components/SupabaseVerification';`,
  ''
);

code = code.replace(
  `<SupabaseVerification />\n      `,
  ''
);
code = code.replace(
  `<SupabaseVerification />`,
  ''
);

fs.writeFileSync('src/App.tsx', code);
