import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Hash, ChevronLeft, ChevronRight, X, ExternalLink, User, Trash2, Check } from 'lucide-react';
import { collection, onSnapshot, query, where, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { AdminLayout } from './AdminPages';

export function AdminChannelsPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // Public Channel, Private Channel
  
  // Sort state
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modals
  const [deleteDialogChannelId, setDeleteDialogChannelId] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Channels | ExchangeHube Admin';
    // Fetch users for owner info
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const uMap: Record<string, any> = {};
      snapshot.forEach(doc => {
        uMap[doc.id] = doc.data();
      });
      setUsersMap(uMap);
    });

    // Fetch all channels (except pending if you want to skip pending, but instructions say "Manage all existing channels")
    const channelsRef = collection(db, 'channels');
    const unsubChannels = onSnapshot(channelsRef, (snapshot) => {
      const fetchedChannels = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChannels(fetchedChannels);
      setIsLoading(false);
    });

    return () => {
      unsubUsers();
      unsubChannels();
    };
  }, []);

  const handleToggleStatus = async (channelId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await updateDoc(doc(db, 'channels', channelId), { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialogChannelId) return;
    try {
      await deleteDoc(doc(db, 'channels', deleteDialogChannelId));
      setDeleteDialogChannelId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter
  const filteredChannels = channels.filter(channel => {
    const owner = usersMap[channel.ownerUid] || {};
    const matchesSearch = 
      (channel.channelName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (channel.channelUsername || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (owner.username || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || channel.status === statusFilter;
    const matchesType = typeFilter === 'all' || channel.channelType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort
  const sortedChannels = [...filteredChannels].sort((a, b) => {
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    
    if (sortConfig.key === 'createdAt') {
      valA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      valB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    }
    
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedChannels.length / itemsPerPage) || 1;
  const currentChannels = sortedChannels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout>
      <div className="flex flex-col h-full w-full relative">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-[#B8C0D0] mb-2">
            <Link to="/admin/manage" className="hover:text-white transition-colors">Management</Link>
            <span>/</span>
            <span className="text-white">Channels</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Channels</h1>
        </div>

        {/* Controls */}
        <div className="bg-[#070b1a] border border-white/5 rounded-2xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col xl:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8C0D0]" />
              <input 
                type="text" 
                placeholder="Search by channel name, username, or owner..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder:text-[#B8C0D0] focus:outline-none focus:border-purple-500/50 transition-all text-sm"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="Public Channel">Public</option>
                <option value="Private Channel">Private</option>
              </select>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <select 
                value={`${sortConfig.key}-${sortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split('-');
                  setSortConfig({ key, direction });
                }}
                className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-[#B8C0D0]">Loading channels...</div>
        ) : currentChannels.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[1400px]:grid-cols-4 gap-6">
              {currentChannels.map(channel => {
                const owner = usersMap[channel.ownerUid] || {};

                return (
                  <div key={channel.id} className="bg-[#070b1a] border border-white/5 rounded-3xl p-6 relative flex flex-col hover:border-purple-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {channel.channelImageURL ? (
                          <img src={channel.channelImageURL} alt={channel.channelName} className="w-full h-full object-cover" />
                        ) : (
                          <Hash className="w-6 h-6 text-purple-400" />
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        channel.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                        channel.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {channel.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-white line-clamp-1">{channel.channelName}</h3>
                    <p className="text-xs text-[#B8C0D0] mb-2">
                      {channel.createdAt?.toDate ? channel.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden shrink-0 border border-white/20">
                        {owner.profilePhotoURL ? (
                          <img src={owner.profilePhotoURL} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <User className="w-3 h-3 m-auto text-[#B8C0D0] mt-1.5" />
                        )}
                      </div>
                      <span className="text-sm text-[#B8C0D0] truncate">
                        {owner.username || 'Unknown Owner'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${channel.channelType === 'Public Channel' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {channel.channelType}
                      </span>
                      {channel.postPermission && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${channel.postPermission === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                          {channel.postPermission === 'admin' ? 'Admin Only' : 'Public Post'}
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 flex flex-col gap-2 flex-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#B8C0D0]">Members</span>
                        <span className="text-white font-medium">{channel.members?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#B8C0D0]">Username</span>
                        <span className="text-white font-medium">{channel.channelUsername || 'N/A (Private)'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#B8C0D0]">Link</span>
                        <span className="text-purple-400 font-medium truncate max-w-[120px]">{channel.channelLink}</span>
                      </div>
                    </div>
                    
                    <a 
                      href={`https://${channel.channelLink}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-2 mb-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      Verify Link <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleToggleStatus(channel.id, channel.status)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-xl transition-all font-medium text-xs ${
                          channel.status === 'active' 
                            ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/20 hover:border-orange-500/30' 
                            : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20 hover:border-green-500/30'
                        }`}
                      >
                        {channel.status === 'active' ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                        {channel.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                      <button 
                        onClick={() => setDeleteDialogChannelId(channel.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all font-medium text-xs"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-[#B8C0D0] text-sm">
                  Page <span className="text-white font-medium">{currentPage}</span> of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-[#070b1a] border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
            <h3 className="text-xl font-medium text-white mb-2">No Channels Found</h3>
            <p className="text-[#B8C0D0]">There are no channels matching your criteria.</p>
          </div>
        )}

        {deleteDialogChannelId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteDialogChannelId(null)}></div>
            <div className="relative bg-[#070b1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">Delete Channel</h3>
              <p className="text-[#B8C0D0] mb-6">Are you sure you want to permanently delete this channel?</p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setDeleteDialogChannelId(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
