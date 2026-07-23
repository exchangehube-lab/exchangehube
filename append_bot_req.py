import sys

content = """
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
"""

with open('src/AdminPages.tsx', 'a') as f:
    f.write(content)
