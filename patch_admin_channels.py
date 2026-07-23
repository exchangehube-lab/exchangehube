import sys

with open('src/AdminPages.tsx', 'r') as f:
    content = f.read()

# Replace AdminChannelsPage
old_channels_page = """export function AdminChannelsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-display font-bold text-white">Channels</h1>
        <p className="text-gray-400">Channels coming soon.</p>
      </div>
    </AdminLayout>
  );
}"""

new_channels_page = """export function AdminChannelsPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [rejectDialogChannelId, setRejectDialogChannelId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const channelsRef = collection(db, 'channels');
    const q = query(channelsRef, where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
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

  const handlePublish = async (channelId: string) => {
    if (!auth.currentUser) return;
    try {
      const channelRef = doc(db, 'channels', channelId);
      await updateDoc(channelRef, {
        status: "approved",
        approvedAt: serverTimestamp(),
        approvedBy: auth.currentUser.uid,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!rejectDialogChannelId || !auth.currentUser) return;
    try {
      const channelRef = doc(db, 'channels', rejectDialogChannelId);
      await updateDoc(channelRef, {
        status: "rejected",
        rejectionReason: rejectReason,
        rejectedAt: serverTimestamp(),
        rejectedBy: auth.currentUser.uid,
        updatedAt: serverTimestamp()
      });
      setRejectDialogChannelId(null);
      setRejectReason("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 w-full relative">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">Channel Requests</h1>
            <p className="text-sm text-[#B8C0D0] mt-1">Review and manage pending channels</p>
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
                  <div>
                    <h3 className="text-lg font-medium text-white line-clamp-1">{channel.channelName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${channel.channelType === 'Public Channel' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {channel.channelType}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-[#B8C0D0] mb-6 flex-1 line-clamp-3">
                  {channel.channelBio}
                </p>
                
                <a 
                  href={channel.channelLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2 mb-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  Verify Link <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handlePublish(channel.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 hover:border-green-500/30 rounded-xl transition-all font-medium text-sm"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button 
                    onClick={() => setRejectDialogChannelId(channel.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all font-medium text-sm"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#070b1a] border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400/50" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">All caught up!</h3>
            <p className="text-[#B8C0D0]">There are no pending channel requests to review.</p>
          </div>
        )}

        {rejectDialogChannelId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setRejectDialogChannelId(null); setRejectReason(""); }}></div>
            <div className="relative bg-[#070b1a] border border-red-500/20 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-xl font-bold text-white mb-2">Reject Channel Request</h3>
              <p className="text-sm text-[#B8C0D0] mb-6">Are you sure you want to reject this channel? You can optionally provide a reason.</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Reason <span className="text-gray-500 text-xs font-normal ml-1">(Optional)</span></label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Invalid link, inappropriate content..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => { setRejectDialogChannelId(null); setRejectReason(""); }}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReject}
                  className="flex-1 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl transition-colors font-medium text-sm"
                >
                  Reject Channel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}"""

if old_channels_page in content:
    content = content.replace(old_channels_page, new_channels_page)
    with open('src/AdminPages.tsx', 'w') as f:
        f.write(content)
    print("Replaced AdminChannelsPage")
else:
    print("AdminChannelsPage not found or already modified")
    
