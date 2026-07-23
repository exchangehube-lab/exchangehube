import React, { useState, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { personalMessageService } from '../messaging/services/personalMessageService';
import { channelMessageService } from '../messaging/services/channelMessageService';
import { ChannelMessage, PersonalMessage } from '../messaging/types';

interface ForwardModalProps {
  message: ChannelMessage | PersonalMessage;
  onClose: () => void;
  userProfiles: Record<string, any>;
}

export function ForwardModal({ message, onClose, userProfiles }: ForwardModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [channels, setChannels] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchTargets = async () => {
      if (!currentUser) return;
      try {
        // Fetch channels user is a member of
        const channelsSnap = await getDocs(query(collection(db, 'channels'), where("status", "==", "active")));
        const userChannels = channelsSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((c: any) => c.members?.includes(currentUser.uid));
        setChannels(userChannels);

        // Fetch users
        const usersSnap = await getDocs(collection(db, 'users'));
        const allUsers = usersSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => u.id !== currentUser.uid);
        setUsers(allUsers);
      } catch (err) {
        console.error("Error fetching forward targets:", err);
      }
    };
    fetchTargets();
  }, [currentUser]);

  const filteredChannels = channels.filter(c => 
    c.channelName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.channelUsername?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleForward = async () => {
    if (selectedIds.size === 0 || !currentUser) return;
    setSending(true);

    try {
      // Determine the forwarded_from text
      // We will store the original sender's ID, or maybe their username.
      const originalSenderProfile = userProfiles[message.sender_uid];
      const forwardedFromName = originalSenderProfile ? originalSenderProfile.username : 'Unknown user';

      const forwardData = {
        content: message.content,
        message_type: message.message_type,
        file_url: message.file_url,
        file_name: message.file_name,
        file_size: message.file_size,
        thumbnail_url: message.thumbnail_url,
        voice_url: message.voice_url,
        voice_duration: message.voice_duration,
        forwarded_from: forwardedFromName,
        sender_uid: currentUser.uid
      };

      for (const id of Array.from(selectedIds) as string[]) {
        if (channels.some(c => c.id === id)) {
          // Forward to channel
          await channelMessageService.sendMessage({
            ...forwardData,
            channel_id: id as string
          });
        } else {
          // Forward to personal chat
          await personalMessageService.sendMessage({
            ...forwardData,
            conversation_id: currentUser.uid < id ? `${currentUser.uid}_${id}` : `${id}_${currentUser.uid}`,
          });
        }
      }
      onClose();
    } catch (err) {
      console.error("Failed to forward:", err);
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#1A1D2D] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl flex flex-col h-[80vh] md:h-[600px]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-white">Forward Message</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Search chats and channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {filteredChannels.length > 0 && (
            <div className="mb-4">
              <div className="px-2 py-1 text-xs font-semibold text-white/40 uppercase tracking-wider">Channels</div>
              {filteredChannels.map(channel => (
                <div 
                  key={channel.id} 
                  onClick={() => toggleSelect(channel.id)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 overflow-hidden shrink-0">
                    {channel.channelImageURL ? (
                      <img src={channel.channelImageURL} alt={channel.channelName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50 font-bold bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                        {channel.channelName?.charAt(0).toUpperCase() || '#'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{channel.channelName}</h4>
                    {channel.channelUsername && <p className="text-xs text-white/40 truncate">@{channel.channelUsername}</p>}
                  </div>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${selectedIds.has(channel.id) ? 'bg-purple-500 border-purple-500' : 'border-white/20'}`}>
                    {selectedIds.has(channel.id) && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredUsers.length > 0 && (
            <div>
              <div className="px-2 py-1 text-xs font-semibold text-white/40 uppercase tracking-wider">Users</div>
              {filteredUsers.map(user => (
                <div 
                  key={user.id} 
                  onClick={() => toggleSelect(user.id)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0">
                    {(user.profilePhotoURL || user.profilePicture) ? (
                      <img src={user.profilePhotoURL || user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50 font-bold bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{user.fullName || user.username}</h4>
                    <p className="text-xs text-white/40 truncate">@{user.username}</p>
                  </div>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${selectedIds.has(user.id) ? 'bg-purple-500 border-purple-500' : 'border-white/20'}`}>
                    {selectedIds.has(user.id) && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedIds.size > 0 && (
          <div className="p-4 border-t border-white/10 shrink-0">
            <button
              onClick={handleForward}
              disabled={sending}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                `Forward to ${selectedIds.size} ${selectedIds.size === 1 ? 'chat' : 'chats'}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
