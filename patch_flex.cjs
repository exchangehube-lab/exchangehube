const fs = require('fs');

let adminPages = fs.readFileSync('src/AdminPages.tsx', 'utf-8');

adminPages = adminPages.replace(
  '<div className="flex flex-col">\n                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Publisher</span>\n                    <span className="text-sm font-medium text-white truncate w-full">',
  '<div className="flex flex-col min-w-0 flex-1">\n                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Publisher</span>\n                    <span className="text-sm font-medium text-white truncate w-full">'
);

fs.writeFileSync('src/AdminPages.tsx', adminPages);

console.log("Patched flex container");
