const fs = require('fs');
let code = fs.readFileSync('src/messaging/types.ts', 'utf8');

code = code.replace(/edited_at\?: string;/g, "edited_at?: string;\n  deleted?: boolean;\n  deleted_for_all?: boolean;");

fs.writeFileSync('src/messaging/types.ts', code);
