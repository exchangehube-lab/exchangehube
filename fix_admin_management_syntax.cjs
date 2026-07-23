const fs = require('fs');

let content = fs.readFileSync('src/AdminManagementPage.tsx', 'utf-8');

// Fix template literals
content = content.replace(/alert\(\\?`Password reset email sent to \\?\${email}\\?`\);/g, "alert(`Password reset email sent to ${email}`);");
content = content.replace(/className=\{\\`inline-flex items-center/g, "className={`inline-flex items-center");
content = content.replace(/ border-red-400\/20'\\n                \}\\`\}>/g, " border-red-400/20'\n                }`}>");
content = content.replace(/ border-red-400\/20'\\n                        \}\\`\}>/g, " border-red-400/20'\n                        }`}>");

fs.writeFileSync('src/AdminManagementPage.tsx', content);
