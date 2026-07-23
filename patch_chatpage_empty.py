import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

# 1. Add channelsLoading state
old_states = """  const [loading, setLoading] = useState(true);
  
  // Chats list states
  const [channels, setChannels] = useState<any[]>([]);"""

new_states = """  const [loading, setLoading] = useState(true);
  
  // Chats list states
  const [channels, setChannels] = useState<any[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);"""

content = content.replace(old_states, new_states)

# 2. Update channelsLoading in useEffect
old_channels_fetch = """  // Fetch joined channels
  useEffect(() => {
    if (!auth.currentUser) return;

    const channelsRef = collection(db, 'channels');
    const unsubChannels = onSnapshot(channelsRef, (snapshot) => {
      const fetchedChannels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const myChannels = fetchedChannels.filter((c: any) => c.members?.includes(auth.currentUser?.uid) && c.status === 'active');
      setChannels(myChannels);
    });

    return () => unsubChannels();
  }, []);"""

new_channels_fetch = """  // Fetch joined channels
  useEffect(() => {
    if (!auth.currentUser) return;

    const channelsRef = collection(db, 'channels');
    const unsubChannels = onSnapshot(channelsRef, (snapshot) => {
      const fetchedChannels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const myChannels = fetchedChannels.filter((c: any) => c.members?.includes(auth.currentUser?.uid) && c.status === 'active');
      setChannels(myChannels);
      setChannelsLoading(false);
    });

    return () => unsubChannels();
  }, []);"""

content = content.replace(old_channels_fetch, new_channels_fetch)

# 3. Add Empty State if channels.length === 0
old_layout_start = """  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-120px)] w-full gap-4 relative">"""

new_layout_start = """  if (channels.length === 0 && !channelsLoading && !channelId) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-white/5 bg-[#070b1a]/50 backdrop-blur-sm rounded-3xl p-8 text-center h-[calc(100vh-120px)]">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
            <Hash className="w-10 h-10 text-[#B8C0D0]/50" />
          </div>
          <h3 className="text-2xl font-medium text-white mb-2">No chats yet</h3>
          <p className="text-[#B8C0D0] mb-8">Join channels to start participating in conversations.</p>
          <button 
            onClick={() => navigate('/channels')}
            className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium text-[15px]"
          >
            Explore Channels
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-120px)] w-full gap-4 relative">"""

content = content.replace(old_layout_start, new_layout_start)

# 4. Remove ChatsPage route from App.tsx since we are using ChatPage for both
with open('src/ChatPage.tsx', 'w') as f:
    f.write(content)

with open('src/App.tsx', 'r') as f:
    app_content = f.read()

app_content = app_content.replace("import { ChatsPage } from './ChatsPage';", "")
app_content = app_content.replace('<Route path="/chat" element={<ChatsPage />} />', '<Route path="/chat" element={<ChatPage />} />')

with open('src/App.tsx', 'w') as f:
    f.write(app_content)

