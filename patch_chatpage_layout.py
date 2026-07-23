import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

# Add the chat list to ChatPage
# First, update imports and states
old_imports = """import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, arrayUnion, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { auth, db } from './firebase';
import { DashboardLayout } from './DashboardPages';
import { Send, ArrowLeft, Image as ImageIcon, Hash, Lock, Search, Users, Shield, Smile, Paperclip } from 'lucide-react';

export function ChatPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);"""

new_imports = """import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, arrayUnion, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { auth, db } from './firebase';
import { DashboardLayout } from './DashboardPages';
import { Send, ArrowLeft, Image as ImageIcon, Hash, Lock, Search, Users, Shield, Smile, Paperclip, SearchX } from 'lucide-react';

export function ChatPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Chats list states
  const [channels, setChannels] = useState<any[]>([]);
  const [lastMessages, setLastMessages] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch joined channels
  useEffect(() => {
    if (!auth.currentUser) return;

    const channelsRef = collection(db, 'channels');
    const unsubChannels = onSnapshot(channelsRef, (snapshot) => {
      const fetchedChannels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const myChannels = fetchedChannels.filter((c: any) => c.members?.includes(auth.currentUser?.uid) && c.status === 'active');
      setChannels(myChannels);
    });

    return () => unsubChannels();
  }, []);

  // Fetch last messages for channels
  useEffect(() => {
    if (channels.length === 0) return;

    const unsubscribers: (() => void)[] = [];

    channels.forEach(ch => {
      const msgsRef = collection(db, 'channels', ch.id, 'messages');
      const q = query(msgsRef, orderBy('createdAt', 'desc'), limit(1));
      
      const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const msgDoc = snapshot.docs[0];
          setLastMessages(prev => ({
            ...prev,
            [ch.id]: { id: msgDoc.id, ...msgDoc.data() }
          }));
        }
      });
      unsubscribers.push(unsub);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [channels]);

  const sortedChannels = React.useMemo(() => {
    return [...channels].sort((a, b) => {
      const timeA = lastMessages[a.id]?.createdAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
      const timeB = lastMessages[b.id]?.createdAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    });
  }, [channels, lastMessages]);

  const filteredChannels = sortedChannels.filter(c => 
    c.channelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.channelUsername && c.channelUsername.toLowerCase().includes(searchTerm.toLowerCase()))
  );"""

content = content.replace(old_imports, new_imports)


# Replace layout
old_layout = """  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] w-full gap-6 relative">
        
        {/* Main Chat Area */}
        <div className="flex-1 bg-[#070b1a] border border-white/5 rounded-3xl overflow-hidden flex flex-col relative z-10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">"""

new_layout = """  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-120px)] w-full gap-4 relative">
        
        {/* Left Sidebar: Chats List (Hidden on mobile when chat is active) */}
        <div className={`w-full md:w-[320px] lg:w-[360px] bg-[#070b1a] border border-white/5 rounded-3xl overflow-hidden flex flex-col shrink-0 ${channelId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-white/5 bg-[#050816]/50">
            <h2 className="text-xl font-display font-bold text-white mb-4">Chats</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8C0D0]" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search chats..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {filteredChannels.length === 0 ? (
                <div className="p-8 text-center text-[#B8C0D0] flex flex-col items-center">
                  <SearchX className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-sm">No chats found</p>
                </div>
            ) : (
              filteredChannels.map(c => {
                const lastMsg = lastMessages[c.id];
                let msgPreview = "No messages yet";
                let msgTime = "";
                let isOwnMessage = false;

                if (lastMsg) {
                  isOwnMessage = lastMsg.senderId === auth.currentUser?.uid;
                  msgPreview = lastMsg.text;
                  if (lastMsg.createdAt?.toDate) {
                    const date = lastMsg.createdAt.toDate();
                    const now = new Date();
                    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    if (isToday) {
                      msgTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    } else {
                      msgTime = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    }
                  }
                }

                const isActive = c.id === channelId;

                return (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/channels/${c.id}/chat`)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left group ${isActive ? 'bg-purple-600/20 border-purple-500/30 border' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                      {c.channelImageURL ? (
                        <img src={c.channelImageURL} alt={c.channelName} className="w-full h-full object-cover" />
                      ) : (
                        <Hash className="w-5 h-5 text-purple-400" />
                      )}
                      {c.channelType === 'Private Channel' && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-gray-900 rounded-full flex items-center justify-center border border-white/10">
                          <Lock className="w-2 h-2 text-[#B8C0D0]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="text-[14px] font-bold text-white truncate pr-2">{c.channelName}</h3>
                        <span className="text-[10px] text-[#B8C0D0] whitespace-nowrap shrink-0">{msgTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] text-[#B8C0D0] truncate pr-2">
                          {lastMsg && (
                            <span className={isOwnMessage ? "text-purple-400 font-medium" : "text-white/70 font-medium"}>
                              {isOwnMessage ? 'You: ' : `${lastMsg.senderName}: `}
                            </span>
                          )}
                          {msgPreview}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 bg-[#070b1a] border border-white/5 rounded-3xl overflow-hidden flex flex-col relative z-10 shadow-[0_0_40px_rgba(0,0,0,0.5)] ${!channelId ? 'hidden md:flex' : 'flex'}`}>"""

content = content.replace(old_layout, new_layout)

# Update back button in ChatHeader
old_back = """<button onClick={() => navigate('/channels')} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>"""

new_back = """<button onClick={() => navigate('/chat')} className="md:hidden p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>"""

content = content.replace(old_back, new_back)

with open('src/ChatPage.tsx', 'w') as f:
    f.write(content)

