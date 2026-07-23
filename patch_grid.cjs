const fs = require('fs');

let adminPages = fs.readFileSync('src/AdminPages.tsx', 'utf-8');

// Replace the grid class
adminPages = adminPages.replace(
  'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"',
  'className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-6"'
);

// Remove max-w-xs from description
adminPages = adminPages.replace(
  'className="text-sm text-[#B8C0D0] text-center line-clamp-2 w-full max-w-xs"',
  'className="text-sm text-[#B8C0D0] text-center line-clamp-2 w-full"'
);

// Remove max-w-[120px] from publisher username
adminPages = adminPages.replace(
  'className="text-sm font-medium text-white truncate max-w-[120px]"',
  'className="text-sm font-medium text-white truncate w-full"'
);

fs.writeFileSync('src/AdminPages.tsx', adminPages);

console.log("Patched grid layout");
