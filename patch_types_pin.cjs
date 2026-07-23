const fs = require('fs');
let code = fs.readFileSync('src/messaging/types.ts', 'utf8');

code = code.replace(/deleted_for_all\?: boolean;/g, "deleted_for_all?: boolean;\n  pinned?: boolean;");

fs.writeFileSync('src/messaging/types.ts', code);
