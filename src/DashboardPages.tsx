import { BotViewModal } from './BotViewModal';
import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, storage } from './firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc, runTransaction, setDoc, arrayUnion, serverTimestamp, collection, addDoc, deleteDoc, query, where, onSnapshot, orderBy, getCountFromServer } from "firebase/firestore";
import { db } from "./firebase";
import {
  Menu, X, BarChart2, Cpu, Link as LinkIcon, Hash, User, 
  Search, Filter, ArrowDownUp, Plus, Star, MoreVertical,
  Settings, LogOut, Edit, Key, Shield, ExternalLink, ChevronRight, ChevronDown, Upload
, Eye, MessageCircle, Trash2, Copy, Share, Lock } from 'lucide-react';

import { presenceService } from "./messaging";
import { BotCard } from "./components/BotCard";
import { ImagePickerOptionsModal } from './components/ImagePickerOptionsModal';
import { ImageCropperModal } from './components/ImageCropperModal';

export const uploadToCloudinary = async (file: File): Promise<string> => {
  if (!auth.currentUser) throw new Error("Unauthenticated. Please log in to upload files.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Image file is too large. Maximum size is 10MB");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "exchangehube_profile_pics");

  const res = await fetch(`https://api.cloudinary.com/v1_1/p0w589ih/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error("Failed to upload image");
  }
  const data = await res.json();
  return data.secure_url;
};

export function DashboardLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirmMenu, setShowLogoutConfirmMenu] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [joinedChannels, setJoinedChannels] = useState<any[]>([]);

  useEffect(() => {
    if (location.pathname === '/channels' || location.pathname === '/messages' || location.pathname.startsWith('/channels/') || location.pathname.startsWith('/messages/')) {
      localStorage.setItem('last_chat_path', location.pathname);
    }
  }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/');
      } else {
        try {
          const docRef = doc(db, 'Admin', currentUser.uid);
          const docSnap = await getDoc(docRef);
          
        } catch (err) {
          console.warn("Admin check error:", err);
        }
        setUser(currentUser);
        presenceService.updatePresence(currentUser.uid, true).catch(console.error);
        setIsAuthChecking(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  
  useEffect(() => {
    if (!user) return;
    
    const channelsRef = collection(db, 'channels');
    const q = query(channelsRef, where('members', 'array-contains', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const channelsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      channelsData.sort((a: any, b: any) => {
        const nameA = a.channelName || '';
        const nameB = b.channelName || '';
        return nameA.localeCompare(nameB);
      });
      setJoinedChannels(channelsData);
    }, (error) => {
      console.error("Error fetching joined channels:", error);
    });
    
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        presenceService.updatePresence(user.uid, true).catch(console.error);
      } else {
        presenceService.updatePresence(user.uid, false).catch(console.error);
      }
    };
    
    const handleBeforeUnload = () => {
      presenceService.updatePresence(user.uid, false).catch(console.error);
    };

    const handleOffline = () => {
      presenceService.updatePresence(user.uid, false).catch(console.error);
    };

    const handleOnline = () => {
      presenceService.updatePresence(user.uid, true).catch(console.error);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [user]);



  if (isAuthChecking) {
    return <div className="min-h-screen bg-[#050816]"></div>;
  }

  const navItems = [
    { name: 'Chat', path: '/messages', icon: MessageCircle },
    { name: 'Bot', path: '/bots/trending', icon: Cpu },
    { name: 'Channel', path: '/channels', icon: Hash },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-hidden font-sans relative selection:bg-purple-500/30 flex">
      {/* Background effects */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden w-72 h-screen flex-col bg-[#070b1a]/80 backdrop-blur-xl border-r border-white/5 relative z-20 shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 p-[1px] shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <div className="w-full h-full bg-[#050816] rounded-xl flex items-center justify-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-display font-bold tracking-wider">EH</span>
            </div>
          </div>
          <span className="font-display font-bold text-xl tracking-tight">ExchangeHube</span>
        </div>
        
        <div className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button 
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-[#B8C0D0] hover:bg-white/5 hover:text-white border border-transparent'}`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : ''}`} />
                <span className="font-medium">{item.name}</span>
              </button>
            );
                    })}
          
          {joinedChannels.length > 0 && (
            <div className="mt-4 border-t border-white/5 pt-4">
              <div className="px-4 mb-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">Joined Channels</div>
              {joinedChannels.map(channel => (
                <button 
                  key={channel.id}
                  onClick={() => navigate(`/channels/${channel.id}/chat`)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${location.pathname === `/channels/${channel.id}/chat` ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-[#B8C0D0] hover:bg-white/5 hover:text-white border border-transparent'}`}
                >
                  <Hash className={`w-4 h-4 ${location.pathname === `/channels/${channel.id}/chat` ? 'text-purple-400' : 'opacity-50'}`} />
                  <span className="font-medium text-sm truncate">{channel.channelName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-white/5">
          <button 
            onClick={() => setShowLogoutConfirmMenu(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      <div className={`fixed inset-0 z-[60] flex transition-all duration-300 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsSidebarOpen(false)}
        />
        
        <div className={`relative w-[280px] max-w-[80vw] h-full bg-[#070b1a] border-r border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.5)] flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 p-[1px]">
                <div className="w-full h-full bg-[#050816] rounded-lg flex items-center justify-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-display font-bold text-xs tracking-wider">EH</span>
                </div>
              </div>
              <span className="font-display font-bold tracking-tight">ExchangeHube</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 -mr-2 text-[#B8C0D0] hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
            {navItems.map((item, index) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <button 
                  key={index}
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-[#B8C0D0] hover:bg-white/5 hover:text-white border border-transparent'}`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : ''}`} />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
                      })}
          
          {joinedChannels.length > 0 && (
            <div className="mt-4 border-t border-white/5 pt-4">
              <div className="px-4 mb-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">Joined Channels</div>
              {joinedChannels.map(channel => (
                <button 
                  key={channel.id}
                  onClick={() => navigate(`/channels/${channel.id}/chat`)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${location.pathname === `/channels/${channel.id}/chat` ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-[#B8C0D0] hover:bg-white/5 hover:text-white border border-transparent'}`}
                >
                  <Hash className={`w-4 h-4 ${location.pathname === `/channels/${channel.id}/chat` ? 'text-purple-400' : 'opacity-50'}`} />
                  <span className="font-medium text-sm truncate">{channel.channelName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-white/5">
             <button 
                onClick={() => {
                  setIsSidebarOpen(false);
                  setShowLogoutConfirmMenu(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
             </button>
          </div>
        </div>
      </div>

      
      {/* Logout Confirmation Dialog */}
      {showLogoutConfirmMenu && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirmMenu(false)}></div>
          <div className="relative bg-[#070b1a] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Logout</h3>
            <p className="text-[#B8C0D0] mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirmMenu(false)}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowLogoutConfirmMenu(false);
                  if (auth.currentUser) await presenceService.updatePresence(auth.currentUser.uid, false); await signOut(auth);
                  localStorage.clear();
                  navigate('/');
                }}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10 w-full overflow-hidden">
        {/* Top Bar for Mobile & User Profile */}
        <div className="h-20 border-b border-white/5 bg-[#050816]/50 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-[#B8C0D0] hover:text-white transition-colors rounded-lg hover:bg-white/5"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
            <span className="font-display font-bold tracking-tight">ExchangeHube</span>
          </div>

          <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-[#070b1a] hover:bg-white/5 hover:border-white/20 transition-all group overflow-hidden shrink-0">
             <User className="w-5 h-5 text-[#B8C0D0] group-hover:text-purple-400 transition-colors" />
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="mx-auto w-full h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChartsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Charts</h1>
          <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Chart
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8C0D0]" />
            <input 
              type="text" 
              placeholder="Search charts..." 
              className="w-full bg-[#070b1a] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors shadow-inner"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-3 bg-[#070b1a] border border-white/5 rounded-xl text-[#B8C0D0] hover:text-white hover:border-white/10 transition-colors flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="px-4 py-3 bg-[#070b1a] border border-white/5 rounded-xl text-[#B8C0D0] hover:text-white hover:border-white/10 transition-colors flex items-center gap-2 text-sm">
              <ArrowDownUp className="w-4 h-4" /> Sort
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-white/5 bg-[#070b1a]/50 backdrop-blur-sm rounded-3xl p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5 flex items-center justify-center mb-6 relative group">
            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <BarChart2 className="w-10 h-10 text-purple-400 opacity-80" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No charts available</h3>
          <p className="text-[#B8C0D0] text-sm max-w-sm mx-auto mb-6">
            Get started by creating your first chart to monitor market trends and technical analysis.
          </p>
          <button className="px-6 py-2 border border-white/20 hover:bg-white/5 text-white rounded-full font-medium transition-all text-sm">
            Create New Chart
          </button>
        </div>


      </div>
    
    </DashboardLayout>
  );
}

export function BotsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Trading Bots</h1>
          <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Bot
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8C0D0]" />
            <input 
              type="text" 
              placeholder="Search bots..." 
              className="w-full bg-[#070b1a] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors shadow-inner"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {['All Bots', 'Grid', 'DCA', 'Arbitrage'].map((cat, i) => (
              <button key={cat} className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${i === 0 ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'bg-[#070b1a] border border-white/5 text-[#B8C0D0] hover:text-white hover:border-white/10'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2 text-white">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />
          <h2 className="text-xl font-medium tracking-tight">Featured Bots</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[1400px]:grid-cols-4 w-full gap-6 mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#070b1a] border border-white/5 rounded-3xl p-6 relative group overflow-hidden hover:border-purple-500/30 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-purple-400" />
                </div>
                <button className="text-[#B8C0D0] hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-medium text-white mb-2 relative z-10">Alpha Grid Bot {i}</h3>
              <p className="text-sm text-[#B8C0D0] mb-6 relative z-10">High frequency trading strategy optimized for sideways markets.</p>
              <div className="flex justify-between items-center relative z-10">
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[11px] text-[#B8C0D0] uppercase tracking-wider font-semibold mb-1">Status</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                    <span className="text-sm text-emerald-400 font-medium">Active</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white font-medium transition-colors">
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </DashboardLayout>
  );
}

export function ReferralsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Referral Links</h1>
          <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Link
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8C0D0]" />
            <input 
              type="text" 
              placeholder="Search referral links..." 
              className="w-full bg-[#070b1a] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors shadow-inner"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {['Exchanges', 'Tools', 'Wallets', 'Services'].map((cat, i) => (
              <button key={cat} className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${i === 0 ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'bg-[#070b1a] border border-white/5 text-[#B8C0D0] hover:text-white hover:border-white/10'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#070b1a] border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row gap-6 relative group hover:border-purple-500/30 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <LinkIcon className="w-8 h-8 text-[#B8C0D0]" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-white">Binance Exchange</h3>
                  <span className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider">Active</span>
                </div>
                <p className="text-sm text-[#B8C0D0] mb-4">20% discount on trading fees for lifetime.</p>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm text-white font-mono flex items-center justify-between">
                    <span className="truncate">https://binance.com/en/register?ref=X...</span>
                  </div>
                  <button className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors" title="Copy Link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </DashboardLayout>
  );
}

const APP_DOMAIN = 'eh.me';

export function ChannelsPage() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  
  // Edit Channel Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editChannelId, setEditChannelId] = useState<string | null>(null);
  const [editChannelName, setEditChannelName] = useState('');
  const [editChannelBio, setEditChannelBio] = useState('');
  const [editChannelUsername, setEditChannelUsername] = useState('');
  const [editChannelLink, setEditChannelLink] = useState('');
  const [editChannelType, setEditChannelType] = useState('Public Channel');
  const [editPostPermission, setEditPostPermission] = useState('admin');
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState<string>('');
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [editShowChannelPicker, setEditShowChannelPicker] = useState(false);
  const [editCropperState, setEditCropperState] = useState<{isOpen: boolean, src: string}>({ isOpen: false, src: '' });
  
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const openEditModal = (channel: any) => {
    setEditChannelId(channel.id);
    setEditChannelName(channel.channelName || '');
    setEditChannelBio(channel.channelBio || '');
    setEditChannelUsername(channel.channelUsername || '');
    setEditChannelLink(channel.channelLink || '');
    setEditChannelType(channel.channelType || 'Public Channel');
    setEditPostPermission(channel.postPermission || 'admin');
    setEditLogoPreview(channel.channelImageURL || '');
    setEditLogoFile(null);
    setEditMessage('');
    setShowEditModal(true);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditCropperState({
          isOpen: true,
          src: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditCropperSave = async (croppedFile: File, previewUrl: string, setProgress: (msg: string) => void) => {
    const url = await uploadToCloudinary(croppedFile);
    setEditLogoPreview(url);
    setEditLogoFile(null); // URL is ready
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editChannelName || !editChannelBio) {
      setEditMessage("Please fill in all required fields.");
      return;
    }
    
    setIsEditSubmitting(true);
    setEditMessage('');
    
    try {
      let finalImageURL = editLogoPreview;
      
      const updateData: any = {
        channelName: editChannelName,
        channelBio: editChannelBio,
        channelType: editChannelType,
        postPermission: editPostPermission,
        updatedAt: serverTimestamp(),
      };
      
      if (finalImageURL) {
        updateData.channelImageURL = finalImageURL;
      }
      
      if (editChannelType === 'Private Channel' && editChannelLink) {
        updateData.channelLink = editChannelLink;
      }
      
      await updateDoc(doc(db, 'channels', editChannelId!), updateData);
      setShowEditModal(false);
    } catch (err: any) {
      console.error(err);
      setEditMessage(err.message || "Failed to update channel. Please try again.");
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Add Channel Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [channelName, setChannelName] = useState('');
  const [channelBio, setChannelBio] = useState('');
  const [channelUsername, setChannelUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [inviteCode, setInviteCode] = useState('');
  
  const [channelType, setChannelType] = useState('Public Channel');
  const [postPermission, setPostPermission] = useState('admin');

  useEffect(() => {
    if (channelType === 'Private Channel') {
      if (!inviteCode) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for(let i=0; i<11; i++) {
           code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setInviteCode(code);
      }
      return;
    }
    
    if (!channelUsername) {
      setUsernameStatus('idle');
      return;
    }
    
    const isValid = /^[a-z0-9_]{5,32}$/.test(channelUsername);
    if (!isValid) {
      setUsernameStatus('invalid');
      return;
    }
    
    setUsernameStatus('checking');
    const checkUsername = async () => {
      try {
        const q = query(collection(db, 'channels'), where('channelUsername', '==', channelUsername));
        const snapshot = await getCountFromServer(q);
        if (snapshot.data().count > 0) {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('available');
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [channelUsername, channelType, inviteCode]);
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  const [cropperState, setCropperState] = useState<{isOpen: boolean, src: string}>({ isOpen: false, src: '' });
  const [showChannelPicker, setShowChannelPicker] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const channelsRef = collection(db, 'channels');
    const q = query(channelsRef, where("status", "==", "active"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const channelsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      channelsData.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      
      setChannels(channelsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching channels:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage("Image size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperState({ isOpen: true, src: reader.result as string });
      };
      reader.readAsDataURL(file);
      setMessage("");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropperSave = async (croppedFile: File, previewUrl: string, setProgress: (msg: string) => void) => {
    const url = await uploadToCloudinary(croppedFile);
    setLogoPreview(url);
    setLogoFile(null); // URL is ready
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setMessage("You must be logged in.");
      return;
    }

    if (!channelName || (!logoFile && !logoPreview) || !channelType || !channelBio) {
      setMessage("Please fill in all required fields.");
      return;
    }
    
    if (channelType === 'Public Channel' && usernameStatus !== 'available') {
      setMessage("Please enter a valid and available username.");
      return;
    }

    if (!auth.currentUser) {
      setMessage("You must be logged in to add a channel.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      let finalImageURL = logoPreview;
      
      if (logoFile) {
        const cloudName = "p0w589ih";
        const uploadPreset = "exchangehube_profile_pics";
        
        const formData = new FormData();
        formData.append("file", logoFile);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to upload image. Please try again.");
        }

        const cloudinaryData = await res.json();
        finalImageURL = cloudinaryData.secure_url;
      }

      const finalLink = channelType === 'Public Channel' ? `${APP_DOMAIN}/${channelUsername}` : `${APP_DOMAIN}/+${inviteCode}`;
      const newChannelRef = await addDoc(collection(db, 'channels'), {
        channelName,
        channelUsername: channelType === 'Public Channel' ? channelUsername : null,
        channelLink: finalLink,
        channelImageURL: finalImageURL,
        channelType,
        postPermission,
        channelBio,
        status: "active",
        ownerUid: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });



      setShowAddModal(false);
      setShowSuccessModal(true);
      setTimeout(() => {
        window.open(`https://${finalLink}`, '_blank');
        setShowSuccessModal(false);
      }, 1500);
      
      // Reset form
      setChannelName('');
      setChannelUsername('');
      setInviteCode('');
      setChannelType('Public Channel');
      setPostPermission('admin');
      setChannelBio('');
      setLogoFile(null);
      setLogoPreview('');
      
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Failed to publish channel. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.channelName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (channel.channelBio && channel.channelBio.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = category === 'All' || (category === 'Joined' ? channel.members?.includes(currentUser?.uid) : channel.channelType === category);
    
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Channels</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Channel
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8C0D0]" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search channels..." 
              className="w-full bg-[#070b1a] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors shadow-inner"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {['All', 'Joined', 'Public Channel', 'Private Channel'].map((cat) => (
              <button 
                key={cat} 
                onClick={() => setCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${category === cat ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'bg-[#070b1a] border border-white/5 text-[#B8C0D0] hover:text-white hover:border-white/10'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredChannels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[1400px]:grid-cols-4 w-full gap-6">
            {filteredChannels.map((channel) => (
              <div key={channel.id} className="bg-[#070b1a] border border-white/5 rounded-3xl p-6 relative group hover:border-purple-500/30 transition-all flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {channel.channelImageURL ? (
                      <img src={channel.channelImageURL} alt={channel.channelName} className="w-full h-full object-cover" />
                    ) : (
                      <Hash className="w-6 h-6 text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-lg font-medium text-white line-clamp-1">{channel.channelName}</h3>
                    <p className="text-sm text-purple-400 font-medium mb-1">{channel.channelType}</p>
                    <p className="text-xs text-[#B8C0D0] truncate opacity-70 font-mono">{channel.channelLink}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <button 
                    onClick={() => navigator.clipboard.writeText(channel.channelLink)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[#B8C0D0] hover:text-white font-medium transition-colors flex items-center justify-center gap-2 text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Link
                  </button>
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: channel.channelName,
                          url: channel.channelLink
                        }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(channel.channelLink);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[#B8C0D0] hover:text-white font-medium transition-colors flex items-center justify-center gap-2 text-xs"
                  >
                    <Share className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
                <p className="text-sm text-[#B8C0D0] mb-6 flex-1 line-clamp-2">
                  {channel.channelBio}
                </p>
                <button 
                  onClick={async () => {
                    if (!currentUser) return;
                    const isMember = channel.members?.includes(currentUser?.uid);
                    if (!isMember) {
                      try {

                        await updateDoc(doc(db, 'channels', channel.id), {
                          members: arrayUnion(currentUser.uid)
                        });
                      } catch (err: any) {
                        console.error(err);
                        if (err.message && err.message.includes("permission")) {
                           alert("Permission denied. Please update your Firestore security rules in the Firebase Console to allow joining channels.");
                        }
                        return;
                      }
                    }
                    navigate(`/channels/${channel.id}/chat`);
                  }}
                  className="w-full py-3 mb-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-purple-600 group-hover:border-purple-500"
                >
                  {channel.members?.includes(currentUser?.uid) ? 'Open Chat' : 'Join Channel'}
                </button>
                
                {channel.ownerUid === currentUser?.uid && (
                  <button
                    onClick={() => openEditModal(channel)}
                    className="w-full py-2.5 mb-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2 text-sm group-hover:bg-purple-600/20 group-hover:border-purple-500/50"
                  >
                    <Edit className="w-4 h-4" /> Edit Channel
                  </button>
                )}

                {channel.postPermission === 'admin' && channel.ownerUid !== currentUser?.uid ? (
                  <p className="text-xs text-center text-[#B8C0D0] italic py-2">
                    Only the Admin can post in this channel.
                  </p>
                ) : (
                  <button className="w-full py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-xl text-purple-300 font-medium transition-colors flex items-center justify-center gap-2 text-sm">
                    Create Post
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-white/5 bg-[#070b1a]/50 backdrop-blur-sm rounded-3xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No channels found.</h3>
            <p className="text-[#B8C0D0] max-w-md mx-auto mb-6">
              {searchTerm ? "No channels match your search criteria." : "Check back later for new channels."}
            </p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#070b1a]/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-[#172045]/90 backdrop-blur-md border border-[#8278ff]/15 rounded-3xl p-8 max-w-lg w-full shadow-[0_15px_40px_rgba(168,85,247,0.2)] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-white mb-6">Add Channel</h2>
            
            {message && (
              <div className={`p-4 rounded-xl mb-6 text-sm ${message.includes('successfully') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handlePublish} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Channel Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="e.g. Crypto Alerts"
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Channel Profile Picture <span className="text-red-400">*</span></label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-black/20 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-8 h-8 text-white/20" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Choose Image
                    </button>
                    <p className="text-xs text-[#B8C0D0] mt-2">Recommended: 256x256px, max 2MB.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Channel Type <span className="text-red-400">*</span></label>
                <div className="flex flex-col gap-3">
                  <div 
                    onClick={() => setChannelType('Public Channel')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${channelType === 'Public Channel' ? 'bg-purple-600/20 border-purple-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${channelType === 'Public Channel' ? 'border-purple-400' : 'border-[#B8C0D0]'}`}>
                        {channelType === 'Public Channel' && <div className="w-2.5 h-2.5 bg-purple-400 rounded-full" />}
                      </div>
                      <span className={`font-medium ${channelType === 'Public Channel' ? 'text-purple-300' : 'text-white'}`}>Public Channel</span>
                    </div>
                    <p className="text-sm text-[#B8C0D0] pl-8">Public channels can be discovered by users in ExchangeHube and anyone can join using the channel link.</p>
                  </div>

                  <div 
                    onClick={() => setChannelType('Private Channel')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${channelType === 'Private Channel' ? 'bg-purple-600/20 border-purple-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${channelType === 'Private Channel' ? 'border-purple-400' : 'border-[#B8C0D0]'}`}>
                        {channelType === 'Private Channel' && <div className="w-2.5 h-2.5 bg-purple-400 rounded-full" />}
                      </div>
                      <span className={`font-medium ${channelType === 'Private Channel' ? 'text-purple-300' : 'text-white'}`}>Private Channel</span>
                    </div>
                    <p className="text-sm text-[#B8C0D0] pl-8">Private channels can only be accessed by users who receive the invite link.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Post Permission <span className="text-red-400">*</span></label>
                <div className="flex flex-col gap-3">
                  <div 
                    onClick={() => setPostPermission('admin')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${postPermission === 'admin' ? 'bg-purple-600/20 border-purple-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${postPermission === 'admin' ? 'border-purple-400' : 'border-[#B8C0D0]'}`}>
                        {postPermission === 'admin' && <div className="w-2.5 h-2.5 bg-purple-400 rounded-full" />}
                      </div>
                      <span className={`font-medium ${postPermission === 'admin' ? 'text-purple-300' : 'text-white'}`}>Admin Only</span>
                    </div>
                    <p className="text-sm text-[#B8C0D0] pl-8">Only Admin can send messages in this channel. Members can read messages but cannot post.</p>
                  </div>

                  <div 
                    onClick={() => setPostPermission('public')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${postPermission === 'public' ? 'bg-purple-600/20 border-purple-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${postPermission === 'public' ? 'border-purple-400' : 'border-[#B8C0D0]'}`}>
                        {postPermission === 'public' && <div className="w-2.5 h-2.5 bg-purple-400 rounded-full" />}
                      </div>
                      <span className={`font-medium ${postPermission === 'public' ? 'text-purple-300' : 'text-white'}`}>Public</span>
                    </div>
                    <p className="text-sm text-[#B8C0D0] pl-8">Anyone who joins the channel can send messages, reply, and participate in discussions.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Channel Bio <span className="text-red-400">*</span></label>
                <textarea
                  value={channelBio}
                  onChange={(e) => setChannelBio(e.target.value)}
                  placeholder="Describe what your channel is about..."
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors resize-none h-24"
                  maxLength={500}
                />
                <div className="text-right text-xs text-[#B8C0D0] mt-1">{channelBio.length}/500</div>
              </div>

              {channelType === 'Public Channel' ? (
                <div>
                  <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Channel Username <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">{APP_DOMAIN}/</span>
                    <input
                      type="text"
                      value={channelUsername}
                      onChange={(e) => setChannelUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="Enter a unique username"
                      maxLength={32}
                      className={`w-full bg-black/20 border rounded-xl pl-[72px] pr-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors ${
                        channelUsername ? (usernameStatus === 'available' ? 'border-green-500/50 focus:border-green-500' : usernameStatus === 'invalid' || usernameStatus === 'taken' ? 'border-red-500/50 focus:border-red-500' : 'border-purple-500/50 focus:border-purple-500') : 'border-white/5 focus:border-purple-500/50'
                      }`}
                    />
                  </div>
                  {channelUsername && (
                    <p className={`text-sm mt-2 flex items-center gap-1 ${usernameStatus === 'available' ? 'text-green-400' : usernameStatus === 'invalid' || usernameStatus === 'taken' ? 'text-red-400' : 'text-purple-400'}`}>
                      {usernameStatus === 'available' && <>✅ This username is available.</>}
                      {usernameStatus === 'taken' && <>❌ This username is already taken.</>}
                      {usernameStatus === 'invalid' && <>❌ 5-32 chars, lowercase, numbers, underscores only.</>}
                      {usernameStatus === 'checking' && <>⏳ Checking availability...</>}
                    </p>
                  )}
                  {channelUsername && usernameStatus === 'available' && (
                    <p className="text-sm text-[#B8C0D0] mt-1">Preview: {APP_DOMAIN}/{channelUsername}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Invite Link</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-[#B8C0D0] overflow-hidden text-ellipsis whitespace-nowrap">
                      {APP_DOMAIN}/+{inviteCode}
                    </div>
                    <button 
                      type="button"
                      onClick={() => navigator.clipboard.writeText(`${APP_DOMAIN}/+${inviteCode}`)}
                      className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10 flex items-center gap-2 whitespace-nowrap"
                    >
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-4 pt-4 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || (channelType === 'Public Channel' && usernameStatus !== 'available')}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Publishing...
                    </>
                  ) : (
                    'Publish'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ImagePickerOptionsModal
        isOpen={showChannelPicker}
        onClose={() => setShowChannelPicker(false)}
        hasExistingImage={!!logoPreview}
        onSelectUpload={() => {
          setShowChannelPicker(false);
          fileInputRef.current?.click();
        }}
        onRemove={() => {
          setLogoPreview('');
          setLogoFile(null);
          setShowChannelPicker(false);
        }}
      />
      {cropperState.isOpen && (
        <ImageCropperModal
          imageSrc={cropperState.src}
          onClose={() => setCropperState({ isOpen: false, src: '' })}
          onSave={handleCropperSave}
          onChangeImage={() => {
            setCropperState({ isOpen: false, src: '' });
            fileInputRef.current?.click();
          }}
          title="Crop Channel Logo"
          description="Your logo will be visible to everyone."
        />
      )}

      {/* Edit Channel Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#070b1a]/80 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="relative bg-[#172045]/90 backdrop-blur-md border border-[#8278ff]/15 rounded-3xl p-8 max-w-lg w-full shadow-[0_15px_40px_rgba(168,85,247,0.2)] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Channel</h2>
            
            {editMessage && (
              <div className={`p-4 rounded-xl mb-6 text-sm ${editMessage.includes('successfully') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {editMessage}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Channel Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={editChannelName}
                  onChange={(e) => setEditChannelName(e.target.value)}
                  placeholder="e.g. Crypto Alerts"
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Channel Bio <span className="text-red-400">*</span></label>
                <textarea
                  value={editChannelBio}
                  onChange={(e) => setEditChannelBio(e.target.value)}
                  placeholder="What is your channel about?"
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors min-h-[100px] resize-none"
                  maxLength={150}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Channel Profile Picture</label>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleEditFileChange}
                  ref={editFileInputRef}
                  className="hidden" 
                />
                <div 
                  onClick={() => setEditShowChannelPicker(true)}
                  className="w-full h-24 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors hover:bg-white/5 overflow-hidden group"
                >
                  {editLogoPreview ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-black/40">
                      <img src={editLogoPreview} alt="Preview" className="h-full object-contain" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm font-medium">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-purple-400" />
                      <span className="text-sm text-[#B8C0D0]">Click to upload</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Channel Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditChannelType('Public Channel')}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${editChannelType === 'Public Channel' ? 'bg-purple-600/20 border-purple-500/50 text-white' : 'bg-black/20 border-white/5 text-[#B8C0D0] hover:bg-white/5'}`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditChannelType('Private Channel')}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${editChannelType === 'Private Channel' ? 'bg-purple-600/20 border-purple-500/50 text-white' : 'bg-black/20 border-white/5 text-[#B8C0D0] hover:bg-white/5'}`}
                  >
                    Private
                  </button>
                </div>
              </div>

              {editChannelType === 'Public Channel' ? (
                <div>
                  <label className="block text-sm font-medium text-[#B8C0D0] mb-2 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Public Username
                  </label>
                  <input
                    type="text"
                    value={editChannelUsername}
                    disabled
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[#B8C0D0] opacity-70 cursor-not-allowed font-mono text-sm"
                  />
                  
                  <label className="block text-sm font-medium text-[#B8C0D0] mt-4 mb-2 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Public Channel Link
                  </label>
                  <input
                    type="text"
                    value={editChannelLink}
                    disabled
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[#B8C0D0] opacity-70 cursor-not-allowed font-mono text-sm"
                  />
                  <p className="text-xs text-red-400 mt-2">
                    For security and to prevent broken links, the public channel username and link cannot be changed after the channel is created.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Private Invite Link</label>
                  <input
                    type="text"
                    value={editChannelLink}
                    onChange={(e) => setEditChannelLink(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors font-mono text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Post Permission</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPostPermission('admin')}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${editPostPermission === 'admin' ? 'bg-purple-600/20 border-purple-500/50 text-white' : 'bg-black/20 border-white/5 text-[#B8C0D0] hover:bg-white/5'}`}
                  >
                    Admin Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPostPermission('public')}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${editPostPermission === 'public' ? 'bg-purple-600/20 border-purple-500/50 text-white' : 'bg-black/20 border-white/5 text-[#B8C0D0] hover:bg-white/5'}`}
                  >
                    Anyone Can Post
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isEditSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <ImagePickerOptionsModal
        isOpen={editShowChannelPicker}
        onClose={() => setEditShowChannelPicker(false)}
        hasExistingImage={!!editLogoPreview}
        onSelectUpload={() => {
          setEditShowChannelPicker(false);
          editFileInputRef.current?.click();
        }}
        onRemove={() => {
          setEditLogoPreview('');
          setEditLogoFile(null);
          setEditShowChannelPicker(false);
        }}
      />
      {editCropperState.isOpen && (
        <ImageCropperModal
          imageSrc={editCropperState.src}
          onClose={() => setEditCropperState({ isOpen: false, src: '' })}
          onSave={handleEditCropperSave}
          onChangeImage={() => {
            setEditCropperState({ isOpen: false, src: '' });
            editFileInputRef.current?.click();
          }}
          title="Crop Channel Logo"
          description="Your logo will be visible to everyone."
        />
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#070b1a]/80 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)}></div>
          <div className="relative bg-[#172045]/90 backdrop-blur-md border border-[#8278ff]/15 rounded-3xl p-8 max-w-sm w-full shadow-[0_15px_40px_rgba(168,85,247,0.2)] flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#B8C0D0] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
            <p className="text-[#B8C0D0] mb-8">
              Channel created successfully. Redirecting...
            </p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

interface UserProfileData {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  profilePhotoURL?: string;
  normalizedUsername?: string;
}
export function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Profile View / Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  
  // This state is ONLY for the temporary local preview while editing
  const [editPhotoURL, setEditPhotoURL] = useState('');
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Setup state (for users without a profile document)
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupFullName, setSetupFullName] = useState('');
  const [setupUsername, setSetupUsername] = useState('');
  const [setupPhotoURL, setSetupPhotoURL] = useState('');
  const [setupPhotoFile, setSetupPhotoFile] = useState<File | null>(null);
  const [setupError, setSetupError] = useState('');
  const [isSetupSaving, setIsSetupSaving] = useState(false);
  const [cropperState, setCropperState] = useState<{isOpen: boolean, src: string, mode: 'setup' | 'edit'}>({ isOpen: false, src: '', mode: 'setup' });
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const setupFileInputRef = useRef<HTMLInputElement>(null);
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [showSetupPicker, setShowSetupPicker] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        presenceService.updatePresence(currentUser.uid, true).catch(console.error);
        console.log('Auth Initialized. UID:', currentUser.uid);
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          console.log('Reading Firestore path:', docRef.path);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            console.log('profile document exists: true');
            const data = docSnap.data() as UserProfileData;
            console.log('loaded profilePhotoURL value:', data.profilePhotoURL);
            
            setProfile(data);
            setEditFullName(data.fullName || '');
          } else {
            console.log('profile document exists: false');
            setNeedsSetup(true);
            if (currentUser.displayName) setSetupFullName(currentUser.displayName);
            if (currentUser.photoURL) setSetupPhotoURL(currentUser.photoURL);
          }
        } catch (err: any) {
          console.error('Error fetching profile:', err);
          setError(`Error loading profile: ${err.message} (Code: ${err.code})`);
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      if (needsSetup) setSetupError('Unsupported file format. Use JPG, PNG, or WebP.');
      else setError('Unsupported file format. Use JPG, PNG, or WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      if (needsSetup) setSetupError('File size exceeds 5MB limit.');
      else setError('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropperState({ isOpen: true, src: reader.result as string, mode: needsSetup ? 'setup' : 'edit' });
    };
    reader.readAsDataURL(file);
    
    if (needsSetup) {
      setSetupError('');
      if (setupFileInputRef.current) setupFileInputRef.current.value = '';
    } else {
      setError('');
      if (profileFileInputRef.current) profileFileInputRef.current.value = '';
    }
  };

  const handleCropperSave = async (croppedFile: File, previewUrl: string, setProgress: (msg: string) => void) => {
    const url = await uploadToCloudinary(croppedFile);
    if (cropperState.mode === 'setup') {
      setSetupPhotoURL(url);
      setSetupPhotoFile(null); // URL is ready
    } else {
      setProgress('Saving to Firestore...');
      const userRef = doc(db, 'users', user!.uid);
      await updateDoc(userRef, { profilePhotoURL: url });
      setProfile(prev => prev ? { ...prev, profilePhotoURL: url } : null);
    }
  };


  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setIsSaving(true);
    setSaveSuccess('');
    setError('');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const updateData: any = {
        fullName: editFullName
      };
      
      if (editPhotoFile) {
        const secure_url = await uploadToCloudinary(editPhotoFile);
        console.log('Cloudinary secure_url:', secure_url);
        updateData.profilePhotoURL = secure_url;
      }
      
      console.log('Firestore document path:', userRef.path);
      await updateDoc(userRef, updateData);
      console.log('Firestore update success');
      
      setProfile(prev => prev ? { ...prev, fullName: editFullName, ...(updateData.profilePhotoURL ? { profilePhotoURL: updateData.profilePhotoURL } : {}) } : null);
      setSaveSuccess('Profile picture updated successfully.');
      setIsEditing(false);
      
      // CRITICAL: Clear temporary state after successful save
      setEditPhotoFile(null);
      setEditPhotoURL('');
      
    } catch (err: any) {
      console.error('Firestore update error:', err);
      setError(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetupProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSetupError('');
    
    if (!setupFullName || !setupUsername) {
      setSetupError('Please fill in all fields.');
      return;
    }

    const normalizedUsername = setupUsername.toLowerCase().trim();
    if (!/^[a-z0-9_@#$]+$/.test(normalizedUsername)) {
      setSetupError('Use only letters, numbers, _, @, #, and $.');
      return;
    }

    setIsSetupSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);

      try {
        const q = query(collection(db, 'users'), where('username', '==', setupUsername));
        const { getDocs } = await import('firebase/firestore');
        const snapshot = await getDocs(q);
        const isTaken = snapshot.docs.some(doc => doc.id !== user.uid);
        if (isTaken) {
          setSetupError('Username already taken.');
          setIsSetupSaving(false);
          return;
        }
      } catch (checkErr: any) {
        setSetupError(`Error: ${checkErr.code} - ${checkErr.message}`);
        setIsSetupSaving(false);
        return;
      }

      let finalPhotoURL = setupPhotoURL || '';
      if (setupPhotoFile) {
        try {
          finalPhotoURL = await uploadToCloudinary(setupPhotoFile);
        } catch (uploadErr: any) {
          console.error("Photo upload error:", uploadErr);
          setSetupError(`Failed to upload photo: ${uploadErr.message}`);
          setIsSetupSaving(false);
          return;
        }
      }
      
      const { serverTimestamp } = await import('firebase/firestore');
      
      // double check before write
      const q2 = query(collection(db, 'users'), where('username', '==', setupUsername));
      const { getDocs: getDocs2 } = await import('firebase/firestore');
      const snapshot2 = await getDocs2(q2);
      const isTaken2 = snapshot2.docs.some(doc => doc.id !== user.uid);
      if (isTaken2) {
        throw new Error("USERNAME_TAKEN");
      }
        
      const userData: any = {
        uid: user.uid,
        fullName: setupFullName,
        username: setupUsername,
        normalizedUsername: normalizedUsername,
        email: user.email || '',
        role: "user",
        createdAt: serverTimestamp()
      };
      
      if (finalPhotoURL) {
        userData.profilePhotoURL = finalPhotoURL;
      }
      
      await updateDoc(userRef, userData).catch(async (e) => {
         if (e.code === 'not-found') {
            const { setDoc } = await import('firebase/firestore');
            await setDoc(userRef, userData);
         } else {
            throw e;
         }
      });

      const newDocSnap = await getDoc(userRef);
      if (newDocSnap.exists()) {
        const data = newDocSnap.data() as UserProfileData;
        setProfile(data);
        setEditFullName(data.fullName || '');
        setNeedsSetup(false);
      }
    } catch (err: any) {
      console.error('Profile setup error:', err);
      if (err.message === "USERNAME_TAKEN") {
        setSetupError('Username ID already taken.');
      } else {
        setSetupError(`Error: ${err.code || 'UNKNOWN'} - ${err.message}`);
      }
    } finally {
      setIsSetupSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (auth.currentUser) await presenceService.updatePresence(auth.currentUser.uid, false); await signOut(auth);
      localStorage.removeItem('last_visited_page');
      navigate('/');
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(`Logout failed: ${err.message}`);
    }
  };
  
  // Calculate final avatar to display based on priority:
  // 1. Unsaved local preview
  // 2. Firestore profilePhotoURL
  // 3. Firebase Auth user.photoURL
  const displayPhotoURL = (editPhotoFile && editPhotoURL) 
    ? editPhotoURL 
    : (profile?.profilePhotoURL || user?.photoURL || '');

  console.log('final avatar source selected:', displayPhotoURL);

return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-8">Profile Settings</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-8">
            {error}
          </div>
        ) : needsSetup ? (
          <div className="bg-[#070b1a] border border-white/5 rounded-3xl p-6 sm:p-10 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="relative z-10 max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
                <p className="text-[#B8C0D0]">Please set up your profile details to continue.</p>
              </div>
              <form onSubmit={handleSetupProfile} className="space-y-4">
                {setupError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {setupError}
                  </div>
                )}
                
                <div className="flex justify-center mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full border-4 border-[#050816] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] overflow-hidden cursor-pointer">
                      {setupPhotoURL ? (
                        <img src={setupPhotoURL} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-display font-bold text-white tracking-wider">
                          {setupFullName ? setupFullName.charAt(0).toUpperCase() : 'U'}
                        </span>
                      )}
                    </div>
                    <button type="button" disabled={isSetupSaving} onClick={() => setShowSetupPicker(true)} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg cursor-pointer disabled:opacity-50">
                      <Edit className="w-4 h-4" />
                    </button>
                    <input type="file" ref={setupFileInputRef} accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handlePhotoChange} disabled={isSetupSaving} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Email</label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#B8C0D0] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={setupFullName} 
                    onChange={e => setSetupFullName(e.target.value)} 
                    placeholder="Enter your full name"
                    className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Username ID</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B8C0D0]">@</span>
                    <input 
                      type="text" 
                      value={setupUsername} 
                      onChange={e => setSetupUsername(e.target.value.replace(/[^a-zA-Z0-9_@#$]/g, ''))} 
                      placeholder="Username"
                      className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#B8C0D0]">You can use: letters, numbers, @, #, $, _</p>
                </div>
                <button 
                  type="submit" 
                  disabled={isSetupSaving} 
                  className="w-full mt-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isSetupSaving ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                      Saving...
                    </>
                  ) : 'Complete Profile'}
                </button>
              </form>
            </div>
          </div>
        ) : profile ? (
          <>
            <div className="bg-[#070b1a] border border-white/5 rounded-3xl p-6 sm:p-10 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#050816] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] overflow-hidden cursor-pointer">
                    {displayPhotoURL ? (
                      <img src={displayPhotoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl sm:text-4xl font-display font-bold text-white tracking-wider">
                        {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                    {isSaving && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <button type="button" disabled={isSaving} onClick={() => setShowProfilePicker(true)} className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg cursor-pointer disabled:opacity-50">
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <input type="file" ref={profileFileInputRef} accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handlePhotoChange} disabled={isSaving} />
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  {isEditing ? (
                    <form onSubmit={handleSaveProfile} className="space-y-4 max-w-sm mx-auto sm:mx-0">
                      <div>
                        <label className="block text-xs text-[#B8C0D0] mb-1">Full Name</label>
                        <input 
                          type="text" 
                          value={editFullName} 
                          onChange={e => setEditFullName(e.target.value)} 
                          className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
                          required
                        />
                      </div>
                      <div className="flex gap-2 justify-center sm:justify-start">
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium text-sm transition-colors">
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" onClick={() => { setIsEditing(false); setEditFullName(profile.fullName || ''); setEditPhotoURL(''); setEditPhotoFile(null); }} disabled={isSaving} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium text-sm transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{profile.fullName}</h2>
                      <p className="text-purple-400 font-medium mb-1">@{profile.username}</p>
                      <p className="text-[#B8C0D0] mb-6">{profile.email}</p>
                      
                      {saveSuccess && (
                        <div className="mb-4 text-sm text-green-400">{saveSuccess}</div>
                      )}
                      
                      <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                        <button onClick={() => setIsEditing(true)} disabled={isSaving} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all text-sm disabled:opacity-50">
                          Edit Profile
                        </button>
                        <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all flex items-center gap-2 text-sm disabled:opacity-50">
                          <Key className="w-4 h-4" /> Change Password
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>



            <div>
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full sm:w-auto px-8 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl font-medium transition-all flex items-center justify-center sm:justify-start gap-2"
              >
                <LogOut className="w-5 h-5" /> Logout from all devices
              </button>
            </div>
            
            {showLogoutConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-[#070b1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-2">Logout</h3>
                  <p className="text-[#B8C0D0] mb-6">Are you sure you want to log out?</p>
                  <div className="flex gap-3 justify-end">
                    <button 
                      onClick={() => setShowLogoutConfirm(false)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

    </DashboardLayout>
  );
}


export function TrendingBotsPage() {
  const [bots, setBots] = useState<any[]>([]);
  const [viewingBot, setViewingBot] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterMine, setFilterMine] = useState('All');
  const [filterMiningType, setFilterMiningType] = useState('All');
  const [tempFilterMine, setTempFilterMine] = useState('All');
  const [tempFilterMiningType, setTempFilterMiningType] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const handleOpenFilter = () => {
    setTempFilterMine(filterMine);
    setTempFilterMiningType(filterMiningType);
    setShowFilterModal(true);
  };

  const handleApplyFilter = () => {
    setFilterMine(tempFilterMine);
    setFilterMiningType(tempFilterMiningType);
    setShowFilterModal(false);
  };

  const handleResetFilter = () => {
    setTempFilterMine('All');
    setTempFilterMiningType('All');
    setFilterMine('All');
    setFilterMiningType('All');
    setShowFilterModal(false);
  };

  useEffect(() => {
    const botsRef = collection(db, 'bots');
    const q = query(botsRef, where("status", "==", "approved"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const botsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      botsData.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      
      setBots(botsData);
      setErrorMsg(null);
      setLoading(false);
    }, (error: any) => {
      // console.error suppressed
      if (error.code === 'permission-denied') {
        setErrorMsg("Missing or insufficient permissions. Please update your Firestore rules to allow read access to the 'bots' collection.");
      } else {
        setErrorMsg(error.message || "Failed to load trending bots.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredBots = bots.filter(bot => {
    const matchesSearch = bot.botName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (bot.description && bot.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMine = filterMine === 'All' || bot.category === filterMine;
    const matchesType = filterMiningType === 'All' || bot.accessType === filterMiningType;

    return matchesSearch && matchesMine && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Trending Bots</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8C0D0]" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search trending bots..." 
                className="w-full bg-[#070b1a] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors shadow-inner"
              />
            </div>
            <button 
              onClick={handleOpenFilter}
              className="px-4 py-3 bg-[#070b1a] border border-white/5 rounded-xl text-[#B8C0D0] hover:text-white hover:border-white/10 transition-colors flex items-center justify-center shrink-0"
              title="Filter"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : errorMsg ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-red-500/20 bg-red-500/5 backdrop-blur-sm rounded-3xl p-8 text-center">
            <Shield className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Access Denied</h3>
            <p className="text-red-300/80 max-w-md mx-auto">
              {errorMsg}
            </p>
          </div>
        ) : filteredBots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[1400px]:grid-cols-4 w-full gap-8 mb-12">
            {filteredBots.map((bot) => (
              <BotCard 
                key={bot.id} 
                bot={bot} 
                actionButtons={
                  <>
                    <button
                      onClick={() => setViewingBot(bot)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-medium text-sm"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                    <a 
                      href={bot.botLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
                    >
                      <ExternalLink className="w-4 h-4" /> Open
                    </a>
                  </>
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-white/5 bg-[#070b1a]/50 backdrop-blur-sm rounded-3xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              {(filterMine !== 'All' || filterMiningType !== 'All') ? "No bots found matching your filters." : "No published bots available."}
            </h3>
            <p className="text-[#B8C0D0] max-w-md mx-auto mb-6">
              {searchTerm ? "No bots match your search criteria." : "Check back later for new trending bots."}
            </p>
            {(filterMine !== 'All' || filterMiningType !== 'All' || searchTerm) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  handleResetFilter();
                }}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors font-medium text-sm"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>
      
      {showFilterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#070b1a]/80 backdrop-blur-sm" onClick={() => setShowFilterModal(false)}></div>
          <div className="relative bg-[#172045]/90 backdrop-blur-md border border-[#8278ff]/15 rounded-3xl p-8 max-w-md w-full shadow-[0_15px_40px_rgba(168,85,247,0.2)] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-white mb-6">Filter Bots</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#B8C0D0] mb-3">Mine</label>
              <div className="grid grid-cols-2 gap-3">
                {['All', 'Free', 'Paid', 'Free/Paid'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setTempFilterMine(opt)}
                    className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${tempFilterMine === opt ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-[#B8C0D0] hover:bg-white/10 hover:text-white'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-[#B8C0D0] mb-3">Mining Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['All', 'Automatic', 'Manual'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setTempFilterMiningType(opt)}
                    className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${tempFilterMiningType === opt ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-[#B8C0D0] hover:bg-white/10 hover:text-white'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              <button 
                onClick={handleResetFilter}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
              >
                Reset
              </button>
              <button 
                onClick={handleApplyFilter}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      {viewingBot && <BotViewModal bot={viewingBot} onClose={() => setViewingBot(null)} />}
    </DashboardLayout>
  );
}

export function PublishBotPage() {
  const [activeTab, setActiveTab] = useState<'Publish' | 'List'>('Publish');
  const [viewingBot, setViewingBot] = useState<any | null>(null);
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [botToDelete, setBotToDelete] = useState<any | null>(null);

  const handleDeleteBot = async () => {
    if (!botToDelete) return;
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'bots', botToDelete.id));
      // Note: Cloudinary image deletion requires a backend API with Cloudinary credentials,
      // which is not available here. In a production app, we would call an endpoint here.
      setBotToDelete(null);
    } catch (err) {
      console.error('Error deleting bot:', err);
    }
  };

  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [accessType, setAccessType] = useState('');
  const [botCurrency, setBotCurrency] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [myBots, setMyBots] = useState<any[]>([]);
  const [loadingBots, setLoadingBots] = useState(true);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const botsRef = collection(db, 'bots');
        const q = query(botsRef, where("ownerUid", "==", user.uid));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const botsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          botsData.sort((a: any, b: any) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
          });
          
          setMyBots(botsData);
          setLoadingBots(false);
        }, (error) => {
          setLoadingBots(false);
        });
        
        return () => unsubscribe();
      } else {
        setLoadingBots(false);
        setMyBots([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setLogoPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !link || (!logoFile && !logoPreview) || !category || !accessType) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      new URL(link);
    } catch {
      setMessage("Please enter a valid URL for Bot Link.");
      return;
    }
    
    if (!auth.currentUser) {
      setMessage("You must be logged in to publish a bot.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      let finalBotImageURL = logoPreview;
      
      if (logoFile) {
        const cloudName = "p0w589ih";
        const uploadPreset = "exchangehube_bot_images";
        
        const formData = new FormData();
        formData.append("file", logoFile);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to upload bot image. Please try again.");
        }

        const cloudinaryData = await res.json();
        finalBotImageURL = cloudinaryData.secure_url;
      }

      if (editingBotId) {
        const botRef = doc(db, 'bots', editingBotId);
        await updateDoc(botRef, {
          botName: name,
          botLink: link,
          botImageURL: finalBotImageURL,
          description: description,
          category: category,
          accessType: accessType,
          botCurrency: botCurrency,
          status: "pending",
          updatedAt: serverTimestamp(),
        });
        setMessage("Your bot has been updated and is waiting for admin approval.");
        setEditingBotId(null);
        setName(''); setLink(''); setLogoPreview(''); setLogoFile(null); setDescription(''); setCategory(''); setAccessType(''); setBotCurrency('');
      } else {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        let ownerUsername = auth.currentUser.email || "Unknown User";
        let ownerProfilePicture = "";
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          ownerUsername = userData.username || userData.email || ownerUsername;
          ownerProfilePicture = userData.profilePicture || "";
        }

        const botsCollectionRef = collection(db, 'bots');
        await addDoc(botsCollectionRef, {
          botName: name,
          botLink: link,
          botImageURL: finalBotImageURL,
          description: description,
          category: category,
          accessType: accessType,
          botCurrency: botCurrency,
          status: "pending",
          ownerUid: auth.currentUser.uid,
          ownerUsername: ownerUsername,
          ownerProfilePicture: ownerProfilePicture,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        
        setName(''); setLink(''); setLogoPreview(''); setLogoFile(null); setDescription(''); setCategory(''); setAccessType(''); setBotCurrency('');
        setMessage("Your bot has been submitted successfully and is waiting for admin approval.");
      }
    } catch (err: any) {
      setMessage(err.message || "An error occurred while publishing the bot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            {activeTab === 'Publish' ? (editingBotId ? 'Edit Bot' : 'Publish Bot') : 'My Bots'}
          </h1>
          <div className="flex bg-[#070b1a] rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setActiveTab('Publish')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'Publish' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Publish
            </button>
            <button
              onClick={() => {
                setActiveTab('List');
                setEditingBotId(null);
                setName(''); setLink(''); setLogoPreview(''); setLogoFile(null); setDescription(''); setCategory(''); setAccessType(''); setBotCurrency(''); setMessage('');
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'List' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              List
            </button>
          </div>
        </div>

        {activeTab === 'List' ? (
          <div className="space-y-4 mb-12">
            {loadingBots ? (
              <div className="text-center py-8 text-[#B8C0D0]">Loading...</div>
            ) : myBots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[1400px]:grid-cols-4 w-full gap-8">
                {myBots.map(bot => (
                  <BotCard 
                    key={bot.id} 
                    bot={bot}
                    actionButtons={
                      <>
                        <button 
                          onClick={() => {
                            setActiveTab('Publish');
                            setEditingBotId(bot.id);
                            setName(bot.botName || '');
                            setLink(bot.botLink || '');
                            setDescription(bot.description || '');
                            setCategory(bot.category || '');
                            setAccessType(bot.accessType || '');
                            setBotCurrency(bot.botCurrency || '');
                            setLogoPreview(bot.botImageURL || '');
                            setLogoFile(null);
                            setMessage('');
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setViewingBot(bot)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-medium text-sm"
                        >
                          <Eye className="w-4 h-4" /> View
                        </button>
                        <button
                          onClick={() => setBotToDelete(bot)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all font-medium text-sm"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </>
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[#B8C0D0] bg-[#070b1a] border border-white/5 rounded-3xl">
                <p className="mb-4">You haven't published any bots yet.</p>
                <button 
                  onClick={() => setActiveTab('Publish')}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
                >
                  Publish Your First Bot
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#070b1a] border border-white/5 rounded-3xl p-6 sm:p-8 relative overflow-hidden mb-12 max-w-3xl mx-auto w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none"></div>
            
            <form onSubmit={handlePublish} className="relative z-10 space-y-6">
              {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('successfully') || message.includes('updated') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {message}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Bot Name <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Trading Alpha Bot"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Bot Link <span className="text-red-400">*</span></label>
                <input 
                  type="url" 
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required
                  placeholder="https://t.me/..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Bot Image <span className="text-red-400">*</span></label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-purple-500/50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative"
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-[#B8C0D0] mb-2" />
                      <span className="text-sm text-[#B8C0D0]">Click to upload bot image</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Description <span className="text-gray-500 text-xs font-normal ml-1">(Optional)</span></label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Tell us about what your bot does..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Category <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setCategory('Free')}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${category === 'Free' ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-[#B8C0D0] hover:bg-white/10 hover:text-white'}`}
                  >
                    Free
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('Paid')}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${category === 'Paid' ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-[#B8C0D0] hover:bg-white/10 hover:text-white'}`}
                  >
                    Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('Free/Paid')}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${category === 'Free/Paid' ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-[#B8C0D0] hover:bg-white/10 hover:text-white'}`}
                  >
                    Free/Paid
                  </button>
                </div>
              </div>

              {category && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Access Type <span className="text-red-400">*</span></label>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setAccessType('Automatic')}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${accessType === 'Automatic' ? 'bg-blue-600/20 border-blue-500/50 text-blue-300' : 'bg-white/5 border-white/10 text-[#B8C0D0] hover:bg-white/10 hover:text-white'}`}
                    >
                      Automatic
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccessType('Manual')}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${accessType === 'Manual' ? 'bg-blue-600/20 border-blue-500/50 text-blue-300' : 'bg-white/5 border-white/10 text-[#B8C0D0] hover:bg-white/10 hover:text-white'}`}
                    >
                      Manual
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Bot Currency <span className="text-gray-500 text-xs font-normal ml-1">(Optional)</span></label>
                    <input 
                      type="text" 
                      value={botCurrency}
                      onChange={(e) => setBotCurrency(e.target.value)}
                      placeholder="e.g. USDT, USD, INR, BTC" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 pt-6 mt-4 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => {
                    setName(''); setLink(''); setLogoPreview(''); setDescription(''); setCategory(''); setAccessType(''); setBotCurrency(''); setMessage(''); setLogoFile(null);
                    if (editingBotId) {
                      setActiveTab('List');
                      setEditingBotId(null);
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (editingBotId ? 'Updating...' : 'Publishing...') : (editingBotId ? 'Update Bot' : 'Publish')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    
    {botToDelete && ( <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"> <div className="absolute inset-0 bg-[#070b1a]/80 backdrop-blur-sm" onClick={() => setBotToDelete(null)}></div> <div className="relative bg-[#172045]/90 backdrop-blur-md border border-[#8278ff]/15 rounded-3xl p-8 max-w-md w-full shadow-[0_15px_40px_rgba(168,85,247,0.2)]"> <h2 className="text-2xl font-bold text-white mb-4">Delete Bot?</h2> <p className="text-[#B8C0D0] mb-8">This action will permanently delete this bot and cannot be undone.</p> <div className="flex gap-4"> <button onClick={() => setBotToDelete(null)} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"> Cancel </button> <button onClick={handleDeleteBot} className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors"> Delete </button> </div> </div> </div> )} {viewingBot && <BotViewModal bot={viewingBot} onClose={() => setViewingBot(null)} />}
    </DashboardLayout>
  );
}
