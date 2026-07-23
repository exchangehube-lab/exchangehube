const fs = require('fs');
let content = fs.readFileSync('src/AdminUsersPage.tsx', 'utf-8');

// I will add View Profile and Edit User buttons inside the Action cell in the table, or inside the modal.
// I will just put them inside the modal.
const oldModalActions = `                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Admin Actions</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedUser.status !== 'active' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedUser.id, 'active')}
                      className="px-4 py-2 rounded-xl font-medium text-sm text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Activate User
                    </button>
                  )}`;

const newModalActions = `                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Admin Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => alert('View Profile clicked')}
                    className="px-4 py-2 rounded-xl font-medium text-sm text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-colors flex items-center gap-2"
                  >
                    View Profile
                  </button>
                  <button 
                    onClick={() => alert('Edit User clicked')}
                    className="px-4 py-2 rounded-xl font-medium text-sm text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors flex items-center gap-2"
                  >
                    Edit User
                  </button>
                  {selectedUser.status !== 'active' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedUser.id, 'active')}
                      className="px-4 py-2 rounded-xl font-medium text-sm text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Activate User
                    </button>
                  )}`;

content = content.replace(oldModalActions, newModalActions);
fs.writeFileSync('src/AdminUsersPage.tsx', content);
