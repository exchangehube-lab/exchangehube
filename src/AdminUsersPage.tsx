import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminPages';
import { Link } from 'react-router-dom';
import { db, auth } from './firebase';
import {  collection, getDocs, doc, updateDoc, deleteDoc , onSnapshot } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { 
  Users, Search, Filter, ArrowUpDown, MoreVertical, 
  CheckCircle, XCircle, Ban, Mail, ChevronLeft, ChevronRight, X 
} from 'lucide-react';

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, suspended, banned
  const [providerFilter, setProviderFilter] = useState('all'); // all, email, google
  const [verifiedFilter, setVerifiedFilter] = useState('all'); // all, verified, unverified
  
  // Sort state
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Selected User Modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  

  useEffect(() => {
    document.title = 'Users | ExchangeHube Admin';
    setIsLoading(true);
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(fetchedUsers);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching users:", err);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // Remove the old fetchUsers function
  const fetchUsers = async () => {};

  // Actions
  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update user status.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(u => u.id !== userId));
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(null);
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user.");
      }
    }
  };

  const handleSendResetEmail = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset email sent to \${email}`);
    } catch (err) {
      console.error("Error sending reset email:", err);
      alert("Failed to send reset email.");
    }
  };

  // Filtering
  const filteredUsers = users.filter(u => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (u.username && u.username.toLowerCase().includes(query)) ||
      (u.fullName && u.fullName.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.uid && u.uid.toLowerCase().includes(query));
      
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesProvider = providerFilter === 'all' || u.provider === providerFilter;
    
    let matchesVerified = true;
    if (verifiedFilter === 'verified') matchesVerified = u.emailVerified === true;
    if (verifiedFilter === 'unverified') matchesVerified = u.emailVerified === false;

    return matchesSearch && matchesStatus && matchesProvider && matchesVerified;
  });

  // Sorting
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    
    if (sortConfig.key === 'createdAt' || sortConfig.key === 'lastLogin') {
      valA = valA?.toMillis ? valA.toMillis() : 0;
      valB = valB?.toMillis ? valB.toMillis() : 0;
    }
    
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage) || 1;
  const currentUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout>
      <div className="flex flex-col h-full w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-[#B8C0D0] mb-2">
            <Link to="/admin/manage" className="hover:text-white transition-colors">Management</Link>
            <span>/</span>
            <span className="text-white">Users</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Users</h1>
        </div>
        
        {/* Controls */}
        <div className="bg-[#070b1a] border border-white/5 rounded-2xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col xl:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8C0D0]" />
              <input 
                type="text" 
                placeholder="Search by username, name, email or UID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder:text-[#B8C0D0] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
              
              <select 
                value={providerFilter} 
                onChange={(e) => setProviderFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none"
              >
                <option value="all">All Providers</option>
                <option value="email">Email</option>
                <option value="google">Google</option>
              </select>
              
              <select 
                value={verifiedFilter} 
                onChange={(e) => setVerifiedFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none"
              >
                <option value="all">All Verifications</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>

              <select 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'newest') setSortConfig({ key: 'createdAt', direction: 'desc' });
                  if (val === 'oldest') setSortConfig({ key: 'createdAt', direction: 'asc' });
                  if (val === 'lastLogin') setSortConfig({ key: 'lastLogin', direction: 'desc' });
                  if (val === 'alphaAsc') setSortConfig({ key: 'username', direction: 'asc' });
                  if (val === 'alphaDesc') setSortConfig({ key: 'username', direction: 'desc' });
                }}
                className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="lastLogin">Last Login</option>
                <option value="alphaAsc">Username (A-Z)</option>
                <option value="alphaDesc">Username (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#070b1a] border border-white/5 rounded-2xl overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[#B8C0D0] text-sm">
                  <th className="py-4 px-6 font-medium">User</th>
                  <th className="py-4 px-6 font-medium">Contact</th>
                  <th className="py-4 px-6 font-medium">Provider</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                  <th className="py-4 px-6 font-medium">Joined</th>
                  <th className="py-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#B8C0D0]">Loading users...</td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#B8C0D0]">No users found matching criteria.</td>
                  </tr>
                ) : (
                  currentUsers.map(u => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setSelectedUser(u)}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt={u.username} className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-5 h-5 text-purple-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">{u.username || 'N/A'}</p>
                            <p className="text-xs text-[#B8C0D0]">{u.uid}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white">{u.fullName || 'N/A'}</p>
                        <p className="text-xs text-[#B8C0D0]">{u.email || 'N/A'} {u.emailVerified && <CheckCircle className="inline w-3 h-3 text-green-400 ml-1" />}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="capitalize text-[#B8C0D0]">{u.provider}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${
                          u.status === 'active' ? 'bg-green-400/10 text-green-400 border border-green-400/20' :
                          u.status === 'suspended' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' :
                          'bg-red-400/10 text-red-400 border border-red-400/20'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#B8C0D0]">
                        {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setSelectedUser(u)} className="p-2 text-[#B8C0D0] hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-[#B8C0D0]">
            <p>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedUsers.length)} of {sortedUsers.length} users</p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-2">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)}></div>
          <div className="relative bg-[#070b1a] border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#070b1a]/90 backdrop-blur-xl border-b border-white/5 p-6 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                User Profile
              </h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 text-[#B8C0D0] hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-6 mb-8 items-start">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {selectedUser.photoURL ? (
                    <img src={selectedUser.photoURL} alt={selectedUser.username} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-12 h-12 text-purple-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1">{selectedUser.fullName || 'No Name'}</h3>
                  <p className="text-purple-400 font-medium mb-3">@{selectedUser.username || 'unknown'}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium \${
                      selectedUser.status === 'active' ? 'bg-green-400/10 text-green-400 border border-green-400/20' :
                      selectedUser.status === 'suspended' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' :
                      'bg-red-400/10 text-red-400 border border-red-400/20'
                    }`}>
                      {selectedUser.status.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20 capitalize">
                      {selectedUser.provider}
                    </span>
                    {selectedUser.emailVerified && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400 border border-green-400/20">
                        <CheckCircle className="w-3 h-3 mr-1" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                  <p className="text-xs text-[#B8C0D0] mb-1 uppercase tracking-wider">Email Address</p>
                  <p className="text-white font-medium break-all">{selectedUser.email || 'N/A'}</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                  <p className="text-xs text-[#B8C0D0] mb-1 uppercase tracking-wider">Firebase UID</p>
                  <p className="text-white font-mono text-sm break-all">{selectedUser.uid}</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                  <p className="text-xs text-[#B8C0D0] mb-1 uppercase tracking-wider">Created Date</p>
                  <p className="text-white font-medium">
                    {selectedUser.createdAt?.toDate ? selectedUser.createdAt.toDate().toLocaleString() : 'Unknown'}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                  <p className="text-xs text-[#B8C0D0] mb-1 uppercase tracking-wider">Last Login</p>
                  <p className="text-white font-medium">
                    {selectedUser.lastLogin?.toDate ? selectedUser.lastLogin.toDate().toLocaleString() : 'Never or Unknown'}
                  </p>
                </div>
                {selectedUser.organization && (
                  <div className="bg-white/5 border border-white/5 rounded-xl p-4 sm:col-span-2">
                    <p className="text-xs text-[#B8C0D0] mb-1 uppercase tracking-wider">Organization</p>
                    <p className="text-white font-medium">{selectedUser.organization}</p>
                  </div>
                )}
                {selectedUser.bio && (
                  <div className="bg-white/5 border border-white/5 rounded-xl p-4 sm:col-span-2">
                    <p className="text-xs text-[#B8C0D0] mb-1 uppercase tracking-wider">Bio</p>
                    <p className="text-white">{selectedUser.bio}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-white/5 pt-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Admin Actions</h4>
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
                  )}
                  {selectedUser.status !== 'suspended' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedUser.id, 'suspended')}
                      className="px-4 py-2 rounded-xl font-medium text-sm text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors flex items-center gap-2"
                    >
                      <ArrowUpDown className="w-4 h-4" /> Suspend User
                    </button>
                  )}
                  {selectedUser.status !== 'banned' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedUser.id, 'banned')}
                      className="px-4 py-2 rounded-xl font-medium text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors flex items-center gap-2"
                    >
                      <Ban className="w-4 h-4" /> Ban User
                    </button>
                  )}
                  {selectedUser.email && (
                    <button 
                      onClick={() => handleSendResetEmail(selectedUser.email)}
                      className="px-4 py-2 rounded-xl font-medium text-sm text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" /> Send Password Reset
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    className="px-4 py-2 rounded-xl font-medium text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors flex items-center gap-2 ml-auto"
                  >
                    <XCircle className="w-4 h-4" /> Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
