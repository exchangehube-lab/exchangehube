import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Cpu, CheckCircle2, ChevronLeft, ChevronRight, X, User } from 'lucide-react';
import { collection, onSnapshot, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { AdminLayout } from './AdminPages';

export function AdminBotsPage() {
  const [bots, setBots] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Sort state
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modals
  const [deleteDialogBotId, setDeleteDialogBotId] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Bots | ExchangeHube Admin';
    // Fetch users for publisher info
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const uMap: Record<string, any> = {};
      snapshot.forEach(doc => {
        uMap[doc.id] = doc.data();
      });
      setUsersMap(uMap);
    });

    // Fetch approved bots
    const q = query(collection(db, 'bots'), where('status', 'in', ['approved', 'suspended']));
    const unsubBots = onSnapshot(q, (snapshot) => {
      const fetchedBots = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBots(fetchedBots);
      setIsLoading(false);
    });

    return () => {
      unsubUsers();
      unsubBots();
    };
  }, []);

  const handleToggleStatus = async (botId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'approved' ? 'suspended' : 'approved';
      await updateDoc(doc(db, 'bots', botId), { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialogBotId) return;
    try {
      await deleteDoc(doc(db, 'bots', deleteDialogBotId));
      setDeleteDialogBotId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter
  const filteredBots = bots.filter(bot => {
    const publisher = usersMap[bot.ownerUid] || {};
    const matchesSearch = 
      (bot.botName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (publisher.username || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || bot.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort
  const sortedBots = [...filteredBots].sort((a, b) => {
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
  const totalPages = Math.ceil(sortedBots.length / itemsPerPage) || 1;
  const currentBots = sortedBots.slice(
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
            <span className="text-white">Bots</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Bots</h1>
        </div>

        {/* Controls */}
        <div className="bg-[#070b1a] border border-white/5 rounded-2xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col xl:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8C0D0]" />
              <input 
                type="text" 
                placeholder="Search by bot name or publisher..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder:text-[#B8C0D0] focus:outline-none focus:border-purple-500/50 transition-all text-sm"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="suspended">Suspended</option>
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
                <option value="totalLikes-desc">Most Likes</option>
                <option value="averageRating-desc">Highest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-[#B8C0D0]">Loading bots...</div>
        ) : currentBots.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentBots.map(bot => {
                const publisher = usersMap[bot.ownerUid] || {};
                
                return (
                  <div key={bot.id} className="bg-[#070b1a] border border-white/5 rounded-3xl p-5 relative flex flex-col hover:border-purple-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {bot.botImageURL ? (
                          <img src={bot.botImageURL} alt={bot.botName} className="w-full h-full object-cover" />
                        ) : (
                          <Cpu className="w-8 h-8 text-purple-400" />
                        )}
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        bot.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {bot.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1 truncate">{bot.botName}</h3>
                    <p className="text-xs text-[#B8C0D0] mb-4">
                      {bot.createdAt?.toDate ? bot.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden shrink-0 border border-white/20">
                        {publisher.profilePhotoURL ? (
                          <img src={publisher.profilePhotoURL} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <User className="w-3 h-3 m-auto text-[#B8C0D0] mt-1.5" />
                        )}
                      </div>
                      <span className="text-sm text-[#B8C0D0] truncate">
                        {publisher.username || 'Unknown'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-5">
                      <div className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] text-[#B8C0D0] uppercase tracking-wider mb-1">Mine/Type</span>
                        <span className="text-xs font-bold text-white truncate w-full">{bot.category || 'N/A'}</span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] text-[#B8C0D0] uppercase tracking-wider mb-1">Currency</span>
                        <span className="text-xs font-bold text-purple-400 truncate w-full">{bot.botCurrency || 'N/A'}</span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] text-[#B8C0D0] uppercase tracking-wider mb-1">Rating</span>
                        <span className="text-xs font-bold text-yellow-400">{bot.averageRating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] text-[#B8C0D0] uppercase tracking-wider mb-1">Likes/Dislikes</span>
                        <span className="text-xs font-bold text-white">{bot.totalLikes || 0} / {bot.totalDislikes || 0}</span>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center gap-2">
                      <button 
                        onClick={() => handleToggleStatus(bot.id, bot.status)}
                        className={`flex-1 py-2 border rounded-xl text-xs font-medium transition-colors ${
                          bot.status === 'approved' 
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20' 
                            : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                        }`}
                      >
                        {bot.status === 'approved' ? 'Suspend' : 'Reactivate'}
                      </button>
                      <button 
                        onClick={() => setDeleteDialogBotId(bot.id)}
                        className="flex-1 py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-xs font-medium transition-colors"
                      >
                        Delete
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
          <div className="text-center py-12 text-[#B8C0D0]">
            No bots found matching your criteria.
          </div>
        )}

        {/* Delete Modal */}
        {deleteDialogBotId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteDialogBotId(null)}></div>
            <div className="relative bg-[#070b1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">Delete Bot</h3>
              <p className="text-[#B8C0D0] mb-6">Are you sure you want to permanently delete this bot?</p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setDeleteDialogBotId(null)}
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
