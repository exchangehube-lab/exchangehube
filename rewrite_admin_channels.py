import sys

with open('src/AdminPages.tsx', 'r') as f:
    content = f.read()

import re

start_tag = "export function AdminChannelsPage() {"
# I will find the end of AdminChannelsPage
# Let's search for the next export function AdminNotificationsPage
end_tag = "export function AdminNotificationsPage() {"
start_idx = content.find(start_tag)
end_idx = content.find(end_tag)

old_component = content[start_idx:end_idx]

new_component = """export function AdminChannelsPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [deleteDialogChannelId, setDeleteDialogChannelId] = useState<string | null>(null);

  useEffect(() => {
    const channelsRef = collection(db, 'channels');
    const unsubscribe = onSnapshot(channelsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setChannels(data);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleStatus = async (channelId: string, currentStatus: string) => {
    if (!auth.currentUser) return;
    try {
      const channelRef = doc(db, 'channels', channelId);
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await updateDoc(channelRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialogChannelId || !auth.currentUser) return;
    try {
      const channelRef = doc(db, 'channels', deleteDialogChannelId);
      await deleteDoc(channelRef);
      setDeleteDialogChannelId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 w-full relative">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">Manage Channels</h1>
            <p className="text-sm text-[#B8C0D0] mt-1">Review, suspend, or delete channels</p>
          </div>
        </div>

        {loading ? (
           <div className="text-center py-8 text-[#B8C0D0]">Loading...</div>
        ) : channels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[1400px]:grid-cols-4 gap-8">
            {channels.map(channel => (
              <div key={channel.id} className="bg-[#070b1a] border border-white/5 rounded-3xl p-6 relative flex flex-col hover:border-purple-500/30 transition-colors">
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
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${channel.channelType === 'Public Channel' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {channel.channelType}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${channel.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {channel.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-[#B8C0D0] mb-4 flex-1 line-clamp-3">
                  {channel.channelBio}
                </p>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#B8C0D0]">Username</span>
                    <span className="text-white font-medium">{channel.channelUsername || 'N/A (Private)'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#B8C0D0]">Link</span>
                    <span className="text-purple-400 font-medium truncate max-w-[150px]">{channel.channelLink}</span>
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
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl transition-all font-medium text-sm ${channel.status === 'active' ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/20 hover:border-orange-500/30' : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20 hover:border-green-500/30'}`}
                  >
                    {channel.status === 'active' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    {channel.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </button>
                  <button 
                    onClick={() => setDeleteDialogChannelId(channel.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all font-medium text-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#070b1a] border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
            <h3 className="text-xl font-medium text-white mb-2">No Channels Found</h3>
            <p className="text-[#B8C0D0]">There are no channels to display.</p>
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

"""

new_content = content[:start_idx] + new_component + content[end_idx:]

with open('src/AdminPages.tsx', 'w') as f:
    f.write(new_content)
