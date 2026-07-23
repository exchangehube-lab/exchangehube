const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf-8');

const routeToAdd = `
      <Route path="/Admin/request/bot" element={<Navigate to="/Admin/requests/bot" replace />} />
      <Route path="/Admin/request/user" element={<Navigate to="/Admin/requests/user" replace />} />
      <Route path="/admin/request/bot" element={<Navigate to="/Admin/requests/bot" replace />} />
      <Route path="/admin/request/user" element={<Navigate to="/Admin/requests/user" replace />} />
`;

appTsx = appTsx.replace('<Route path="/Admin/requests/bot"', routeToAdd + '      <Route path="/Admin/requests/bot"');

fs.writeFileSync('src/App.tsx', appTsx);

console.log("Added alias routes");
