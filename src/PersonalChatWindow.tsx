import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './firebase';
import { getSupabaseUrl, getSupabaseAnonKey } from './messaging/supabase';
import { doc, getDoc } from 'firebase/firestore';
import { DashboardLayout } from './DashboardPages';
import { personalMessageService, PersonalMessage, presenceService, typingService } from './messaging';
import { uploadFileToCloudinary } from './utils/cloudinary';
import { Send, ArrowLeft, Paperclip, FileText, Download, X, Image as ImageIcon, Video, Music, Mic, Reply, MessageSquare, Pencil, Trash2, Pin, PinOff, Search, ChevronUp, ChevronDown, Forward } from 'lucide-react';
import { ForwardModal } from './components/ForwardModal';
import { ReportModal } from './components/ReportModal';
import { Flag, MoreVertical } from 'lucide-react';
import { SharedMediaSidebar } from './components/SharedMediaSidebar';
import { Folder } from 'lucide-react';
import { VoiceRecorder, VoicePlayer } from './components/VoiceMessage';
import { ReactionPicker, ReactionDisplay } from './components/ReactionPicker';

interface UserProfile {
  username: string;
  fullName: string;
  photoURL: string;
}

export function PersonalChatWindow() {
  const { targetUserId } = useParams<{ targetUserId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    localStorage.setItem('last_chat_path', location.pathname);
  }, [location.pathname]);
  const [messages, setMessages] = useState<PersonalMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [replyingTo, setReplyingTo] = useState<PersonalMessage | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<PersonalMessage | null>(null);
  const [reportingMessage, setReportingMessage] = useState<PersonalMessage | null>(null);
  const [reportingUser, setReportingUser] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<PersonalMessage | null>(null);
  const [showSharedMedia, setShowSharedMedia] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isTargetOnline, setIsTargetOnline] = useState(false);
  const [targetLastSeen, setTargetLastSeen] = useState<string | null>(null);
  const [isTargetTyping, setIsTargetTyping] = useState(false);


  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const remoteTypingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  
  const currentUser = auth.currentUser;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatId = currentUser && targetUserId 
    ? [currentUser.uid, targetUserId].sort().join('_') 
    : null;

  // --- Draft Logic ---
  useEffect(() => {
    if (chatId) {
      setEditingMessageId(null);
      setReplyingTo(null);
      const draft = localStorage.getItem(`draft_personal_${chatId}`);
      if (draft) {
        setNewMessage(draft);
      } else {
        setNewMessage('');
      }
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId && !sending && !editingMessageId) {
      if (newMessage.trim() === '') {
        localStorage.removeItem(`draft_personal_${chatId}`);
      } else {
        localStorage.setItem(`draft_personal_${chatId}`, newMessage);
      }
    }
  }, [newMessage, chatId, sending, editingMessageId]);
  // -------------------

  // Generate unique chat ID for the two users
  
  useEffect(() => {
    if (!targetUserId) return;
    
    const loadPresence = async () => {
      try {
        const presence = await presenceService.getUserPresence(targetUserId);
        if (presence) {
          setIsTargetOnline(presence.is_online);
          setTargetLastSeen(presence.last_seen);
        }
      } catch (err) {
        console.error("Error loading presence:", err);
      }
    };
    
    loadPresence();
    
    const presenceSub = presenceService.subscribeToPresence(targetUserId, (presence) => {
      setIsTargetOnline(presence?.is_online);
      setTargetLastSeen(presence?.last_seen || null);
    });
    
    return () => {
      presenceService.unsubscribe(presenceSub);
    };
  }, [targetUserId]);

  useEffect(() => {
    if (!chatId) return;
    const typingSub = typingService.subscribeToChatTyping(chatId, (payload) => {
      if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE')) {
        const { uid, is_typing, updated_at } = payload.new || { uid: payload.old?.uid, is_typing: false };
        if (uid === targetUserId) {
          let effectiveTyping = is_typing;
          if (effectiveTyping && updated_at) {
            if (Date.now() - new Date(updated_at).getTime() > 5000) {
              effectiveTyping = false;
            }
          }
          setIsTargetTyping(effectiveTyping);
          if (effectiveTyping) {
            if (targetTypingTimeoutRef.current) clearTimeout(targetTypingTimeoutRef.current);
            targetTypingTimeoutRef.current = setTimeout(() => {
              setIsTargetTyping(false);
            }, 3000);
          } else {
            if (targetTypingTimeoutRef.current) clearTimeout(targetTypingTimeoutRef.current);
          }
        }
      }
    });
    
    return () => {
      typingService.unsubscribe(typingSub);
      if (targetTypingTimeoutRef.current) clearTimeout(targetTypingTimeoutRef.current);
    };
  }, [chatId, targetUserId]);

  const handleTyping = (text: string) => {
    if (!currentUser || !chatId) return;
    
    if (!text.trim()) {
      typingService.updateTypingStatus(currentUser.uid, false, undefined, chatId).catch(console.error);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      return;
    }

    typingService.updateTypingStatus(currentUser.uid, true, undefined, chatId).catch(console.error);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      typingService.updateTypingStatus(currentUser.uid, false, undefined, chatId).catch(console.error);
    }, 2000);
  };

  // Clear typing on unmount
  useEffect(() => {
    return () => {
      if (currentUser && chatId) {
        typingService.updateTypingStatus(currentUser.uid, false, undefined, chatId).catch(console.error);
      }
    };
  }, [currentUser, chatId]);



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!currentUser) return;
    const loadCurrentUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCurrentUserProfile({
            username: data.username || 'Unknown',
            fullName: data.fullName || data.username || 'Unknown User',
            photoURL: data.profilePhotoURL || data.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username || data.fullName || 'U')}&background=random`
          });
        }
      } catch (err) {
        console.error("Failed to load current user profile", err);
      }
    };
    loadCurrentUserProfile();
  }, [currentUser]);

  useEffect(() => {
    if (!targetUserId) return;
    
    const loadTargetProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', targetUserId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setTargetUser({
            username: data.username || 'Unknown',
            fullName: data.fullName || data.username || 'Unknown User',
            photoURL: data.profilePhotoURL || data.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username || data.fullName || 'U')}&background=random`
          });
        } else {
          setTargetUser({
            username: 'deleted_user',
            fullName: 'Deleted User',
            photoURL: 'https://ui-avatars.com/api/?name=D&background=random'
          });
        }
      } catch (err) {
        console.error("Failed to load target user profile", err);
      }
    };

    loadTargetProfile();
  }, [targetUserId]);

  useEffect(() => {
    if (!chatId || !currentUser) return;

    const loadMessages = async () => {
      try {
        
        const data = await personalMessageService.getMessages(chatId);
        setMessages(data);
        // Mark as read or delivered
        if (data.some(m => !m.is_read && m.sender_uid !== currentUser.uid)) {
          await personalMessageService.markAsRead(chatId, currentUser.uid);
        } else if (data.some(m => !m.delivered && m.sender_uid !== currentUser.uid)) {
          await personalMessageService.markAsDelivered(chatId, currentUser.uid);
        }

      } catch (err) {
        console.error("Error loading personal messages:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();

    const subscription = personalMessageService.subscribeToChat(chatId, (payload) => {
      if (payload.eventType === 'INSERT') {
        const newMsg = payload.new as PersonalMessage;
        setMessages((prev) => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        });
        if (newMsg.sender_uid !== currentUser.uid) {
          personalMessageService.markAsRead(chatId, currentUser.uid).catch(console.error);
        }

      } else if (payload.eventType === 'UPDATE') {
        setMessages((prev) => prev.map(msg => msg.id === payload.new.id ? (payload.new as PersonalMessage) : msg));
      } else if (payload.eventType === 'DELETE') {
        setMessages((prev) => prev.filter(msg => msg.id !== payload.old.id));
      }
    });

    return () => {
      personalMessageService.unsubscribe(subscription);
    };
  }, [chatId, currentUser]);

  
  
  const handleVoiceSend = async (blob: Blob, duration: number) => {
    if (!currentUser || !chatId || !targetUserId) return;
    
    setIsRecordingVoice(false);
    setUploading(true);
    setUploadProgress(10);
    
    try {
      const file = new File([blob], 'voice_message.webm', { type: 'audio/webm' });
      const result = await uploadFileToCloudinary(file);
      
      await personalMessageService.sendMessage({
          conversation_id: chatId,
          sender_uid: currentUser.uid,
          
          
          
          
          
          content: '',
          message_type: 'voice',
          file_url: result.url,
          voice_url: result.url,
          file_name: 'Voice Message',
          file_size: file.size,
          voice_duration: duration,
          reply_to: replyingTo?.id
        });
    } catch (err: any) {
      console.error("Voice upload error:", err);
      setUploadError(err.message || "Failed to upload voice message");
      setTimeout(() => setUploadError(null), 3000);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setReplyingTo(null);
    }
  };


  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !chatId || !targetUserId) return;

    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File size must be less than 50MB");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const result = await uploadFileToCloudinary(file);
      let msgType: 'text' | 'image' | 'file' | 'video' | 'audio' | 'voice' = 'file';
      if (file.type.startsWith('image/')) msgType = 'image';
      else if (file.type.startsWith('video/')) {
        if (file.type.startsWith('audio/')) msgType = 'audio';
        else msgType = 'video';
      }
      
      await personalMessageService.sendMessage({
        conversation_id: chatId,
        sender_uid: currentUser.uid,
        content: '',
        message_type: msgType,
        file_url: result.url,
        voice_url: result.url,
        file_name: file.name || result.original_filename,
        file_size: file.size || result.bytes,
        reply_to: replyingTo?.id
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload file");
      setTimeout(() => setUploadError(null), 3000);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  
  
  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-purple-500', 'ring-offset-2', 'ring-offset-[#0B0F19]', 'transition-all', 'duration-500');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-purple-500', 'ring-offset-2', 'ring-offset-[#0B0F19]');
      }, 1500);
    }
  };
  
  const getReplyPreview = (msg: PersonalMessage) => {
    if (msg.content) return msg.content;
    if (msg.message_type === 'image') return 'Photo';
    if (msg.message_type === 'video') return 'Video';
    if (msg.message_type === 'voice') return 'Voice Message';
    if (msg.message_type === 'file' || msg.file_url) return msg.file_name || 'File';
    return 'Message';
  };


  const handleReaction = async (messageId: string, emoji: string, currentReactions: Record<string, string[]> = {}) => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const newReactions = { ...currentReactions };
    
    // Toggle logic
    const usersForEmoji = newReactions[emoji] || [];
    if (usersForEmoji.includes(uid)) {
      newReactions[emoji] = usersForEmoji.filter(id => id !== uid);
      if (newReactions[emoji].length === 0) delete newReactions[emoji];
    } else {
      // Find if user reacted with any other emoji and remove it if we only want one reaction per user
      // But usually multiple reactions are allowed, or one per emoji. Let's just toggle this specific emoji.
      newReactions[emoji] = [...usersForEmoji, uid];
    }

    try {
      // Optimistic update
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: newReactions } : m));
      await personalMessageService.updateReactions(messageId, newReactions);
    } catch (err) {
      console.error('Failed to update reaction:', err);
    }
  };


  
  
  const startEditing = (msg: PersonalMessage) => {
    setEditingMessageId(msg.id);
    setNewMessage(msg.content);
    setReplyingTo(null);
  };


  
  
  const handlePin = async (msg: PersonalMessage) => {
    try {
      await personalMessageService.pinMessage(msg.id, !msg.pinned);
    } catch (err) {
      console.error("Failed to pin/unpin message:", err);
    }
  };


  const handleDelete = async (forAll: boolean) => {
    if (!messageToDelete) return;
    try {
      await personalMessageService.deleteMessage(messageToDelete.id, forAll);
      setMessageToDelete(null);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };


  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = messages.filter(msg => {
      if (msg.deleted_for_all) return false;
      const textMatch = msg.content?.toLowerCase().includes(query);
      const fileMatch = msg.file_name?.toLowerCase().includes(query);
      return textMatch || fileMatch;
    }).map(m => m.id);
    
    setSearchResults(results);
    if (results.length > 0) {
      setCurrentSearchIndex(results.length - 1);
    } else {
      setCurrentSearchIndex(-1);
    }
  }, [messages, searchQuery]);

  useEffect(() => {
    if (currentSearchIndex >= 0 && searchResults[currentSearchIndex]) {
       scrollToMessage(searchResults[currentSearchIndex]);
    }
  }, [currentSearchIndex, searchResults]);

  const handleNextSearch = () => {
    if (searchResults.length > 0) {
      setCurrentSearchIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    }
  };
  const handlePrevSearch = () => {
    if (searchResults.length > 0) {
      setCurrentSearchIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <span key={i} className="bg-yellow-500/50 text-white rounded px-0.5">{part}</span> 
            : part
        )}
      </>
    );
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !chatId || !targetUserId || !targetUser || !currentUserProfile) return;
    setSending(true);
    setSendError(null);
    try {
      if (editingMessageId) {
        await personalMessageService.editMessage(editingMessageId, newMessage.trim());
        setEditingMessageId(null);
      } else {
        await personalMessageService.sendMessage({
          conversation_id: chatId,
          sender_uid: currentUser.uid,
          content: newMessage.trim(),
          message_type: 'text',
          reply_to: replyingTo?.id
        });
      }
      setNewMessage('');
      setReplyingTo(null);
      typingService.updateTypingStatus(currentUser.uid, false, undefined, chatId).catch(console.error);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (err: any) {
      console.error("Failed to send/edit message:", err);
      setSendError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!currentUser) {
    return (
      <DashboardLayout>
        <div className="flex h-screen w-full items-center justify-center bg-[#050816] text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-80px)] md:h-screen w-full relative bg-[#050816] overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Header */}
        <div className="h-[70px] border-b border-white/10 px-6 flex items-center justify-between bg-white/5 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => navigate('/messages')} className="p-2 -ml-2 bg-transparent hover:bg-white/10 rounded-xl text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-white/10">
              {targetUser?.photoURL ? (
                <img src={targetUser.photoURL} alt={targetUser.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50 text-xl font-bold bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  {targetUser?.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
            
            <div className="flex flex-col overflow-hidden">
              <h2 className="text-lg font-bold text-white truncate">{targetUser?.fullName || 'Loading...'}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#B8C0D0] truncate">@{targetUser?.username || '...'}</span>
                {isTargetOnline ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    <span className="text-xs text-gray-400">Offline</span>
                    {targetLastSeen && <span className="text-[10px] text-white/40 ml-1">- Last seen: {new Date(targetLastSeen).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>}
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative ml-2">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
              {showUserMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1D2D] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                  <button 
                    onClick={() => { setReportingUser(true); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4" /> Report User
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search UI */}
          <div className="flex items-center ml-4 shrink-0">
            {isSearching ? (
              <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
                <Search className="w-4 h-4 text-white/50 hidden md:block" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-white w-24 md:w-48 placeholder:text-white/30"
                  autoFocus
                />
                {searchQuery && (
                  <div className="flex items-center gap-1 text-xs text-white/50 border-l border-white/10 pl-2 ml-1">
                    <span>{searchResults.length > 0 ? currentSearchIndex + 1 : 0}/{searchResults.length}</span>
                    <button onClick={handlePrevSearch} disabled={searchResults.length === 0} className="p-1 hover:text-white disabled:opacity-50">
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={handleNextSearch} disabled={searchResults.length === 0} className="p-1 hover:text-white disabled:opacity-50">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="p-1 hover:text-white text-white/50 ml-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsSearching(true)} className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Pinned Messages */}
        {messages.some(m => m.pinned) && (
          <div className="bg-[#1A1D2D] border-b border-white/10 px-6 py-2 flex flex-col gap-2 shrink-0 z-10">
            <div className="text-xs font-semibold text-purple-400 flex items-center gap-1">
              <Pin className="w-3 h-3" /> Pinned Messages
            </div>
            <div className="flex flex-row overflow-x-auto gap-2 pb-1 scrollbar-hide">
              {messages.filter(m => m.pinned).map(msg => (
                <div 
                  key={msg.id} 
                  onClick={() => scrollToMessage(msg.id)}
                  className="bg-white/5 hover:bg-white/10 cursor-pointer p-2 rounded-lg min-w-[200px] max-w-[250px] shrink-0 border border-white/5 transition-colors"
                >
                  <div className="text-[10px] text-white/40 mb-1 truncate">
                    {msg.sender_uid === currentUser?.uid ? 'You' : targetUser?.username || 'user'}
                  </div>
                  <div className="text-xs text-white/80 truncate">
                    {msg.deleted_for_all ? <span className="italic opacity-60">Message deleted</span> : getReplyPreview(msg)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#B8C0D0]">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">👋</span>
              </div>
              <p>No messages yet.</p>
              <p className="text-sm">Say hello to {targetUser?.username}!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_uid === currentUser?.uid;
              
              
              if (msg.deleted && isMine && !msg.deleted_for_all) return null; // Hide if deleted for me
              const isEditable = isMine && (!msg.message_type || msg.message_type === 'text') && !msg.file_url && !msg.voice_url && (new Date().getTime() - new Date(msg.created_at).getTime() < 15 * 60 * 1000) && !msg.deleted_for_all;


              const timeString = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={msg.id} id={`msg-${msg.id}`} 
                  onContextMenu={(e) => {
                    if (isEditable) {
                      e.preventDefault();
                      startEditing(msg);
                    }
                  }}
                  className={`flex gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMine && (
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/10 mt-auto mb-5">
                      {targetUser?.photoURL ? (
                        <img src={targetUser.photoURL} alt={targetUser.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/50 text-xs font-bold bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                          {targetUser?.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                  )}
                  
                  
                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[75%] group`}>
                    
                    <div className="flex items-center gap-2">
                      {isMine && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button onClick={() => setReplyingTo(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Reply className="w-4 h-4" />
                          </button>
                          {isEditable && (
                            <button onClick={() => startEditing(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => handlePin(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            {msg.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                          </button>
                          {!msg.deleted_for_all && (
                            <button onClick={() => setMessageToDelete(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          
                          <button onClick={() => setForwardingMessage(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Forward className="w-3.5 h-3.5" />
                          </button>
                          <ReactionPicker onSelect={(emoji) => handleReaction(msg.id, emoji, msg.reactions)} position="left" />
                        </div>
                      )}
                      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        
                        {msg.forwarded_from && (
                          <div className={`mb-1 px-3 py-1 rounded-xl text-[10px] flex items-center gap-1 max-w-sm ${isMine ? 'text-white/60 mr-1 justify-end' : 'text-white/60 ml-1'}`}>
                            <Forward className="w-3 h-3 shrink-0" />
                            <span className="truncate italic">Forwarded from {msg.forwarded_from}</span>
                          </div>
                        )}
                        {msg.reply_to && messages.find(m => m.id === msg.reply_to) && (
                          <div 
                            onClick={() => scrollToMessage(msg.reply_to!)}
                            className={`cursor-pointer mb-1 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 max-w-sm ${
                              isMine ? 'bg-white/10 text-white/70 mr-1' : 'bg-purple-500/20 text-purple-200 ml-1'
                            }`}
                          >
                            <Reply className="w-3 h-3 shrink-0" />
                            <span className="truncate">{getReplyPreview(messages.find(m => m.id === msg.reply_to)!)}</span>
                          </div>
                        )}
                        <div className={`px-4 py-2 rounded-2xl ${
                          isMine 
                            ? 'bg-purple-600 text-white rounded-br-none' 
                            : 'bg-white/10 text-white rounded-bl-none'
                        }`}>


                      
                      
                      {msg.message_type === 'voice' && (msg.voice_url || msg.file_url) ? (
                        <div className="mb-1">
                          <VoicePlayer url={msg.voice_url || msg.file_url} duration={msg.voice_duration} />
                        </div>
                      ) : msg.message_type === 'image' && (msg.voice_url || msg.file_url) ? (

                        <div className="mb-1 rounded-xl overflow-hidden max-w-sm">
                          <img src={msg.file_url} alt={msg.file_name || 'image'} className="w-full h-auto object-cover max-h-60" />
                        </div>
                      ) : msg.message_type === 'video' && (msg.voice_url || msg.file_url) ? (
                        <div className="mb-1 rounded-xl overflow-hidden max-w-sm bg-black">
                          <video src={msg.file_url} controls className="w-full max-h-60" />
                        </div>
                      ) : msg.message_type === 'audio' && (msg.voice_url || msg.file_url) ? (
                        <div className="mb-1 rounded-xl overflow-hidden max-w-sm">
                          <audio src={msg.file_url} controls className="w-full" />
                        </div>
                      ) : (msg.message_type === 'file' || (!msg.message_type && msg.file_url)) && (msg.voice_url || msg.file_url) ? (
                        <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/10 rounded-xl mb-1 hover:bg-white/20 transition-colors">
                          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate">{highlightText(msg.file_name || 'Attachment', searchQuery)}</span>
                            <span className="text-xs text-white/50">
                              {msg.file_size ? (msg.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'File'}
                            </span>
                          </div>
                          <Download className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                        </a>
                      ) : null}
                      {msg.content && <p className={`whitespace-pre-wrap break-words ${msg.deleted_for_all ? 'italic opacity-60' : ''}`}>{highlightText(msg.content, searchQuery)}</p>}
                        </div>
                      </div>
                      {!isMine && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <ReactionPicker onSelect={(emoji) => handleReaction(msg.id, emoji, msg.reactions)} position="right" />
                          <button onClick={() => setForwardingMessage(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Forward className="w-4 h-4" />
                          </button>
                          <button onClick={() => handlePin(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            {msg.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setReplyingTo(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Reply className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && currentUser && (
                      <div className={`${isMine ? 'mr-2' : 'ml-2'}`}>
                        <ReactionDisplay 
                          reactions={msg.reactions} 
                          currentUserId={currentUser.uid} 
                          onToggle={(emoji) => handleReaction(msg.id, emoji, msg.reactions)} 
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-1 mx-1">
                      <span className="text-[10px] text-white/40 flex items-center gap-1">{msg.pinned && <Pin className="w-2.5 h-2.5 text-purple-400" />}{timeString}{msg.edited && ' (Edited)'}</span>
                      
                      {isMine && (
                        <span className="text-[10px] text-white/40 ml-1">
                          • {msg.is_read ? '✓✓ Read' : (msg.delivered ? '✓✓ Delivered' : '✓ Sent')}
                        </span>
                      )}

                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {isTargetTyping && (
            <div className="flex gap-3 flex-row">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/10 mt-auto mb-5">
                 {targetUser?.photoURL ? (
                  <img src={targetUser.photoURL} alt={targetUser.username} className="w-full h-full object-cover" />
                 ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 text-xs font-bold bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                    {targetUser?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                 )}
              </div>
              <div className="flex flex-col items-start max-w-[75%]">
                <div className="px-4 py-3 bg-white/10 rounded-2xl rounded-bl-none flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />

        </div>

        
        {/* Input Area */}
        <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-md shrink-0">
          
          {editingMessageId && (
            <div className="max-w-4xl mx-auto w-full mb-2 bg-[#1A1D2D]/80 border border-white/10 rounded-xl p-3 flex items-start justify-between">
              <div className="flex flex-col min-w-0">
                <div className="text-xs text-purple-400 font-medium flex items-center gap-1.5 mb-1">
                  <Pencil className="w-3 h-3" />
                  Editing message
                </div>
              </div>
              <button 
                onClick={() => { setEditingMessageId(null); setNewMessage(''); }}
                className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {replyingTo && (
            <div className="max-w-4xl mx-auto w-full mb-2 bg-[#1A1D2D]/80 border border-white/10 rounded-xl p-3 flex items-start justify-between">
              <div className="flex flex-col min-w-0">
                <div className="text-xs text-purple-400 font-medium flex items-center gap-1.5 mb-1">
                  <Reply className="w-3 h-3" />
                  Replying to {replyingTo.sender_uid === currentUser?.uid ? 'yourself' : targetUser?.username || 'user'}
                </div>
                <div className="text-sm text-white/70 truncate">
                  {getReplyPreview(replyingTo)}
                </div>
              </div>
              <button 
                onClick={() => setReplyingTo(null)}
                className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          
          {sendError && (
            <div className="mb-2 max-w-4xl mx-auto w-full px-4 py-2 bg-red-500/20 text-red-300 text-sm rounded-lg flex items-center justify-between">
              <span>{sendError}</span>
              <button onClick={() => setSendError(null)}><X className="w-4 h-4" /></button>
            </div>
          )}
          {uploadError && (
            <div className="mb-2 max-w-4xl mx-auto w-full px-4 py-2 bg-red-500/20 text-red-300 text-sm rounded-lg flex items-center justify-between">
              <span>{uploadError}</span>
              <button onClick={() => setUploadError(null)}><X className="w-4 h-4" /></button>
            </div>
          )}
          {uploading && (
            <div className="mb-2 max-w-4xl mx-auto w-full px-4 py-2 bg-white/5 text-white/70 text-sm rounded-lg flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading... {uploadProgress > 10 ? uploadProgress + '%' : ''}</span>
            </div>
          )}
          
          {isRecordingVoice ? (
            <div className="flex max-w-4xl mx-auto w-full">
              <VoiceRecorder 
                onSend={handleVoiceSend} 
                onCancel={() => setIsRecordingVoice(false)} 
                disabled={uploading || sending}
              />
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto w-full">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelect} 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || sending}
                className="w-12 h-12 shrink-0 bg-white/5 hover:bg-white/10 text-[#B8C0D0] hover:text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <textarea 
                value={newMessage}
                onChange={(e) => { setNewMessage(e.target.value); handleTyping(e.target.value); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={`Message @${targetUser?.username || 'user'}...`}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 resize-none max-h-32 min-h-[48px]"
                rows={1}
              />
              {newMessage.trim() ? (
                <button 
                  type="submit"
                  disabled={uploading || sending}
                  className="w-12 h-12 shrink-0 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => setIsRecordingVoice(true)}
                  disabled={uploading || sending}
                  className="w-12 h-12 shrink-0 bg-white/5 hover:bg-white/10 text-[#B8C0D0] hover:text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </form>
          )}

        </div>
      </div>
    
      {/* Delete Confirmation Modal */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1A1D2D] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Delete Message</h3>
            <p className="text-white/70 mb-6 text-sm">Are you sure you want to delete this message?</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => handleDelete(true)}
                className="w-full py-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl font-medium transition-colors"
              >
                Delete for Everyone
              </button>
              <button 
                onClick={() => handleDelete(false)}
                className="w-full py-3 bg-white/5 text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
              >
                Delete for Me
              </button>
              <button 
                onClick={() => setMessageToDelete(null)}
                className="w-full py-3 mt-2 text-white/50 hover:text-white transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    
      {forwardingMessage && (
        <ForwardModal 
          message={forwardingMessage} 
          userProfiles={{ [targetUserId || '']: targetUser, [currentUser?.uid || '']: { username: currentUser?.displayName || currentUser?.email?.split('@')[0] } }} 
          onClose={() => setForwardingMessage(null)} 
        />
      )}
      {(reportingMessage || reportingUser) && (
        <ReportModal 
          reporterId={currentUser?.uid || ''}
          reporterUsername={currentUser?.displayName || currentUser?.email?.split('@')[0] || ''}
          reportedUserId={reportingMessage ? reportingMessage.sender_uid : targetUserId || ''}
          reportedUsername={reportingMessage ? (reportingMessage.sender_uid === targetUserId ? targetUser?.username || 'Unknown' : currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Unknown') : (targetUser?.username || 'Unknown')}
          messageId={reportingMessage?.id}
          messageContent={reportingMessage?.content}
          onClose={() => { setReportingMessage(null); setReportingUser(false); }}
        />
      )}
      {showSharedMedia && (
        <SharedMediaSidebar 
          messages={messages}
          userProfiles={{ [targetUserId || '']: targetUser, [currentUser?.uid || '']: { username: currentUser?.displayName || currentUser?.email?.split('@')[0] } }}
          currentUserId={currentUser?.uid || ''}
          onClose={() => setShowSharedMedia(false)}
        />
      )}
      </div>
    </DashboardLayout>
  );
}
