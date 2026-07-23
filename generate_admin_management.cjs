const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminPages';
import { db, auth } from './firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { 
  ShieldCheck, Search, Plus, MoreVertical, 
  CheckCircle, XCircle, Ban, Mail, X, Shield, Lock, Trash2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminManagementPage() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  
  // Password Change Modal (Current User)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Add Admin Modal
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [addAdminError, setAddAdminError] = useState('');
  const [addAdminSuccess, setAddAdminSuccess] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'Admin'));
      const fetchedAdmins = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAdmins(fetchedAdmins);

      if (auth.currentUser) {
        const current = fetchedAdmins.find(a => a.id === auth.currentUser?.uid);
        if (current) {
          setCurrentUserData(current);
        }
      }
    } catch (err) {
      console.error("Error fetching admins:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (!auth.currentUser || !auth.currentUser.email) {
      setPasswordError("No authenticated user found.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      await updatePassword(auth.currentUser, newPassword);
      
      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        setIsChangePasswordModalOpen(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err: any) {
      console.error("Error changing password:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setPasswordError("Current password is incorrect.");
      } else {
        setPasswordError(err.message || "Failed to update password.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdminError('');
    setAddAdminSuccess('');

    if (!newAdminEmail || !newAdminPassword) {
      setAddAdminError("Please fill in all fields.");
      return;
    }

    setIsAddingAdmin(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, newAdminEmail, newAdminPassword);
      const newUid = userCredential.user.uid;

      await setDoc(doc(db, 'Admin', newUid), {
        displayName: "ExchangeHube Admin",
        email: newAdminEmail,
        role: "admin",
        isActive: true,
        createdAt: serverTimestamp()
      });

      setAddAdminSuccess("New admin created successfully.");
      setNewAdminEmail('');
      setNewAdminPassword('');
      fetchAdmins();
      setTimeout(() => {
        setIsAddAdminModalOpen(false);
        setAddAdminSuccess('');
      }, 2000);
    } catch (err: any) {
      console.error("Error creating admin:", err);
      setAddAdminError(err.message || "Failed to create admin.");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleUpdateStatus = async (adminId: string, isActive: boolean) => {
    if (adminId === auth.currentUser?.uid) {
      alert("You cannot deactivate your own account.");
      return;
    }
    try {
      await updateDoc(doc(db, 'Admin', adminId), { isActive });
      setAdmins(admins.map(a => a.id === adminId ? { ...a, isActive } : a));
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update admin status.");
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (adminId === auth.currentUser?.uid) {
      alert("You cannot delete your own account.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this admin? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'Admin', adminId));
        setAdmins(admins.filter(a => a.id !== adminId));
      } catch (err) {
        console.error("Error deleting admin:", err);
        alert("Failed to delete admin.");
      }
    }
  };

  const handleSendResetEmail = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert(\`Password reset email sent to \${email}\`);
    } catch (err) {
      console.error("Error sending reset email:", err);
      alert("Failed to send reset email.");
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-full w-full max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Admin Management</h1>
          <button
            onClick={() => setIsAddAdminModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]"
          >
            <Plus className="w-5 h-5" />
            Create Admin
          </button>
        </div>
        
        {/* Current Admin Info */}
        <div className="bg-[#070b1a] border border-white/5 rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck className="w-32 h-32 text-purple-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Your Admin Profile
          </h2>
          
          {currentUserData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              <div>
                <p className="text-xs text-[#B8C0D0] uppercase tracking-wider mb-1">Display Name</p>
                <p className="text-white font-medium">{currentUserData.displayName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-[#B8C0D0] uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-white font-medium">{currentUserData.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-[#B8C0D0] uppercase tracking-wider mb-1">Role</p>
                <p className="text-white font-medium capitalize">{currentUserData.role || 'Admin'}</p>
              </div>
              <div>
                <p className="text-xs text-[#B8C0D0] uppercase tracking-wider mb-1">Account Status</p>
                <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${
                  currentUserData.isActive ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 'bg-red-400/10 text-red-400 border border-red-400/20'
                }\`}>
                  {currentUserData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[#B8C0D0]">Loading profile data...</p>
          )}

          <div className="mt-6 pt-6 border-t border-white/5 flex relative z-10">
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>
          </div>
        </div>

        {/* Admins List */}
        <h2 className="text-lg font-bold text-white mb-4">Admin Accounts</h2>
        <div className="bg-[#070b1a] border border-white/5 rounded-2xl overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[#B8C0D0] text-sm">
                  <th className="py-4 px-6 font-medium">Admin</th>
                  <th className="py-4 px-6 font-medium">Role</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                  <th className="py-4 px-6 font-medium">Created Date</th>
                  <th className="py-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#B8C0D0]">Loading admins...</td>
                  </tr>
                ) : admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#B8C0D0]">No admin accounts found.</td>
                  </tr>
                ) : (
                  admins.map(admin => (
                    <tr key={admin.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-medium text-white">{admin.displayName || 'Admin'}</p>
                        <p className="text-xs text-[#B8C0D0]">{admin.email}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="capitalize text-[#B8C0D0]">{admin.role || 'Admin'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${
                          admin.isActive ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 'bg-red-400/10 text-red-400 border border-red-400/20'
                        }\`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#B8C0D0]">
                        {admin.createdAt?.toDate ? admin.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {!admin.isActive ? (
                            <button 
                              onClick={() => handleUpdateStatus(admin.id, true)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 transition-colors"
                            >
                              Activate
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUpdateStatus(admin.id, false)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
                              disabled={admin.id === auth.currentUser?.uid}
                            >
                              Deactivate
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              if (admin.id === auth.currentUser?.uid) {
                                setIsChangePasswordModalOpen(true);
                              } else {
                                handleSendResetEmail(admin.email);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                          >
                            Change Password
                          </button>
                          <button 
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            disabled={admin.id === auth.currentUser?.uid}
                            title="Delete Admin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isChangingPassword && setIsChangePasswordModalOpen(false)}></div>
          <div className="relative bg-[#070b1a] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Change Password</h2>
              <button 
                onClick={() => setIsChangePasswordModalOpen(false)} 
                disabled={isChangingPassword}
                className="p-2 text-[#B8C0D0] hover:text-white rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="p-6">
              {passwordError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#B8C0D0] mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#B8C0D0] mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#B8C0D0] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  disabled={isChangingPassword}
                  className="px-4 py-2 text-[#B8C0D0] hover:text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {isAddAdminModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isAddingAdmin && setIsAddAdminModalOpen(false)}></div>
          <div className="relative bg-[#070b1a] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Create Admin</h2>
              <button 
                onClick={() => setIsAddAdminModalOpen(false)} 
                disabled={isAddingAdmin}
                className="p-2 text-[#B8C0D0] hover:text-white rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAdmin} className="p-6">
              {addAdminError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {addAdminError}
                </div>
              )}
              {addAdminSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  {addAdminSuccess}
                </div>
              )}
              
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                Note: Creating a new admin may automatically sign you in as the new user in some browsers due to Firebase SDK behavior. You may need to log back in as yourself afterward.
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#B8C0D0] mb-1">Email</label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#B8C0D0] mb-1">Password</label>
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddAdminModalOpen(false)}
                  disabled={isAddingAdmin}
                  className="px-4 py-2 text-[#B8C0D0] hover:text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingAdmin}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isAddingAdmin ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
`;

fs.writeFileSync('src/AdminManagementPage.tsx', content);
