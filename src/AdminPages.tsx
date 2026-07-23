import { BotCard } from "./components/BotCard";
import { BotViewModal } from './BotViewModal';
import React, { useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDoc, collection, getCountFromServer, onSnapshot, query, where, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { presenceService } from './messaging/services/presenceService';
import { Flag, ExternalLink, Check, Eye, Trash2, CheckCircle2, User, Users, Cpu, Hash, Link as LinkIcon, BarChart2, Shield, LogOut, Menu, X, Bell, Settings, ShieldCheck , ChevronDown, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isRequestsExpanded, setIsRequestsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/admin-login');
      } else {
        try {
          const docRef = doc(db, 'Admin', currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (!docSnap.exists()) {
            navigate('/');
            return;
          }
          
          const data = docSnap.data();
          if (data.role !== 'admin' || data.isActive !== true) {
            navigate('/');
            return;
          }
          
          setUser(currentUser);
          setIsAuthChecking(false);
        } catch (err: any) {
          console.warn("Admin check error:", err);
          navigate('/');
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (isAuthChecking) {
    return <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">Loading...</div>;
  }

  const handleLogout = async () => {
    if (auth.currentUser) await presenceService.updatePresence(auth.currentUser.uid, false); await signOut(auth);
    navigate('/admin-login');
  };


  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: Shield },
    { 
      name: 'Management', 
      path: '/admin/manage', 
      icon: Users,
      activePaths: ['/admin/manage', '/admin/users', '/admin/bots', '/admin/channels']
    },
    { name: 'Reports', path: '/admin/reports', icon: Flag },
    { name: 'Charts', path: '/admin/charts', icon: BarChart2 },
    { name: 'Referral Links', path: '/admin/referrals', icon: LinkIcon },
    { 
      name: 'Requests', 
      icon: ClipboardList,
      isSubmenu: true,
      subItems: [
        { name: 'Bot', path: '/admin/requests/bot' },
        { name: 'User', path: '/admin/requests/user' }
      ]
    },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Admin Management', path: '/admin/management', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-hidden font-sans relative selection:bg-purple-500/30 flex">
      {/* Background effects */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Desktop Sidebar */}
      <aside className="flex w-20 lg:w-72 h-screen flex-col bg-[#070b1a]/80 backdrop-blur-xl border-r border-white/5 relative z-20 shrink-0 transition-all duration-300">
        <div className="p-4 lg:p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-purple-600 p-[1px] shadow-[0_0_20px_rgba(220,38,38,0.4)] shrink-0">
            <div className="w-full h-full bg-[#050816] rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-400">
              Admin
            </h1>
            <p className="text-[10px] text-[#B8C0D0] tracking-wider uppercase">Control Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-2 lg:px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item, index) => {
            if (item.isSubmenu) {
              const isAnyChildActive = item.subItems.some(sub => location.pathname === sub.path);
              return (
                <div key={index} className="flex flex-col">
                  <button
                    onClick={() => setIsRequestsExpanded(!isRequestsExpanded)}
                    title={item.name}
                    className={`w-full flex items-center justify-center lg:justify-between gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all duration-300 ${
                      isAnyChildActive
                        ? 'bg-gradient-to-r from-red-600/20 to-purple-600/20 text-white border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.15)]'
                        : 'text-[#B8C0D0] hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                      <item.icon className={`w-5 h-5 shrink-0 ${isAnyChildActive ? 'text-red-400' : 'text-[#B8C0D0]'}`} />
                      <span className="hidden lg:inline font-medium text-sm whitespace-nowrap">{item.name}</span>
                    </div>
                    <ChevronDown className={`hidden lg:block w-4 h-4 transition-transform duration-300 ${isRequestsExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isRequestsExpanded ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                    <div className="flex flex-col gap-1 lg:pl-12 lg:pr-4 items-center lg:items-stretch">
                      {item.subItems.map((sub, subIdx) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <Link
                            key={subIdx}
                            to={sub.path}
                            className={`w-full text-center lg:text-left px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${isSubActive ? 'text-white bg-white/10' : 'text-[#B8C0D0] hover:text-white hover:bg-white/5'}`}
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            const isActive = (item.activePaths ? item.activePaths.includes(location.pathname) : location.pathname === item.path);
            const Icon = item.icon;
            
            return (
              <Link
                key={index}
                to={item.path}
                title={item.name}
                className={`flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-red-600/20 to-purple-600/20 text-white border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.15)]' 
                    : 'text-[#B8C0D0] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-red-400' : 'text-[#B8C0D0]'}`} />
                <span className="hidden lg:inline font-medium text-sm whitespace-nowrap">{item.name}</span>
                {isActive && (
                  <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="flex items-center justify-center lg:justify-start gap-3 w-full px-3 lg:px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-colors font-medium text-sm"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="hidden lg:inline">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto relative z-10 p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalAdmins: 0,
    activeAdmins: 0,
    blockedAdmins: 0,
    bots: 0,
    channels: 0,
    referrals: 0,
    charts: 0
  });

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      let active = 0;
      let blocked = 0;
      snap.forEach(doc => {
        if (doc.data().isBlocked) blocked++;
        else active++;
      });
      setStats(prev => ({ ...prev, totalUsers: snap.size, activeUsers: active, blockedUsers: blocked }));
    }, (err) => console.warn("Error fetching users for stats", err));

    const unsubAdmins = onSnapshot(collection(db, 'Admin'), (snap) => {
      let active = 0;
      let blocked = 0;
      snap.forEach(doc => {
        if (doc.data().isActive === false) blocked++;
        else active++;
      });
      setStats(prev => ({ ...prev, totalAdmins: snap.size, activeAdmins: active, blockedAdmins: blocked }));
    });

    const unsubBots = onSnapshot(collection(db, 'bots'), (snap) => {
      setStats(prev => ({ ...prev, bots: snap.size }));
    }, (err) => { setStats(prev => ({ ...prev, bots: 0 }))});

    const unsubChannels = onSnapshot(collection(db, 'channels'), (snap) => {
      setStats(prev => ({ ...prev, channels: snap.size }));
    }, (err) => { setStats(prev => ({ ...prev, channels: 0 }))});

    const unsubReferrals = onSnapshot(collection(db, 'referrals'), (snap) => {
      setStats(prev => ({ ...prev, referrals: snap.size }));
    }, (err) => { setStats(prev => ({ ...prev, referrals: 0 }))});

    const unsubCharts = onSnapshot(collection(db, 'charts'), (snap) => {
      setStats(prev => ({ ...prev, charts: snap.size }));
    }, (err) => { setStats(prev => ({ ...prev, charts: 0 }))});

    return () => {
      unsubUsers();
      unsubAdmins();
      unsubBots();
      unsubChannels();
      unsubReferrals();
      unsubCharts();
    };
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col h-full w-full">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#070b1a] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <p className="text-sm text-[#B8C0D0] mb-1">Total Users</p>
            <h3 className="text-2xl font-bold text-white">{stats.totalUsers}</h3>
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1 text-green-400"><span className="w-2 h-2 rounded-full bg-green-400"></span>{stats.activeUsers} Active</div>
              <div className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400"></span>{stats.blockedUsers} Blocked</div>
            </div>
          </div>

          <div className="bg-[#070b1a] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <p className="text-sm text-[#B8C0D0] mb-1">Total Admins</p>
            <h3 className="text-2xl font-bold text-white">{stats.totalAdmins}</h3>
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1 text-green-400"><span className="w-2 h-2 rounded-full bg-green-400"></span>{stats.activeAdmins} Active</div>
              <div className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400"></span>{stats.blockedAdmins} Blocked</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Total Bots', value: stats.bots, icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-400/10' },
            { title: 'Total Channels', value: stats.channels, icon: Hash, color: 'text-pink-400', bg: 'bg-pink-400/10' },
            { title: 'Referral Links', value: stats.referrals, icon: LinkIcon, color: 'text-green-400', bg: 'bg-green-400/10' },
            { title: 'Total Charts', value: stats.charts, icon: BarChart2, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-[#070b1a] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-[#B8C0D0] mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}


export function AdminChartsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-display font-bold text-white">Charts</h1>
        <p className="text-[#B8C0D0]">Charts management coming soon.</p>
      </div>
    </AdminLayout>
  );
}

export function AdminReferralsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-display font-bold text-white">Referral Links</h1>
        <p className="text-[#B8C0D0]">Referrals management coming soon.</p>
      </div>
    </AdminLayout>
  );
}

export function AdminNotificationsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-display font-bold text-white">Notifications</h1>
        <p className="text-[#B8C0D0]">Notifications management coming soon.</p>
      </div>
    </AdminLayout>
  );
}

export function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-display font-bold text-white">Settings</h1>
        <p className="text-[#B8C0D0]">Admin settings coming soon.</p>
      </div>
    </AdminLayout>
  );
}

export function AdminBotRequestsPage() {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialogBotId, setRejectDialogBotId] = useState<string | null>(null);

  useEffect(() => {
    const botsRef = collection(db, 'bots');
    const q = query(botsRef, where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setBots(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePublish = async (botId: string) => {
    try {
      await updateDoc(doc(db, 'bots', botId), { status: 'approved' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!rejectDialogBotId) return;
    try {
      await updateDoc(doc(db, 'bots', rejectDialogBotId), { status: 'rejected' });
      setRejectDialogBotId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Bot Requests</h1>
        <p className="text-sm text-[#B8C0D0]">Review and manage pending bots</p>

        {loading ? (
          <div className="text-center py-8 text-[#B8C0D0]">Loading...</div>
        ) : bots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map(bot => (
              <div key={bot.id} className="bg-[#070b1a] border border-white/5 rounded-3xl p-6 relative flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden shrink-0">
                    {bot.botImageURL ? <img src={bot.botImageURL} className="w-full h-full object-cover" /> : <Cpu className="w-6 h-6 m-3 text-purple-400" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{bot.botName}</h3>
                    <p className="text-xs text-[#B8C0D0] uppercase tracking-wider">{bot.category}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handlePublish(bot.id)} className="flex-1 py-2 bg-green-500/10 text-green-400 rounded-xl font-medium border border-green-500/20 text-sm">Approve</button>
                  <button onClick={() => setRejectDialogBotId(bot.id)} className="flex-1 py-2 bg-red-500/10 text-red-400 rounded-xl font-medium border border-red-500/20 text-sm">Reject</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#070b1a] border border-white/5 rounded-3xl p-8 text-center">
            <h3 className="text-xl font-medium text-white mb-2">No pending requests</h3>
            <p className="text-[#B8C0D0]">There are no pending bot requests to review.</p>
          </div>
        )}

        {rejectDialogBotId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRejectDialogBotId(null)}></div>
            <div className="relative bg-[#070b1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold text-white mb-2">Reject Request</h3>
              <p className="text-[#B8C0D0] mb-6">Are you sure you want to reject this bot request?</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setRejectDialogBotId(null)} className="px-4 py-2 bg-white/5 text-white rounded-lg">Cancel</button>
                <button onClick={handleReject} className="px-4 py-2 bg-red-500 text-white rounded-lg">Reject</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export function AdminUserRequestsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: 'active' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: 'rejected' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">User Requests</h1>
        <p className="text-sm text-[#B8C0D0]">Review and manage pending user registrations</p>

        {loading ? (
          <div className="text-center py-8 text-[#B8C0D0]">Loading...</div>
        ) : users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(user => (
              <div key={user.id} className="bg-[#070b1a] border border-white/5 rounded-3xl p-6 relative flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 overflow-hidden shrink-0">
                    {user.profilePhotoURL ? <img src={user.profilePhotoURL} className="w-full h-full object-cover" /> : <User className="w-6 h-6 m-3 text-purple-400" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{user.username || user.email}</h3>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleApprove(user.id)} className="flex-1 py-2 bg-green-500/10 text-green-400 rounded-xl font-medium border border-green-500/20 text-sm">Approve</button>
                  <button onClick={() => handleReject(user.id)} className="flex-1 py-2 bg-red-500/10 text-red-400 rounded-xl font-medium border border-red-500/20 text-sm">Reject</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#070b1a] border border-white/5 rounded-3xl p-8 text-center">
            <h3 className="text-xl font-medium text-white mb-2">No pending user requests.</h3>
            <p className="text-[#B8C0D0]">There are no pending user requests to review.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
