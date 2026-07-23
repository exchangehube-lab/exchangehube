const fs = require('fs');
let code = fs.readFileSync('src/messaging/types.ts', 'utf8');

code = code.replace(/updated_at\?: string;/g, "updated_at?: string;\n  edited?: boolean;\n  edited_at?: string;");

fs.writeFileSync('src/messaging/types.ts', code);
