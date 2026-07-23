const fs = require('fs');

let content = fs.readFileSync('src/AdminPages.tsx', 'utf-8');

// Add imports
if (!content.includes('CheckCircle2')) {
  content = content.replace(/import {([^}]+)} from 'lucide-react';/, "import {$1, Check, Eye, CheckCircle2, User } from 'lucide-react';");
}

if (!content.includes('updateDoc')) {
  content = content.replace(/import {([^}]+)} from 'firebase\/firestore';/, "import {$1, updateDoc, serverTimestamp } from 'firebase/firestore';");
}

const adminRequestsPages = `
export function AdminUserRequestsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">User Requests</h1>
            <p className="text-sm text-[#B8C0D0] mt-1">Manage user account requests</p>
          </div>
        </div>
        <div className="bg-[#070b1a] border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No pending user requests.</h3>
          <p className="text-[#B8C0D0]">Check back later for new requests.</p>
        </div>
      </div>
    </AdminLayout>
  );
}

export function AdminBotRequestsPage() {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [rejectDialogBotId, setRejectDialogBotId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

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
    }, (error) => {
      // console.error suppressed
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePublish = async (botId: string) => {
    if (!auth.currentUser) return;
    try {
      const botRef = doc(db, 'bots', botId);
      await updateDoc(botRef, {
        status: "approved",
        approvedAt: serverTimestamp(),
        approvedBy: auth.currentUser.uid,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      // console.error suppressed
    }
  };

  const handleReject = async () => {
    if (!rejectDialogBotId || !auth.currentUser) return;
    try {
      const botRef = doc(db, 'bots', rejectDialogBotId);
      await updateDoc(botRef, {
        status: "rejected",
        rejectionReason: rejectReason,
        rejectedAt: serverTimestamp(),
        rejectedBy: auth.currentUser.uid,
        updatedAt: serverTimestamp()
      });
      setRejectDialogBotId(null);
      setRejectReason("");
    } catch (err) {
      // console.error suppressed
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full relative">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">Bot Requests</h1>
            <p className="text-sm text-[#B8C0D0] mt-1">Review and manage pending bots</p>
          </div>
        </div>

        {loading ? (
           <div className="text-center py-8 text-[#B8C0D0]">Loading...</div>
        ) : bots.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {bots.map(bot => (
              <div key={bot.id} className="bg-[#070b1a] border border-white/5 rounded-3xl p-6 relative overflow-hidden transition-all hover:border-white/10 flex flex-col group">
                 <div className="flex items-start gap-4 mb-4">
                    {bot.botImageURL ? (
                      <img src={bot.botImageURL} alt={bot.botName} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                        <Cpu className="w-6 h-6 text-white/20" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-white truncate pr-2">{bot.botName}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 shrink-0">
                          Pending
                        </span>
                      </div>
                      <a href={bot.botLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 transition-colors truncate block mb-2">{bot.botLink}</a>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {bot.category && <span className="px-2 py-1 bg-white/5 rounded-lg text-[#B8C0D0]">{bot.category}</span>}
                        {bot.accessType && <span className="px-2 py-1 bg-white/5 rounded-lg text-[#B8C0D0]">{bot.accessType}</span>}
                        {bot.botCurrency && <span className="px-2 py-1 bg-white/5 rounded-lg text-[#B8C0D0]">{bot.botCurrency}</span>}
                      </div>
                    </div>
                 </div>

                 {bot.description && (
                   <div className="mb-4">
                     <p className="text-sm text-[#B8C0D0] bg-white/5 rounded-xl p-3 border border-white/5 leading-relaxed line-clamp-3">{bot.description}</p>
                   </div>
                 )}

                 <div className="mt-auto grid grid-cols-2 gap-4 bg-[#050816] rounded-xl p-4 border border-white/5 mb-4">
                   <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                     <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                       {bot.ownerProfilePicture ? (
                         <img src={bot.ownerProfilePicture} alt={bot.ownerUsername} className="w-full h-full object-cover" />
                       ) : (
                         <User className="w-5 h-5 text-[#B8C0D0]" />
                       )}
                     </div>
                     <div className="min-w-0">
                       <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Publisher</p>
                       <p className="text-sm font-medium text-white truncate">{bot.ownerUsername}</p>
                     </div>
                   </div>
                   <div className="flex flex-col justify-center sm:items-end gap-1 col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-4">
                     <p className="text-[10px] text-gray-500 uppercase tracking-wider">Submitted</p>
                     <p className="text-xs text-[#B8C0D0]">
                       {bot.createdAt?.toDate ? bot.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                     </p>
                     <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Updated</p>
                     <p className="text-xs text-[#B8C0D0]">
                       {bot.updatedAt?.toDate ? bot.updatedAt.toDate().toLocaleDateString() : 'Unknown'}
                     </p>
                   </div>
                 </div>

                 <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                   <button 
                     onClick={() => handlePublish(bot.id)}
                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 hover:border-green-500/30 rounded-xl transition-all font-medium text-sm"
                   >
                     <Check className="w-4 h-4" /> Publish
                   </button>
                   <button 
                     onClick={() => setRejectDialogBotId(bot.id)}
                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all font-medium text-sm"
                   >
                     <X className="w-4 h-4" /> Reject
                   </button>
                   <a 
                     href={bot.botLink}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-medium text-sm"
                   >
                     <Eye className="w-4 h-4" /> View
                   </a>
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
            <p className="text-[#B8C0D0]">There are no pending bot requests to review.</p>
          </div>
        )}

        {rejectDialogBotId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setRejectDialogBotId(null); setRejectReason(""); }}></div>
            <div className="relative bg-[#070b1a] border border-red-500/20 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-xl font-bold text-white mb-2">Reject Bot Request</h3>
              <p className="text-sm text-[#B8C0D0] mb-6">Are you sure you want to reject this bot? You can optionally provide a reason.</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#B8C0D0] mb-2">Reason <span className="text-gray-500 text-xs font-normal ml-1">(Optional)</span></label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Broken link, inappropriate content..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => { setRejectDialogBotId(null); setRejectReason(""); }}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReject}
                  className="flex-1 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl transition-colors font-medium text-sm"
                >
                  Reject Bot
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
`;

fs.appendFileSync('src/AdminPages.tsx', adminRequestsPages);
console.log('Appended pages to AdminPages.tsx');
