const fs = require('fs');

let adminUsers = fs.readFileSync('src/AdminUsersPage.tsx', 'utf-8');
adminUsers = adminUsers.replace("const fetchUsers = async () => {};};", "const fetchUsers = async () => {};");
fs.writeFileSync('src/AdminUsersPage.tsx', adminUsers);

let adminMgmt = fs.readFileSync('src/AdminManagementPage.tsx', 'utf-8');
adminMgmt = adminMgmt.replace("const fetchAdmins = async () => {};};", "const fetchAdmins = async () => {};");
fs.writeFileSync('src/AdminManagementPage.tsx', adminMgmt);
