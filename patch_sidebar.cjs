const fs = require('fs');

let content = fs.readFileSync('src/DashboardPages.tsx', 'utf8');

// Add state for joinedChannels
const targetState = `  const [isAuthChecking, setIsAuthChecking] = useState(true);`;
const replacementState = `  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [joinedChannels, setJoinedChannels] = useState<any[]>([]);`;

if (content.includes(targetState)) {
  content = content.replace(targetState, replacementState);
} else {
  console.log("Could not find target state");
}

// Add effect for fetching joined channels
const targetEffect = `  useEffect(() => {
    if (!user) return;
    const handleVisibilityChange = () => {`;
    
const replacementEffect = `  useEffect(() => {
    if (!user) return;
    
    const channelsRef = collection(db, 'channels');
    const q = query(channelsRef, where('members', 'array-contains', user.uid), where('status', '==', 'active'));
    
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
    const handleVisibilityChange = () => {`;

if (content.includes(targetEffect)) {
  content = content.replace(targetEffect, replacementEffect);
} else {
  console.log("Could not find target effect");
}

// Add joinedChannels rendering to desktop sidebar
const targetDesktop = `          })}
        </div>
        <div className="p-6 border-t border-white/5">`;
        
const replacementDesktop = `          })}
          
          {joinedChannels.length > 0 && (
            <div className="mt-4 border-t border-white/5 pt-4">
              <div className="px-4 mb-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">Joined Channels</div>
              {joinedChannels.map(channel => (
                <button 
                  key={channel.id}
                  onClick={() => navigate(\`/channels/\${channel.id}/chat\`)}
                  className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all \${location.pathname === \`/channels/\${channel.id}/chat\` ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-[#B8C0D0] hover:bg-white/5 hover:text-white border border-transparent'}\`}
                >
                  <Hash className={\`w-4 h-4 \${location.pathname === \`/channels/\${channel.id}/chat\` ? 'text-purple-400' : 'opacity-50'}\`} />
                  <span className="font-medium text-sm truncate">{channel.channelName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-white/5">`;

if (content.includes(targetDesktop)) {
  content = content.replace(targetDesktop, replacementDesktop);
} else {
  console.log("Could not find target desktop");
}

fs.writeFileSync('src/DashboardPages.tsx', content);
console.log("Success DashboardPages");
