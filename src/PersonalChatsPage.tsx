import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { DashboardLayout } from './DashboardPages';
import { Search, User, MessageCircle, Clock } from 'lucide-react';
import { personalMessageService } from './messaging/services/personalMessageService';
import type { PersonalMessage } from './messaging/types';

interface SearchedUser {
  uid: string;
  username: string;
  fullName: string;
  profilePhotoURL?: string;
  profilePicture?: string;
}

interface RecentChat {
  user: SearchedUser;
  lastMessage: PersonalMessage;
}

export function PersonalChatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('last_chat_path', location.pathname);
  }, [location.pathname]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const loadRecentChats = async () => {
      if (!currentUser) return;
      try {
        const conversations = await personalMessageService.getRecentConversations();
        
        const chatsWithUsersMap = new Map<string, RecentChat>();
        
        for (const msg of conversations) {
          const uids = msg.conversation_id.split('_');
          const otherUid = uids[0] === currentUser.uid ? uids[1] : uids[0];
          
          if (otherUid && !chatsWithUsersMap.has(otherUid)) {
            const userDoc = await getDoc(doc(db, 'users', otherUid));
            if (userDoc.exists()) {
              chatsWithUsersMap.set(otherUid, {
                user: { uid: otherUid, ...userDoc.data() } as SearchedUser,
                lastMessage: msg
              });
            } else {
              chatsWithUsersMap.set(otherUid, {
                user: { uid: otherUid, username: 'deleted_user', fullName: 'Deleted User' },
                lastMessage: msg
              });
            }
          }
        }
        
        setRecentChats(Array.from(chatsWithUsersMap.values()));
      } catch (err) {
        console.error("Error loading recent chats:", err);
      } finally {
        setIsLoadingRecent(false);
      }
    };
    
    loadRecentChats();
  }, [currentUser]);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('username', '>=', searchQuery.toLowerCase()),
          where('username', '<=', searchQuery.toLowerCase() + '\uf8ff'),
          limit(10)
        );
        
        const snapshot = await getDocs(q);
        const results: SearchedUser[] = [];
        snapshot.forEach(doc => {
          if (doc.id !== currentUser?.uid) {
            results.push({ uid: doc.id, ...doc.data() } as SearchedUser);
          }
        });
        setSearchResults(results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(performSearch, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, currentUser]);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-80px)] md:h-screen w-full bg-[#050816] p-4 md:p-8">
        <div className="max-w-2xl w-full mx-auto flex flex-col h-full">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">Chat</h1>
            <p className="text-[#B8C0D0]">Find a user to start a private conversation or continue a recent one.</p>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by username..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {searchQuery.trim() ? (
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-[#B8C0D0] uppercase tracking-wider mb-3">Search Results</h2>
                {isSearching ? (
                  <div className="flex justify-center p-8">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(user => (
                    <button
                      key={user.uid}
                      onClick={() => navigate(`/messages/${user.uid}`)}
                      className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 shrink-0">
                          {(user.profilePhotoURL || user.profilePicture) ? (
                            <img src={user.profilePhotoURL || user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/50 font-bold bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                              {user.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <h3 className="text-white font-medium">{user.fullName || user.username}</h3>
                          <p className="text-sm text-[#B8C0D0]">@{user.username}</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center p-8 text-[#B8C0D0]">
                    No users found matching "{searchQuery}"
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-[#B8C0D0] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Recent Conversations
                </h2>
                {isLoadingRecent ? (
                  <div className="flex justify-center p-8">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : recentChats.length > 0 ? (
                  recentChats.map(chat => (
                    <button
                      key={chat.user.uid}
                      onClick={() => navigate(`/messages/${chat.user.uid}`)}
                      className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 shrink-0">
                          {(chat.user.profilePhotoURL || chat.user.profilePicture) ? (
                            <img src={chat.user.profilePhotoURL || chat.user.profilePicture} alt={chat.user.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/50 font-bold bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                              {chat.user.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <h3 className="text-white font-medium">{chat.user.fullName || chat.user.username}</h3>
                          <p className="text-sm text-[#B8C0D0] truncate max-w-[200px] md:max-w-[300px]">
                            {chat.lastMessage.deleted || chat.lastMessage.deleted_for_all ? 'Message deleted' : 
                             chat.lastMessage.message_type === 'image' ? '📷 Image' :
                             chat.lastMessage.message_type === 'voice' ? '🎤 Voice message' :
                             chat.lastMessage.message_type === 'file' ? '📎 File' :
                             chat.lastMessage.content}
                          </p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-[#B8C0D0] opacity-50 py-12">
                    <MessageCircle className="w-12 h-12 mb-4" />
                    <p>No recent conversations</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
